import { useRef, useState } from 'react'
import { Save, X, Upload, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useToast } from '../context/ToastContext'
import ProductImage from './ProductImage'

// 5MB - so limita o que a UI aceita antes de gastar tempo de upload; o
// backend e quem decide o limite real e o que aceitar de fato.
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

// Formulario usado pelo ADMIN tanto para criar um produto novo quanto para
// editar um existente (passe `product` para editar; omita para criar).
// O slug (id do produto) so pode ser definido na criacao - depois disso fica
// fixo, para nao quebrar o link/identificador do produto.
export default function ProductForm({ product, onCancel, onSaved, onDeleted }) {
  const { token } = useAuth()
  const { categories, updateProduct, createProduct, uploadImage, deleteProduct } = useCatalog()
  const { showToast } = useToast()
  const isEditing = Boolean(product)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    slug: product?.id ?? '',
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    category: product?.category ?? categories[0]?.slug ?? '',
    unit: product?.unit ?? '',
    price: product?.price ?? '',
    tags: (product?.tags ?? []).join(', '),
    image: product?.image ?? '',
    description: product?.description ?? '',
    origin: product?.origin ?? '',
    available: product?.available ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo depois
    if (!file) return

    setError('')

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Imagem muito grande. O tamanho máximo é 5MB.')
      return
    }

    setUploading(true)
    try {
      const url = await uploadImage(file, token)
      updateField('image', url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        slug: isEditing ? product.id : form.slug.trim(),
        sku: form.sku,
        name: form.name,
        category: form.category,
        unit: form.unit,
        price: form.price === '' ? null : Number(form.price),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        image: form.image || null,
        description: form.description,
        origin: form.origin,
        available: form.available,
      }
      const saved = isEditing
        ? await updateProduct(product.id, payload, token)
        : await createProduct(payload, token)
      showToast(isEditing ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.')
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setError('')
    setDeleting(true)
    try {
      await deleteProduct(product.id, token)
      showToast('Produto removido com sucesso.')
      onDeleted?.()
    } catch (err) {
      setError(err.message)
      setConfirmingDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {!isEditing && (
          <div className="col-span-2">
            <label htmlFor="product-slug" className="mb-1 block text-sm font-medium text-ink">
              Identificador{' '}
              <span className="font-normal text-muted">
                (único, sem espaços, ex: picanha-premium-98562)
              </span>
            </label>
            <input
              id="product-slug"
              type="text"
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              className="field"
              placeholder="picanha-premium-98562"
              required
            />
          </div>
        )}

        <div className="col-span-2">
          <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-ink">
            Nome
          </label>
          <input
            id="product-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="field"
            required
          />
        </div>

        <div>
          <label htmlFor="product-sku" className="mb-1 block text-sm font-medium text-ink">
            SKU
          </label>
          <input
            id="product-sku"
            type="text"
            value={form.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            className="field"
            required
          />
        </div>

        <div>
          <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-ink">
            Categoria
          </label>
          <select
            id="product-category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="field"
            required
          >
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="product-unit" className="mb-1 block text-sm font-medium text-ink">
            Unidade
          </label>
          <input
            id="product-unit"
            type="text"
            value={form.unit}
            onChange={(e) => updateField('unit', e.target.value)}
            className="field"
            placeholder="kg, un, cx, pacote 1kg..."
            required
          />
        </div>

        <div>
          <label htmlFor="product-price" className="mb-1 block text-sm font-medium text-ink">
            Preço (R$)
          </label>
          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="field"
            placeholder="Vazio = consulte o preço"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="product-tags" className="mb-1 block text-sm font-medium text-ink">
            Tags <span className="font-normal text-muted">(separadas por vírgula)</span>
          </label>
          <input
            id="product-tags"
            type="text"
            value={form.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            className="field"
            placeholder="Premium, Resfriado"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">Imagem</label>
          <div className="flex items-center gap-4">
            <ProductImage
              src={form.image}
              name={form.name || 'Produto'}
              className="h-20 w-20 shrink-0 rounded-md border border-border"
            />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary"
              >
                <Upload size={14} />
                {uploading ? 'Enviando...' : form.image ? 'Trocar imagem' : 'Escolher arquivo'}
              </button>
              {form.image && (
                <button
                  type="button"
                  onClick={() => updateField('image', '')}
                  className="text-left text-xs font-medium text-muted underline-offset-2 hover:underline"
                >
                  Remover imagem
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-ink">
            Descrição
          </label>
          <textarea
            id="product-description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="field min-h-24 resize-y"
          />
        </div>

        <div>
          <label htmlFor="product-origin" className="mb-1 block text-sm font-medium text-ink">
            Origem
          </label>
          <input
            id="product-origin"
            type="text"
            value={form.origin}
            onChange={(e) => updateField('origin', e.target.value)}
            className="field"
          />
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => updateField('available', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Disponível
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          <Save size={16} />
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
          <X size={16} />
          Cancelar
        </button>

        {isEditing && (
          <div className="ml-auto flex items-center gap-2">
            {confirmingDelete && (
              <span className="text-sm font-medium text-red-600">Excluir definitivamente?</span>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={
                confirmingDelete
                  ? 'inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50'
                  : 'inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:border-red-600'
              }
            >
              <Trash2 size={16} />
              {deleting
                ? 'Excluindo...'
                : confirmingDelete
                  ? 'Confirmar exclusão'
                  : 'Excluir produto'}
            </button>
            {confirmingDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-sm font-medium text-muted hover:text-ink"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
