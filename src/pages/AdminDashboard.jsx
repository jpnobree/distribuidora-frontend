import { useQuery } from '@tanstack/react-query'
import { Package, PackageX, LayoutGrid, MessagesSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { api } from '../api/client'

// Acesso a esta pagina ja e restrito a ADMIN por <ProtectedRoute> em App.jsx.
export default function AdminDashboard() {
  const { token } = useAuth()
  const { products, categories } = useCatalog()

  const contactsQuery = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: () => api.get('/api/contacts', { token }),
  })

  const totalProdutos = products.length
  const indisponiveis = products.filter((p) => !p.available).length
  const mensagens = contactsQuery.data ?? []
  const semResposta = mensagens.filter((m) => !m.answered).length

  const porCategoria = categories
    .map((cat) => ({ ...cat, total: products.filter((p) => p.category === cat.slug).length }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Painel administrativo</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Package} label="Produtos no catálogo" value={totalProdutos} />
        <StatCard icon={PackageX} label="Indisponíveis" value={indisponiveis} />
        <StatCard icon={LayoutGrid} label="Categorias" value={categories.length} />
        <StatCard
          icon={MessagesSquare}
          label="Mensagens recebidas"
          value={mensagens.length}
          highlight={semResposta > 0 ? `${semResposta} sem resposta` : undefined}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">Produtos por categoria</h2>
        {porCategoria.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {porCategoria.map((cat) => (
              <div key={cat.slug} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-sm text-ink sm:w-44">
                  {cat.icon} {cat.name}
                </span>
                <div className="h-2 flex-1 rounded-full bg-border" aria-hidden="true">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{
                      width: totalProdutos ? `${(cat.total / totalProdutos) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-mono text-sm text-muted">
                  {cat.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">Mensagens recebidas</h2>
        {contactsQuery.isLoading ? (
          <p className="text-sm text-muted">Carregando...</p>
        ) : contactsQuery.isError ? (
          <p className="text-sm text-red-600">Não foi possível carregar as mensagens.</p>
        ) : mensagens.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma mensagem recebida ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mensagens.map((m) => (
              <li key={m.id} className="rounded-md border border-border bg-surface p-4">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span>
                    <strong className="text-ink">{m.requesterUsername}</strong>
                    {m.productSlug ? ` · sobre ${m.productSlug}` : ''}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-ink">{m.message}</p>
                {m.phone && <p className="mt-1 text-xs text-muted">Telefone: {m.phone}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <Icon size={18} className="mb-2 text-accent" aria-hidden="true" />
      <div className="font-display text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-muted">{label}</div>
      {highlight && <div className="mt-1 text-xs font-medium text-gold">{highlight}</div>}
    </div>
  )
}
