import { createContext, useContext, useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'

const STORAGE_KEY = 'distribuidora_auth'

const AuthContext = createContext(null)

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
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
  if (err.status === 0) return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
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
