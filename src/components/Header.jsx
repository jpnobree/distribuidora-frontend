import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Phone, LogIn, LogOut, ShieldCheck } from 'lucide-react'
import config from '../config'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()

  function handleSubmit(e) {
    e.preventDefault()
    navigate(query.trim() ? `/catalogo?busca=${encodeURIComponent(query.trim())}` : '/catalogo')
  }

  return (
    <header className="border-b border-border bg-surface">
      {/* barra utilitária */}
      <div className="hidden bg-ink text-white/80 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-1.5 px-4 py-1.5 text-xs">
          <Phone size={12} />
          <span>{config.contactPhone}</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
        <a href="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
          {config.companyName}
        </a>

        <form onSubmit={handleSubmit} className="ml-auto flex min-w-[200px] flex-1 max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto por nome ou SKU..."
            className="field rounded-r-none"
          />
          <button type="submit" className="btn-primary rounded-l-none px-3" aria-label="Buscar">
            <Search size={16} />
          </button>
        </form>

        {user ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-ink">
              {isAdmin && <ShieldCheck size={16} className="text-accent" />}
              {user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary px-3 py-1.5"
              aria-label="Sair"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => navigate('/login')} className="btn-secondary px-3 py-1.5 text-sm">
            <LogIn size={14} />
            Entrar
          </button>
        )}
      </div>
    </header>
  )
}
