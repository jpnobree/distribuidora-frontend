import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Login from './pages/Login'

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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
