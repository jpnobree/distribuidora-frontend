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
  const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para: ${productName}`)
  return `https://wa.me/${number}?text=${text}`
}

// Le o valor real de uma custom property de src/index.css (com fallback
// para quando ela ainda nao foi carregada, como em testes). So calculado
// uma vez: o tema deste projeto e um :root fixo, sem troca em runtime.
// As variaveis guardam canais "R G B" (ver index.css), nao hex - por isso
// os fallbacks abaixo tambem estao nesse formato.
let cachedPalette = null

function themeColor(varName, fallback) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

// Paleta de cor estável (sempre a mesma para o mesmo texto) para os
// placeholders de imagem, usada enquanto fotos reais não são cadastradas.
// Deriva dos mesmos tokens de marca de index.css - trocar a identidade
// visual (ver "Identidade visual" no README) atualiza os avatares junto,
// sem precisar tocar aqui. Cada cor retornada é "R G B" (use com
// `rgb(${cor})` ou `rgb(${cor} / <alpha>)`), não uma string hex.
function placeholderPalette() {
  if (!cachedPalette) {
    cachedPalette = [
      themeColor('--color-accent', '90 31 51'),
      themeColor('--color-gold', '125 102 50'),
      themeColor('--color-muted', '107 111 104'),
    ]
  }
  return cachedPalette
}

export function colorFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const palette = placeholderPalette()
  const index = Math.abs(hash) % palette.length
  return palette[index]
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
