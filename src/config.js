// Configurações gerais do site. Edite estes valores com os dados reais
// da distribuidora — nada mais no código precisa ser tocado.
const config = {
  companyName: 'Real Frios',
  tagline: 'Catálogo de produtos para o seu negócio',

  // Endereço do backend (projeto distribuidora-backend). Vem da variável de
  // ambiente VITE_API_BASE_URL (ver .env / .env.example) — troque lá, não aqui.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://distribuidora-backend-f476.onrender.com',

  // Usado no botão "Solicitar orçamento" dos produtos (formato internacional,
  // só números). Deixe vazio ('') para esconder o botão de WhatsApp.
  whatsappNumber: '5585987178721',

  contactEmail: 'realfrios.jp@hotmail.com',
  contactPhone: '(85) 98717-8721',

  // Aviso: este site é apenas uma vitrine. Não há carrinho nem checkout —
  // o cliente entra em contato para fechar o pedido.
  showPricesToEveryone: true,
}

export default config
