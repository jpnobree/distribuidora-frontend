import { useMemo, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, ChevronDown } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '../components/EmptyState'
import ProductModal from '../components/ProductModal'
import AddProductModal from '../components/AddProductModal'
import CatalogStatus from '../components/CatalogStatus'
import { useCatalog } from '../context/CatalogContext'
import { useAuth } from '../context/AuthContext'

function sortProducts(list, sort) {
  const sorted = [...list]
  switch (sort) {
    case 'nome-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    case 'preco-menor':
      return sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    case 'preco-maior':
      return sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
    default:
      return sorted
  }
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const { products, categories, loading, error, reload, hasMore, loadingMore, loadMore } =
    useCatalog()
  const { isAdmin } = useAuth()

  const activeCategory = searchParams.get('categoria') || ''
  const search = searchParams.get('busca') || ''
  const sort = searchParams.get('ordenar') || 'relevancia'
  const onlyAvailable = searchParams.get('disponivel') === '1'
  const activeTags = useMemo(
    () => (searchParams.get('tags') ? searchParams.get('tags').split(',') : []),
    [searchParams],
  )

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) next.delete(key)
        else next.set(key, value)
      })
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const categoryProducts = useMemo(
    () => (activeCategory ? products.filter((p) => p.category === activeCategory) : products),
    [activeCategory, products],
  )

  const allTags = useMemo(
    () => [...new Set(categoryProducts.flatMap((p) => p.tags || []))].sort(),
    [categoryProducts],
  )

  const filtered = useMemo(() => {
    let list = categoryProducts

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }

    if (activeTags.length > 0) {
      list = list.filter((p) => activeTags.every((tag) => p.tags?.includes(tag)))
    }

    if (onlyAvailable) {
      list = list.filter((p) => p.available)
    }

    return sortProducts(list, sort)
  }, [categoryProducts, search, activeTags, onlyAvailable, sort])

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name

  // Busca, categoria, tags e "somente disponiveis" filtram sobre `products`,
  // que so contem as paginas ja buscadas do backend (useInfiniteQuery). Sem
  // isso, um produto que exista mas ainda nao tenha sido paginado pareceria
  // "nao encontrado" so por nao ter sido carregado ainda. Enquanto algum
  // desses filtros estiver ativo, busca automaticamente o resto do catalogo
  // para que o filtro sempre opere sobre o catalogo inteiro.
  const filtersActive = Boolean(
    activeCategory || search.trim() || activeTags.length > 0 || onlyAvailable,
  )

  useEffect(() => {
    if (filtersActive && hasMore && !loadingMore) {
      loadMore()
    }
  }, [filtersActive, hasMore, loadingMore, loadMore])

  function toggleTag(tag) {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    updateParams({ tags: next.join(',') })
  }

  function clearFilters() {
    setSearchParams(activeCategory ? { categoria: activeCategory } : {}, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {activeCategoryName || 'Todos os produtos'}
        </h1>
        {isAdmin && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={16} />
            Adicionar produto
          </button>
        )}
      </div>

      <CatalogStatus loading={loading} error={error} onRetry={reload}>
        <FilterBar
          search={search}
          onSearchChange={(value) => updateParams({ busca: value })}
          allTags={allTags}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          sort={sort}
          onSortChange={(value) => updateParams({ ordenar: value })}
          onlyAvailable={onlyAvailable}
          onToggleOnlyAvailable={() => updateParams({ disponivel: onlyAvailable ? '' : '1' })}
          resultCount={filtered.length}
        />

        <div className="pt-6">
          {filtersActive && hasMore ? (
            <p className="py-16 text-center text-sm text-muted">Buscando em todo o catálogo...</p>
          ) : filtered.length > 0 ? (
            <ProductGrid products={filtered} onSelect={setSelected} />
          ) : (
            <EmptyState onClear={clearFilters} />
          )}
        </div>

        {!filtersActive && hasMore && (
          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => loadMore()}
              disabled={loadingMore}
              className="btn-secondary"
            >
              <ChevronDown size={16} />
              {loadingMore ? 'Carregando...' : 'Carregar mais produtos'}
            </button>
          </div>
        )}
      </CatalogStatus>

      <ProductModal product={selected} onClose={() => setSelected(null)} />

      {creating && (
        <AddProductModal onClose={() => setCreating(false)} onCreated={() => setCreating(false)} />
      )}
    </div>
  )
}
