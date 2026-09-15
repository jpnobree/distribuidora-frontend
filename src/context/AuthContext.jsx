import { createContext, useContext, useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'

const STORAGE_KEY = 'distribuidora_auth'

const AuthContext = createContext(null)

// So le o payload (nao valida assinatura - isso e responsabilidade do
// backend). Usado apenas para saber "ate quando" o token vale, para
// deslogar automaticamente na UI em vez de esperar um 401 de alguma acao.
function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function isExpired(token) {
  const exp = decodeJwtPayload(token)?.exp
  return typeof exp === 'number' && Date.now() >= exp * 1000
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed?.token && isExpired(parsed.token)) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  // Desloga sozinho assim que o token expirar, em vez de deixar o usuario
  // descobrir isso só quando uma acao falhar com 401/403.
  useEffect(() => {
    const exp = auth?.token ? decodeJwtPayload(auth.token)?.exp : null
    if (!exp) return

    const msUntilExpiry = exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) {
      setAuth(null)
      return
    }
    const timer = setTimeout(() => setAuth(null), msUntilExpiry)
    return () => clearTimeout(timer)
  }, [auth?.token])

  async function login(username, password) {
    let data
    try {
      data = await api.post('/api/auth/login', { username, password })
    } catch (err) {
      throw new Error(loginErrorMessage(err))
    }

    setAuth(data)
    return data
  }

  function logout() {
    setAuth(null)
  }

  const value = {
    user: auth ? { username: auth.username, role: auth.role } : null,
    token: auth?.token ?? null,
    isAdmin: auth?.role === 'ADMIN',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function loginErrorMessage(err) {
  if (!(err instanceof ApiError)) return 'Não foi possível entrar. Tente novamente.'
  if (err.status === 0)
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
  if (err.status === 401) return 'Usuário ou senha inválidos.'
  return 'Não foi possível entrar. Tente novamente.'
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  }
  return context
}
