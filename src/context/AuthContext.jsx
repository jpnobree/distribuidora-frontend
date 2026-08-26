import { createContext, useContext, useEffect, useState } from 'react'
import config from '../config'

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
    let response
    try {
      response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    }

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? 'Usuário ou senha inválidos.'
          : 'Não foi possível entrar. Tente novamente.'
      )
    }

    const data = await response.json()
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  }
  return context
}
