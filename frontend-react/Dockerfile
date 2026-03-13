# Etapa 1: Build da aplicação React/Vite com Bun
FROM oven/bun:1.2.14-alpine AS builder

# Instalar dependências do motor 3D primeiro
WORKDIR /sos-3d-engine
COPY sos-3d-engine/package.json sos-3d-engine/package-lock.json* ./
RUN bun install

# Instalar dependências do frontend
WORKDIR /app
COPY frontend-react/package.json frontend-react/bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install

# Copiar códigos fonte
COPY frontend-react/ .
COPY sos-3d-engine/ /sos-3d-engine/

# Resolver link simbólico quebrado para docs (se existir)
RUN rm -rf public/docs && mkdir -p public/docs

ARG VITE_API_BASE_URL="http://localhost:8001"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN bun run build

# Etapa 2: Servir os arquivos minificados usando Nginx para suporte a SPA
FROM nginx:alpine
RUN apk add --no-cache curl

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração personalizada do Nginx
COPY frontend-react/nginx.conf /etc/nginx/conf.d/

WORKDIR /usr/share/nginx/html

# Copia os arquivos compilados da etapa anterior
COPY --from=builder /app/dist .

# Expõe a porta 8000 para acesso (mesma porta configurada no nginx.conf)
EXPOSE 8000

# O Nginx inicia automaticamente
CMD ["nginx", "-g", "daemon off;"]
