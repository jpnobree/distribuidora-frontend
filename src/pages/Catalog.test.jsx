import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../context/CatalogContext', () => ({ useCatalog: vi.fn() }))
vi.mock('../context/ToastContext', () => ({ useToast: vi.fn() }))

import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useToast } from '../context/ToastContext'
import Catalog from './Catalog'

const categories = [
  { slug: 'carnes-aves', name: 'Carnes & Aves', icon: '🥩' },
  { slug: 'hortifruti', name: 'Hortifruti', icon: '🥬' },
]

function product(overrides) {
  return {
    id: overrides.id,
    sku: overrides.sku ?? '000',
    unit: 'kg',
    price: 10,
    tags: [],
    available: true,
    image: null,
    category: 'carnes-aves',
    ...overrides,
  }
}

function mockCatalog(overrides) {
  useCatalog.mockReturnValue({
    products: [],
    categories,
    loading: false,
    error: '',
    reload: vi.fn(),
    hasMore: false,
    loadingMore: false,
    loadMore: vi.fn(),
    updateProduct: vi.fn(),
    createProduct: vi.fn(),
    uploadImage: vi.fn(),
    deleteProduct: vi.fn(),
    ...overrides,
  })
}

function renderCatalog(initialEntries = ['/catalogo']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Catalog />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuth.mockReturnValue({ isAdmin: false })
  useToast.mockReturnValue({ showToast: vi.fn() })
})

describe('Catalog - busca/filtro sobre o catalogo inteiro', () => {
  test('busca automaticamente o restante do catalogo quando ha um filtro ativo e mais paginas', () => {
    const loadMore = vi.fn()
    mockCatalog({
      products: [product({ id: 'p1', name: 'Picanha Premium' })],
      hasMore: true,
      loadMore,
    })

    renderCatalog(['/catalogo?busca=alface'])

    expect(loadMore).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/buscando em todo o catálogo/i)).toBeInTheDocument()
  })

  test('nao busca automaticamente quando nenhum filtro esta ativo (fica na paginacao manual)', () => {
    const loadMore = vi.fn()
    mockCatalog({
      products: [product({ id: 'p1', name: 'Picanha Premium' })],
      hasMore: true,
      loadMore,
    })

    renderCatalog(['/catalogo'])

    expect(loadMore).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /carregar mais produtos/i })).toBeInTheDocument()
  })

  test('filtra pelo catalogo inteiro assim que todas as paginas terminam de carregar', () => {
    mockCatalog({
      products: [
        product({ id: 'p1', name: 'Picanha Premium' }),
        product({ id: 'p2', name: 'Alface Crespa', category: 'hortifruti' }),
      ],
      hasMore: false,
    })

    renderCatalog(['/catalogo?busca=alface'])

    expect(screen.getByText('Alface Crespa')).toBeInTheDocument()
    expect(screen.queryByText('Picanha Premium')).not.toBeInTheDocument()
    expect(screen.queryByText(/buscando em todo o catálogo/i)).not.toBeInTheDocument()
  })

  test('filtro por categoria tambem dispara a busca automatica do restante do catalogo', () => {
    const loadMore = vi.fn()
    mockCatalog({
      products: [product({ id: 'p1', name: 'Picanha Premium' })],
      hasMore: true,
      loadMore,
    })

    renderCatalog(['/catalogo?categoria=hortifruti'])

    expect(loadMore).toHaveBeenCalledTimes(1)
  })
})

describe('Catalog - estado vazio', () => {
  test('mostra EmptyState quando o filtro nao encontra nenhum produto e o catalogo ja terminou de carregar', () => {
    mockCatalog({
      products: [product({ id: 'p1', name: 'Picanha Premium' })],
      hasMore: false,
    })

    renderCatalog(['/catalogo?busca=produto-inexistente'])

    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument()
  })
})
