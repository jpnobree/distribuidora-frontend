import { useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import ProductRow from '../components/ProductRow'
import ProductModal from '../components/ProductModal'
import CatalogStatus from '../components/CatalogStatus'
import { useCatalog } from '../context/CatalogContext'

export default function Home() {
  const [selected, setSelected] = useState(null)
  const { products, categories, loading, error, reload } = useCatalog()

  return (
    <>
      <Hero />

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
        <CatalogStatus loading={loading} error={error} onRetry={reload}>
          {categories.map((cat) => {
            const items = products.filter((p) => p.category === cat.slug)
            if (items.length === 0) return null

            return (
              <section key={cat.slug}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </h2>
                  <Link
                    to={`/catalogo?categoria=${cat.slug}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Ver todos →
                  </Link>
                </div>
                <ProductRow products={items.slice(0, 8)} onSelect={setSelected} />
              </section>
            )
          })}
        </CatalogStatus>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  )
}
