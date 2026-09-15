const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'nome-az', label: 'Nome (A-Z)' },
  { value: 'preco-menor', label: 'Menor preço' },
  { value: 'preco-maior', label: 'Maior preço' },
]

export default function FilterBar({
  search,
  onSearchChange,
  allTags,
  activeTags,
  onToggleTag,
  sort,
  onSortChange,
  onlyAvailable,
  onToggleOnlyAvailable,
  resultCount,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar neste catálogo..."
          className="field max-w-xs"
        />

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="field w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={onToggleOnlyAvailable}
            className="h-4 w-4 rounded border-border accent-[color:var(--color-accent)]"
          />
          Somente disponíveis
        </label>

        <span className="ml-auto text-sm text-muted">
          {resultCount} produto{resultCount === 1 ? '' : 's'}
        </span>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors ${
                  active
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-border bg-surface text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
