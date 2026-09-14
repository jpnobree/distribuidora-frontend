# Vitrine de Produtos — Distribuidora

![CI](https://github.com/jpnobree/distribuidora-frontend/actions/workflows/ci.yml/badge.svg)

Site catálogo (front-end) feito em **React + Vite + Tailwind CSS + TanStack
Query**. Mostra os produtos por categoria, com busca, filtros e página de
detalhes — **sem carrinho ou checkout**. A ideia é ser uma vitrine: o cliente
vê os produtos e preços e solicita orçamento por WhatsApp/e-mail, ou entra em
contato pelo site depois de logar.

Os produtos e categorias vêm do backend (projeto `distribuidora-backend`) via
API — **é necessário ter o backend rodando** para o catálogo carregar. Existe
login (`/login`) com papéis `ADMIN` (cadastra/edita/remove produtos, painel
administrativo em `/painel`) e `USER` (visualiza e fala com um vendedor). Ver
arquitetura completa no README do `distribuidora-backend`.

## Como rodar

### Opção 1 — Docker

```bash
docker compose up --build
```

Sobe o front-end já buildado, servido por nginx, em `http://localhost:5173`.
Pressupõe que o backend está rodando (via `docker compose up` no repositório
`distribuidora-backend`) em `http://localhost:8080` — ajuste
`VITE_API_BASE_URL` em `docker-compose.yml` se não for o caso.

### Opção 2 — Node local

Pré-requisitos:
- [Node.js](https://nodejs.org) 18 ou mais recente instalado.
- O backend (`distribuidora-backend`) rodando — sem ele, o catálogo mostra
  uma mensagem de erro em vez dos produtos.

```bash
cp .env.example .env   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:8080
npm install             # instala as dependências (só na primeira vez)
npm run dev              # inicia o servidor local (geralmente em http://localhost:5173)
```

Para gerar a versão de produção (arquivos estáticos prontos para publicar):

```bash
npm run build    # gera a pasta dist/
npm run preview  # visualiza o build de produção localmente
```

A pasta `dist/` pode ser publicada em qualquer hospedagem de site estático
(Vercel, Netlify, Cloudflare Pages, um servidor próprio, etc.).

## Testes

Testes de componente com **Vitest + Testing Library**, cobrindo os dois
fluxos mais críticos do site: login e o formulário de criar/editar produto
do admin.

```bash
npm test           # roda uma vez
npm run test:watch # modo observador, roda de novo a cada save
```

| Arquivo | O que é coberto |
|---|---|
| `Login.test.jsx` | preencher credenciais padrão, login com sucesso, backend fora do ar, credenciais inválidas |
| `ProductForm.test.jsx` | criação, edição, erro do backend, cancelar, **exclusão com confirmação em dois cliques**, toast de sucesso |

Validado manualmente também contra o stack real via Docker (backend +
Postgres reais, não mockados): catálogo, login, criar/editar/excluir produto,
painel administrativo — ver histórico de commits.

## Estrutura do projeto

```
src/
  api/client.js   # unico ponto de fetch: URL base, header de auth, tratamento de erro
  components/   # peças de UI reutilizáveis (card de produto, header, modal...)
  pages/
    Home.jsx, Catalog.jsx  # "/" e "/catalogo"
    Login.jsx              # "/login"
    AdminDashboard.jsx     # "/painel" - metricas e mensagens recebidas (so ADMIN)
  context/
    AuthContext.jsx     # login/logout, token JWT, papel do usuário
    CatalogContext.jsx  # produtos/categorias (TanStack Query) e acoes de admin
    ToastContext.jsx    # notificacoes de sucesso/erro
  utils/format.js # formatação de preço, link de WhatsApp etc.
  config.js       # nome da empresa, telefone, WhatsApp, e-mail — apiBaseUrl vem do .env
  index.css       # ponto único das cores/tema (ver "Identidade visual")
.env.example, Dockerfile, docker-compose.yml, nginx.conf, .github/workflows/ci.yml
```

## Produtos e categorias

Não ficam mais em arquivos estáticos aqui no front-end — os dados moram no
**backend** (`distribuidora-backend`). Um usuário logado como `ADMIN` pode
cadastrar, editar e remover produtos direto pela interface (botão "Adicionar
produto" no catálogo, "Editar produto"/"Excluir produto" ao abrir um produto
existente — a exclusão pede confirmação em dois cliques), sem precisar
chamar a API na mão. O catálogo usa **TanStack Query** (`useInfiniteQuery`)
para paginação real — o botão "Carregar mais produtos" aparece assim que o
catálogo passa de uma página (24 itens) — e invalida o cache automaticamente
a cada criação/edição/exclusão, sem precisar recarregar a página.

## Painel administrativo (`/painel`)

Visível só para `ADMIN` (link "Painel" no cabeçalho quando logado). Mostra
total de produtos, indisponíveis, categorias, produtos por categoria e as
mensagens de contato recebidas (`GET /api/contacts`).

### Fotos dos produtos

O `ADMIN` envia a foto direto pelo formulário de criar/editar produto
("Escolher arquivo") — o arquivo vai para o backend (`POST /api/uploads`) e
fica salvo em `distribuidora-backend/uploads`. Também dá pra apontar
manualmente para um arquivo em `public/images/` (ex: `/images/picanha.jpg`),
mas isso só funciona nesta instância do front-end. Enquanto não houver foto,
o card mostra automaticamente um ícone com as iniciais do produto — não
aparece nenhuma imagem quebrada.

## Identidade visual (cores, fontes, marca)

Todo o tema fica centralizado em `src/index.css`, no bloco `:root`:

```css
:root {
  --color-bg: #f5f5f2;
  --color-accent: #3f5b45;
  /* ... */
}
```

Quando a marca (cores, logo) estiver definida, basta trocar esses valores —
nenhum outro componente precisa ser alterado. O nome da empresa, telefone e
e-mail ficam em `src/config.js`.

## Contato / orçamento

Não há checkout. O botão "Solicitar orçamento" na página de detalhes do
produto abre o WhatsApp com uma mensagem pré-preenchida, usando o número
definido em `src/config.js` (`whatsappNumber`). Para desativar esse botão,
basta deixar esse campo em branco (`''`).

## Próximos passos sugeridos

- Cadastrar os produtos reais pela tela de admin (o `DataSeeder` só cria
  alguns produtos de exemplo na primeira execução).
- Definir a identidade visual (cores/fontes/logo) em `index.css` e `config.js`.
- Deploy real (Vercel/Netlify para o front, ver README do backend para o
  deploy da API) — a imagem Docker já está pronta para isso.
- Auditoria de acessibilidade mais formal (axe-core/Lighthouse) — hoje os
  formulários e modais têm labels associadas, `aria-live` no toast e
  fechamento por Escape, mas não houve uma auditoria completa com ferramenta.
