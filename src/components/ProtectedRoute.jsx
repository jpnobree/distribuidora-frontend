import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Envolve uma <Route> que exige autenticacao (e opcionalmente um papel
// especifico). Quem nao estiver logado volta para /login (guardando a
// rota de origem em location.state.from); quem estiver logado mas sem o
// papel exigido volta para a home.
export default function ProtectedRoute({ role, children }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role === 'ADMIN' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
