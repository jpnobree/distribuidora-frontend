import { RefreshCw } from 'lucide-react'
import ProductGridSkeleton from './ProductGridSkeleton'

// Estado de carregamento/erro compartilhado pelas telas que dependem do
// catálogo vindo da API (Home e Catalog).
export default function CatalogStatus({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando catálogo...</span>
        <ProductGridSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={onRetry} className="btn-secondary">
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    )
  }

  return children
}
