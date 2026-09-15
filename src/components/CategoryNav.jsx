import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'

export default function CategoryNav() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { categories } = useCatalog()
  const activeCategory = location.pathname === '/catalogo' ? searchParams.get('categoria') : null

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="scroll-row mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
        <Link
          to="/catalogo"
          aria-current={!activeCategory ? 'page' : undefined}
          className={`category-pill ${!activeCategory ? 'is-active' : ''}`}
        >
          Todos os produtos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/catalogo?categoria=${cat.slug}`}
            aria-current={activeCategory === cat.slug ? 'page' : undefined}
            className={`category-pill ${activeCategory === cat.slug ? 'is-active' : ''}`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
