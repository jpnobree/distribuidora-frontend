import { createContext, useContext } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../api/client'

const CatalogContext = createContext(null)

// Tamanho de pagina do catalogo. O backend aceita paginacao real
// (GET /api/products?page=&size=); aqui pedimos um pouco mais que o
// catalogo atual costuma ter, entao no dia a dia tudo cabe na primeira
// pagina - mas assim que o catalogo passar disso, o botao "Carregar mais"
// (ver Catalog.jsx) busca o resto sem recarregar a pagina.
const PAGE_SIZE = 24

export function CatalogProvider({ children }) {
  const queryClient = useQueryClient()

  const productsQuery = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => api.get(`/api/products?page=${pageParam}&size=${PAGE_SIZE}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories'),
  })

  const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: ['products'] })

  const updateProductMutation = useMutation({
    mutationFn: ({ slug, payload, token }) => api.put(`/api/products/${slug}`, payload, { token }),
    onSuccess: invalidateProducts,
  })

  const createProductMutation = useMutation({
    mutationFn: ({ payload, token }) => api.post('/api/products', payload, { token }),
    onSuccess: invalidateProducts,
  })

  async function updateProduct(slug, payload, token) {
    try {
      return await updateProductMutation.mutateAsync({ slug, payload, token })
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(
          err,
          'Sua sessão expirou ou você não tem permissão para editar produtos.',
        ) ?? 'Não foi possível salvar as alterações. Tente novamente.',
      )
    }
  }

  async function createProduct(payload, token) {
    try {
      return await createProductMutation.mutateAsync({ payload, token })
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(
          err,
          'Sua sessão expirou ou você não tem permissão para criar produtos.',
        ) ??
          (err instanceof ApiError && err.status === 409
            ? 'Já existe um produto com esse identificador. Escolha outro.'
            : 'Não foi possível criar o produto. Tente novamente.'),
      )
    }
  }

  async function uploadImage(file, token) {
    const body = new FormData()
    body.append('file', file)
    try {
      const data = await api.post('/api/uploads', body, { token, isFormData: true })
      return data.url
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(
          err,
          'Sua sessão expirou ou você não tem permissão para enviar imagens.',
        ) ??
          (err instanceof ApiError && err.data?.error) ??
          'Não foi possível enviar a imagem. Tente novamente.',
      )
    }
  }

  async function deleteProduct(slug, token) {
    try {
      await api.delete(`/api/products/${slug}`, { token })
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(
          err,
          'Sua sessão expirou ou você não tem permissão para remover produtos.',
        ) ?? 'Não foi possível remover o produto. Tente novamente.',
      )
    }
    invalidateProducts()
  }

  const products = productsQuery.data?.pages.flatMap((page) => page.content) ?? []
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading

  // TanStack Query (networkMode: 'online', o padrao) "pausa" a query em vez
  // de marcar como erro quando acha que o navegador esta offline - nesse
  // caso, tanto isLoading quanto isError ficam false (fetchStatus="paused",
  // status="pending"), e sem esse cuidado a tela renderiza como se o
  // catalogo tivesse 0 produtos de verdade, escondendo o problema real.
  const isStuckOffline = (query) => query.status === 'pending' && query.fetchStatus === 'paused'
  const isError =
    productsQuery.isError ||
    categoriesQuery.isError ||
    isStuckOffline(productsQuery) ||
    isStuckOffline(categoriesQuery)

  const value = {
    products,
    categories: categoriesQuery.data ?? [],
    loading: isLoading,
    error: isError
      ? 'Não foi possível carregar o catálogo. Verifique sua conexão ou se o backend está rodando.'
      : '',
    reload: () => {
      productsQuery.refetch()
      categoriesQuery.refetch()
    },
    updateProduct,
    createProduct,
    uploadImage,
    deleteProduct,
    hasMore: Boolean(productsQuery.hasNextPage),
    loadingMore: productsQuery.isFetchingNextPage,
    loadMore: productsQuery.fetchNextPage,
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// Mensagem compartilhada pelas acoes de ADMIN: rede fora do ar ou sessao sem
// permissao (401/403). Devolve null quando nao se aplica, para o chamador
// decidir a mensagem especifica daquele endpoint.
function authOrNetworkMessage(err, forbiddenMessage) {
  if (!(err instanceof ApiError)) return null
  if (err.status === 0)
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
  if (err.status === 401 || err.status === 403) return forbiddenMessage
  return null
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog precisa ser usado dentro de um <CatalogProvider>')
  }
  return context
}
