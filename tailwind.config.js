/** @type {import('tailwindcss').Config} */

// As variáveis de src/index.css guardam "R G B" (canais separados por
// espaço, não hex) só para isto funcionar: permite usar opacidade nas
// cores de marca (bg-ink/60, bg-gold/10 etc.) via rgb(var(...) / alpha).
// Sem isso, o Tailwind não consegue decompor a cor e a classe com "/"
// simplesmente não gera CSS nenhum.
function withOpacity(variable) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        ink: withOpacity('--color-ink'),
        muted: withOpacity('--color-muted'),
        border: withOpacity('--color-border'),
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          ink: withOpacity('--color-accent-ink'),
        },
        gold: withOpacity('--color-gold'),
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
