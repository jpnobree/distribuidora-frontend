import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

function renderAtPainel() {
  return render(
    <MemoryRouter initialEntries={['/painel']}>
      <Routes>
        <Route
          path="/painel"
          element={
            <ProtectedRoute role="ADMIN">
              <div>Conteúdo do painel</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Página de login</div>} />
        <Route path="/" element={<div>Página inicial</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  test('redireciona para /login quando nao ha usuario logado', () => {
    useAuth.mockReturnValue({ user: null, isAdmin: false })

    renderAtPainel()

    expect(screen.getByText(/página de login/i)).toBeInTheDocument()
  })

  test('redireciona para / quando o usuario esta logado mas nao e admin', () => {
    useAuth.mockReturnValue({ user: { username: 'cliente', role: 'USER' }, isAdmin: false })

    renderAtPainel()

    expect(screen.getByText(/página inicial/i)).toBeInTheDocument()
  })

  test('renderiza o conteudo protegido quando o usuario e admin', () => {
    useAuth.mockReturnValue({ user: { username: 'admin', role: 'ADMIN' }, isAdmin: true })

    renderAtPainel()

    expect(screen.getByText(/conteúdo do painel/i)).toBeInTheDocument()
  })
})
