# --- Etapa 1: build -----------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL da API embutida no build estatico (variavel do Vite, precisa existir
# em tempo de build, nao so em runtime). Ajuste com --build-arg se o
# backend nao estiver em localhost:8080.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Etapa 2: runtime (nginx servindo os arquivos estaticos) ------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
