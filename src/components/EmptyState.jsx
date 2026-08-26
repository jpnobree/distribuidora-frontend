export default function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <p className="font-display text-xl text-ink">Nenhum produto encontrado</p>
      <p className="max-w-sm text-sm text-muted">
        Ajuste os filtros ou o termo de busca para ver outros produtos do catálogo.
      </p>
      <button onClick={onClear} className="btn-secondary mt-1">
        Limpar filtros
      </button>
    </div>
  )
}
