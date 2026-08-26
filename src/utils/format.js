export function formatPrice(price, unit) {
  if (price === null || price === undefined) return 'Consulte o preço'
  const value = price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  return unit ? `${value} / ${unit}` : value
}

export function whatsappLink(number, productName) {
  if (!number) return null
  const text = encodeURIComponent(
    `Olá! Gostaria de solicitar um orçamento para: ${productName}`
  )
  return `https://wa.me/${number}?text=${text}`
}

// Gera uma cor estável (sempre a mesma para o mesmo texto) para os
// placeholders de imagem, usada enquanto fotos reais não são cadastradas.
const PLACEHOLDER_PALETTE = ['#3f5b45', '#6b6f68', '#b08d57', '#4a6670', '#7a4b3a']

export function colorFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % PLACEHOLDER_PALETTE.length
  return PLACEHOLDER_PALETTE[index]
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
