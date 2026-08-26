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

  const value = { products, categories, loading, error, reload: load }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog precisa ser usado dentro de um <CatalogProvider>')
  }
  return context
}
