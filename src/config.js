// Configurações gerais do site. Edite estes valores com os dados reais
// da distribuidora — nada mais no código precisa ser tocado.
const config = {
  companyName: 'Real Frios',
  tagline: 'Catálogo de produtos para o seu negócio',

  // Endereço do backend (projeto distribuidora-backend). Troque para a URL
  // real quando publicar a API.
  apiBaseUrl: 'http://localhost:8080',

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
