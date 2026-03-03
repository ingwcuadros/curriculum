# ---------- Etapa 1: Build ----------
FROM node:20-bullseye AS build
WORKDIR /app

# Rompe caché para forzar build limpio en Dockploy (cambia el valor si hace falta)
ARG CACHE_BUST=2026-03-02-01
RUN echo "CACHE_BUST=$CACHE_BUST"

# Habilita corepack para gestionar yarn/pnpm de forma estable
RUN corepack enable

# Copia sólo los manifests para aprovechar caché de dependencias
COPY package.json yarn.lock* pnpm-lock.yaml* package-lock.json* ./

# Instala dependencias de DEV siguiendo lockfile
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
    else npm ci; fi

# Copia el resto del código
COPY . .

# Compila (NestJS/TypeScript suele ser "build")
RUN npm run build || yarn build || pnpm build

# ---------- Etapa 2: Runtime ----------
FROM node:20-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Rompe caché también aquí
ARG CACHE_BUST=2026-03-02-01
RUN echo "CACHE_BUST=$CACHE_BUST"

# Copia manifiestos y reinstala solo producción
COPY package.json yarn.lock* pnpm-lock.yaml* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile --prod; \
    else npm ci --omit=dev; fi

# Copia artefactos compilados
COPY --from=build /app/dist ./dist

# Crea carpeta de uploads si la app la usa
RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "dist/main"]