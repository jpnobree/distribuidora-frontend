import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Login from './pages/Login'

// So carregado quando um ADMIN acessa /painel - evita mandar esse codigo
// no bundle inicial de quem so vai navegar pelo catalogo publico.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CategoryNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/painel"
            element={
              <ProtectedRoute role="ADMIN">
                <Suspense
                  fallback={<p className="py-16 text-center text-sm text-muted">Carregando...</p>}
                >
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
