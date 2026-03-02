
# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
COPY tsconfig*.json ./
RUN yarn install 

COPY . .
RUN yarn build && ls -la /app/dist

# Etapa 2: Producción
FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production  && yarn cache clean

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "dist/main"]
