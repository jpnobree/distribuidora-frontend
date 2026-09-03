import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Login', () => {
  test('preenche usuario e senha ao clicar em "Preencher automaticamente"', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /preencher automaticamente/i }))

    expect(screen.getByLabelText(/usuário/i)).toHaveValue('admin')
    expect(screen.getByLabelText(/senha/i)).toHaveValue('admin123')
  })

  test('faz login e guarda o token quando as credenciais sao aceitas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'token-123', username: 'admin', role: 'ADMIN' }),
      })
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/usuário/i), 'admin')
    await user.type(screen.getByLabelText(/senha/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('distribuidora_auth'))).toEqual({
        token: 'token-123',
        username: 'admin',
        role: 'ADMIN',
      })
    })
  })

  test('mostra mensagem amigavel quando o backend esta fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/usuário/i), 'admin')
    await user.type(screen.getByLabelText(/senha/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(
      await screen.findByText(/não foi possível conectar ao servidor/i)
    ).toBeInTheDocument()
    expect(localStorage.getItem('distribuidora_auth')).toBeNull()
  })

  test('mostra mensagem de credenciais invalidas quando o backend responde 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/usuário/i), 'admin')
    await user.type(screen.getByLabelText(/senha/i), 'senha-errada')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    expect(await screen.findByText(/usuário ou senha inválidos/i)).toBeInTheDocument()
  })
})
