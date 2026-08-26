import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import config from '../config'

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
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/api/products`),
        fetch(`${config.apiBaseUrl}/api/categories`),
      ])

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('resposta invalida do servidor')
      }

      setProducts(await productsRes.json())
      setCategories(await categoriesRes.json())
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
    let response
    try {
      response = await fetch(`${config.apiBaseUrl}/api/products/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    }

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Sua sessão expirou ou você não tem permissão para editar produtos.'
          : 'Não foi possível salvar as alterações. Tente novamente.'
      )
    }

    const updated = await response.json()
    setProducts((prev) => prev.map((p) => (p.id === slug ? updated : p)))
    return updated
  }, [])

  const createProduct = useCallback(async (payload, token) => {
    let response
    try {
      response = await fetch(`${config.apiBaseUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    }

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Sua sessão expirou ou você não tem permissão para criar produtos.'
          : response.status === 409
            ? 'Já existe um produto com esse identificador. Escolha outro.'
            : 'Não foi possível criar o produto. Tente novamente.'
      )
    }

    const created = await response.json()
    setProducts((prev) => [...prev, created])
    return created
  }, [])

  const uploadImage = useCallback(async (file, token) => {
    const body = new FormData()
    body.append('file', file)

    let response
    try {
      response = await fetch(`${config.apiBaseUrl}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Sua sessão expirou ou você não tem permissão para enviar imagens.'
          : data?.error || 'Não foi possível enviar a imagem. Tente novamente.'
      )
    }

    const data = await response.json()
    return data.url
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

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog precisa ser usado dentro de um <CatalogProvider>')
  }
  return context
}
