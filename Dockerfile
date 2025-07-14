# Multi-stage build para otimização
FROM --platform=linux/amd64 node:20-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de configuração do package manager
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm

# Estágio de dependências
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Estágio de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client primeiro
RUN npx prisma generate

# Build da aplicação
RUN pnpm run build

# Estágio de produção
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar arquivos necessários
COPY package*.json pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Criar diretório de logs
RUN mkdir -p logs && chown nestjs:nodejs logs

# Ajustar permissões
RUN chown -R nestjs:nodejs .

USER nestjs

# Expor porta
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Comando de inicialização
CMD ["node", "dist/main"] 