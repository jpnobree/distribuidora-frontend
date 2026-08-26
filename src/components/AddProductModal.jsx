import { X } from 'lucide-react'
import ProductForm from './ProductForm'

export default function AddProductModal({ onClose, onCreated }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-surface p-6 sm:max-w-2xl sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Novo produto</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <ProductForm onCancel={onClose} onSaved={onCreated} />
      </div>
    </div>
  )
}
