import ProductCard from './ProductCard'

export default function ProductRow({ products, onSelect }) {
  if (products.length === 0) return null

  return (
    <div className="scroll-row flex gap-4 overflow-x-auto pb-2">
      {products.map((product) => (
        <div key={product.id} className="w-48 flex-shrink-0 sm:w-56">
          <ProductCard product={product} onSelect={onSelect} />
        </div>
      ))}
    </div>
  )
}
