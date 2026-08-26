# Vitrine de Produtos — Distribuidora

Site catálogo (front-end) feito em **React + Vite + Tailwind CSS**. Mostra os
produtos por categoria, com busca, filtros e página de detalhes — **sem
carrinho ou checkout**. A ideia é ser uma vitrine: o cliente vê os produtos e
preços e solicita orçamento por WhatsApp/e-mail, ou entra em contato pelo
site depois de logar.

Os produtos e categorias vêm do backend (projeto `distribuidora-backend`) via
API — **é necessário ter o backend rodando** para o catálogo carregar (ver
`config.apiBaseUrl` em `src/config.js`). Também existe uma tela de login
(`/login`), com papéis `ADMIN` (cadastra/edita produtos) e `USER` (visualiza
e fala com um vendedor).

## Como rodar

Pré-requisitos:
- [Node.js](https://nodejs.org) 18 ou mais recente instalado.
- O backend (`distribuidora-backend`) rodando — sem ele, o catálogo mostra
  uma mensagem de erro em vez dos produtos.

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # inicia o servidor local (geralmente em http://localhost:5173)
```

Para gerar a versão de produção (arquivos estáticos prontos para publicar):

```bash
npm run build    # gera a pasta dist/
npm run preview  # visualiza o build de produção localmente
```

A pasta `dist/` pode ser publicada em qualquer hospedagem de site estático
(Vercel, Netlify, Cloudflare Pages, um servidor próprio, etc.).

## Estrutura do projeto

```
src/
  components/   # peças de UI reutilizáveis (card de produto, header, modal...)
  pages/        # páginas roteadas: Home ("/"), Catálogo ("/catalogo"), Login ("/login")
  context/
    AuthContext.jsx     # login/logout, token JWT, papel do usuário
    CatalogContext.jsx  # busca produtos/categorias na API do backend
  utils/format.js # formatação de preço, link de WhatsApp etc.
  config.js       # nome da empresa, telefone, WhatsApp, e-mail, URL da API
  index.css       # ponto único das cores/tema (ver "Identidade visual")
```

## Produtos e categorias

Não ficam mais em arquivos estáticos aqui no front-end — quem cadastra e
edita é o **backend** (`distribuidora-backend`), autenticado como `ADMIN`
(`POST`/`PUT`/`PATCH`/`DELETE /api/products`). Este projeto só consome esses
dados via `GET /api/products` e `GET /api/categories` (ver
`CatalogContext.jsx`).

Para adicionar/editar produtos, use a API do backend diretamente (veja o
README de `distribuidora-backend` para exemplos) — ainda não existe uma tela
de administração no front-end.

### Fotos dos produtos

Coloque as imagens em `public/images/` e referencie como
`image: '/images/picanha.jpg'`. Enquanto não houver foto (`image: null`, ou se
o arquivo não for encontrado), o card mostra automaticamente um ícone com as
iniciais do produto — não aparece nenhuma imagem quebrada.

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

- Cadastrar os produtos reais via API do backend (o `DataSeeder` só cria
  alguns produtos de exemplo na primeira execução).
- Definir a identidade visual (cores/fontes/logo) em `index.css` e `config.js`.
- Adicionar fotos reais em `public/images/`.
- Construir uma tela de administração no front-end para o `ADMIN` cadastrar/
  editar produtos sem precisar chamar a API na mão.
