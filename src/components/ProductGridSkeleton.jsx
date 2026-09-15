// Skeleton usado enquanto o catalogo carrega (Home e Catalog), no lugar de
// um texto simples "Carregando..." - reduz o "salto" de layout quando os
// cards de verdade aparecem.
export default function ProductGridSkeleton({ count = 10 }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-border bg-surface"
        >
          <div className="h-40 w-full bg-border/60" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-3 w-2/3 rounded bg-border/60" />
            <div className="h-4 w-full rounded bg-border/60" />
            <div className="mt-2 h-3 w-1/3 rounded bg-border/60" />
          </div>
        </div>
      ))}
    </div>
  )
}
