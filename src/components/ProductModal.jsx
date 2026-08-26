import { useEffect, useState } from 'react'
import { X, MessageCircle, Pencil } from 'lucide-react'
import ProductImage from './ProductImage'
import ProductEditForm from './ProductEditForm'
import { formatPrice, whatsappLink } from '../utils/format'
import config from '../config'
import { useCatalog } from '../context/CatalogContext'
import { useAuth } from '../context/AuthContext'

export default function ProductModal({ product, onClose }) {
  const { categories } = useCatalog()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setEditing(false)
  }, [product])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!product) return null

  const category = categories.find((c) => c.slug === product.category)
  const link = whatsappLink(config.whatsappNumber, product.name)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-surface sm:max-w-2xl sm:rounded-xl"
      >
        <div className="relative">
          <ProductImage src={product.image} name={product.name} className="h-56 w-full sm:h-64" />
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 rounded-full bg-ink/70 p-1.5 text-white hover:bg-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {editing ? (
            <ProductEditForm
              product={product}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false)
                onClose()
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
                    {category.icon} {category.name}
                  </span>
                )}
                {product.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div>
                <h2 className="font-display text-3xl font-semibold text-ink">{product.name}</h2>
                <p className="font-mono text-xs text-muted">SKU #{product.sku}</p>
              </div>

              <p className="text-sm leading-relaxed text-ink/80">{product.description}</p>

              <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
                <div>
                  <dt className="text-muted">Preço</dt>
                  <dd className="font-mono font-medium text-ink">
                    {formatPrice(product.price, product.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Origem</dt>
                  <dd className="font-medium text-ink">{product.origin || '—'}</dd>
                </div>
              </dl>

              {isAdmin ? (
                <button type="button" onClick={() => setEditing(true)} className="btn-primary">
                  <Pencil size={16} />
                  Editar produto
                </button>
              ) : product.available ? (
                link && (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <MessageCircle size={16} />
                    Solicitar orçamento
                  </a>
                )
              ) : (
                <p className="rounded-md bg-ink/5 px-3 py-2 text-sm font-medium text-muted">
                  Produto indisponível no momento.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
