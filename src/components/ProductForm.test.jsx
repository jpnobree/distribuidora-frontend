import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../context/CatalogContext', () => ({ useCatalog: vi.fn() }))

import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import ProductForm from './ProductForm'

const categories = [
  { slug: 'carnes-aves', name: 'Carnes & Aves', icon: '🥩' },
  { slug: 'hortifruti', name: 'Hortifruti', icon: '🥬' },
]

let createProduct
let updateProduct

beforeEach(() => {
  createProduct = vi.fn().mockResolvedValue({ id: 'novo-produto-teste' })
  updateProduct = vi.fn().mockResolvedValue({ id: 'produto-existente' })

  useAuth.mockReturnValue({ token: 'fake-token' })
  useCatalog.mockReturnValue({
    categories,
    createProduct,
    updateProduct,
    uploadImage: vi.fn(),
  })
})

describe('ProductForm - modo criação', () => {
  test('mostra o campo Identificador e envia os dados corretos para createProduct', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<ProductForm onCancel={vi.fn()} onSaved={onSaved} />)

    expect(screen.getByLabelText(/identificador/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar produto/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/identificador/i), 'azeitona-verde-99001')
    await user.type(screen.getByLabelText(/^nome$/i), 'Azeitona Verde com Caroço')
    await user.type(screen.getByLabelText(/^sku$/i), '99001')
    await user.type(screen.getByLabelText(/^unidade$/i), 'balde 2kg')
    await user.type(screen.getByLabelText(/preço/i), '32.5')
    await user.type(screen.getByLabelText(/tags/i), 'Importado, Premium')

    await user.click(screen.getByRole('button', { name: /criar produto/i }))

    expect(createProduct).toHaveBeenCalledTimes(1)
    const [payload, token] = createProduct.mock.calls[0]
    expect(payload).toMatchObject({
      slug: 'azeitona-verde-99001',
      sku: '99001',
      name: 'Azeitona Verde com Caroço',
      category: 'carnes-aves', // primeira categoria, valor padrao do select
      unit: 'balde 2kg',
      price: 32.5,
      tags: ['Importado', 'Premium'],
      available: true,
    })
    expect(token).toBe('fake-token')
    expect(onSaved).toHaveBeenCalledWith({ id: 'novo-produto-teste' })
  })

  test('mostra mensagem de erro e nao chama onSaved quando createProduct falha', async () => {
    createProduct.mockRejectedValue(new Error('Já existe um produto com esse identificador.'))
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<ProductForm onCancel={vi.fn()} onSaved={onSaved} />)

    await user.type(screen.getByLabelText(/identificador/i), 'ja-existe')
    await user.type(screen.getByLabelText(/^nome$/i), 'Produto')
    await user.type(screen.getByLabelText(/^sku$/i), '1')
    await user.type(screen.getByLabelText(/^unidade$/i), 'un')

    await user.click(screen.getByRole('button', { name: /criar produto/i }))

    expect(await screen.findByText(/já existe um produto com esse identificador/i)).toBeInTheDocument()
    expect(onSaved).not.toHaveBeenCalled()
  })
})

describe('ProductForm - modo edição', () => {
  const produtoExistente = {
    id: 'produto-existente',
    sku: '123',
    name: 'Produto Existente',
    category: 'hortifruti',
    unit: 'kg',
    price: 10,
    tags: ['Orgânico'],
    image: null,
    description: 'Descrição original',
    origin: 'Brasil',
    available: true,
  }

  test('nao mostra o campo Identificador e mantem o slug original ao salvar', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<ProductForm product={produtoExistente} onCancel={vi.fn()} onSaved={onSaved} />)

    expect(screen.queryByLabelText(/identificador/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^nome$/i)).toHaveValue('Produto Existente')

    await user.clear(screen.getByLabelText(/^nome$/i))
    await user.type(screen.getByLabelText(/^nome$/i), 'Produto Editado')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    expect(updateProduct).toHaveBeenCalledTimes(1)
    const [slugArg, payload] = updateProduct.mock.calls[0]
    expect(slugArg).toBe('produto-existente')
    expect(payload.slug).toBe('produto-existente')
    expect(payload.name).toBe('Produto Editado')
    expect(onSaved).toHaveBeenCalledWith({ id: 'produto-existente' })
  })
})

describe('ProductForm - ações comuns', () => {
  test('botão Cancelar aciona onCancel sem chamar create/update', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ProductForm onCancel={onCancel} onSaved={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(createProduct).not.toHaveBeenCalled()
  })
})
