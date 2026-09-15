import ProductImage from './ProductImage'
import { formatPrice } from '../utils/format'

export default function ProductCard({ product, onSelect }) {
  const { name, sku, unit, price, tags, image, available } = product

  return (
    <button
      onClick={() => onSelect(product)}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <ProductImage src={image} name={name} className="h-40 w-full" />

        {/* etiqueta de caixote — o SKU "preso" no canto do card */}
        <div className="crate-tag absolute left-0 top-0 bg-ink/85 px-2.5 py-1 pr-3">
          <span className="font-mono text-[11px] tracking-wide text-white/90">#{sku}</span>
        </div>

        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="rounded bg-surface px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              Indisponível
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-lg font-medium leading-tight text-ink group-hover:text-accent">
          {name}
        </h3>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5 pt-1">
          <span className="font-mono text-sm text-ink">{formatPrice(price, unit)}</span>
          <span className="text-xs font-medium text-muted underline-offset-2 group-hover:text-accent group-hover:underline">
            Ver detalhes
          </span>
        </div>
      </div>
    </button>
  )
}
