import { useRef, useState } from 'react'
import { Save, X, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import ProductImage from './ProductImage'

// Formulario usado pelo ADMIN tanto para criar um produto novo quanto para
// editar um existente (passe `product` para editar; omita para criar).
// O slug (id do produto) so pode ser definido na criacao - depois disso fica
// fixo, para nao quebrar o link/identificador do produto.
export default function ProductForm({ product, onCancel, onSaved }) {
  const { token } = useAuth()
  const { categories, updateProduct, createProduct, uploadImage } = useCatalog()
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
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo depois
    if (!file) return

    setError('')
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
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {!isEditing && (
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink">
              Identificador <span className="font-normal text-muted">(único, sem espaços, ex: picanha-premium-98562)</span>
            </label>
            <input
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
          <label className="mb-1 block text-sm font-medium text-ink">Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="field"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            className="field"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Categoria</label>
          <select
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
          <label className="mb-1 block text-sm font-medium text-ink">Unidade</label>
          <input
            type="text"
            value={form.unit}
            onChange={(e) => updateField('unit', e.target.value)}
            className="field"
            placeholder="kg, un, cx, pacote 1kg..."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Preço (R$)</label>
          <input
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
          <label className="mb-1 block text-sm font-medium text-ink">
            Tags <span className="font-normal text-muted">(separadas por vírgula)</span>
          </label>
          <input
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
          <label className="mb-1 block text-sm font-medium text-ink">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="field min-h-24 resize-y"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Origem</label>
          <input
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

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          <Save size={16} />
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary">
          <X size={16} />
          Cancelar
        </button>
      </div>
    </form>
  )
}
