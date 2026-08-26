import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Credenciais do admin padrão criado automaticamente pelo backend
// (ver distribuidora-backend: app.seed.admin-username/admin-password).
const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' }

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate(location.state?.from ?? '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function fillDefaultAdmin() {
    setUsername(DEFAULT_ADMIN.username)
    setPassword(DEFAULT_ADMIN.password)
    setError('')
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-muted">
          Acesse para administrar o catálogo ou falar com um vendedor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-ink">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          <LogIn size={16} />
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="rounded-md border border-dashed border-border bg-surface p-3 text-center text-xs text-muted">
        <p>
          Login de admin padrão: <code className="font-mono">admin</code> /{' '}
          <code className="font-mono">admin123</code>
        </p>
        <button type="button" onClick={fillDefaultAdmin} className="mt-2 font-medium text-accent underline-offset-2 hover:underline">
          Preencher automaticamente
        </button>
      </div>
    </div>
  )
}
