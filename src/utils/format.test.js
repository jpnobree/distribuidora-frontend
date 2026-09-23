import { describe, expect, it } from 'vitest'
import { formatStock } from './format'

describe('formatStock', () => {
  it('arredonda para baixo: nunca promete mais do que tem', () => {
    expect(formatStock(373.198, 'kg')).toBe('373 kg em estoque')
    expect(formatStock(2788.5, 'kg')).toBe('2.788 kg em estoque')
  })

  it('sobra de balança abaixo de 1 unidade conta como sem estoque', () => {
    expect(formatStock(0.087, 'kg')).toBe('Sem estoque')
    expect(formatStock(0, 'un')).toBe('Sem estoque')
  })

  it('sem informação de estoque não mostra nada', () => {
    expect(formatStock(undefined, 'kg')).toBeNull()
  })
})
