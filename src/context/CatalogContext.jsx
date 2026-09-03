import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../api/client'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch {
      setError('Não foi possível carregar o catálogo. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateProduct = useCallback(async (slug, payload, token) => {
    let updated
    try {
      updated = await api.put(`/api/products/${slug}`, payload, { token })
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(err, 'Sua sessão expirou ou você não tem permissão para editar produtos.') ??
          'Não foi possível salvar as alterações. Tente novamente.'
      )
    }
    setProducts((prev) => prev.map((p) => (p.id === slug ? updated : p)))
    return updated
  }, [])

  const createProduct = useCallback(async (payload, token) => {
    let created
    try {
      created = await api.post('/api/products', payload, { token })
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(err, 'Sua sessão expirou ou você não tem permissão para criar produtos.') ??
          (err instanceof ApiError && err.status === 409
            ? 'Já existe um produto com esse identificador. Escolha outro.'
            : 'Não foi possível criar o produto. Tente novamente.')
      )
    }
    setProducts((prev) => [...prev, created])
    return created
  }, [])

  const uploadImage = useCallback(async (file, token) => {
    const body = new FormData()
    body.append('file', file)

    try {
      const data = await api.post('/api/uploads', body, { token, isFormData: true })
      return data.url
    } catch (err) {
      throw new Error(
        authOrNetworkMessage(err, 'Sua sessão expirou ou você não tem permissão para enviar imagens.') ??
          (err instanceof ApiError && err.data?.error) ??
          'Não foi possível enviar a imagem. Tente novamente.'
      )
    }
  }, [])

  const value = {
    products,
    categories,
    loading,
    error,
    reload: load,
    updateProduct,
    createProduct,
    uploadImage,
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// Mensagem compartilhada pelas acoes de ADMIN: rede fora do ar ou sessao sem
// permissao (401/403). Devolve null quando nao se aplica, para o chamador
// decidir a mensagem especifica daquele endpoint.
function authOrNetworkMessage(err, forbiddenMessage) {
  if (!(err instanceof ApiError)) return null
  if (err.status === 0) return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
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
