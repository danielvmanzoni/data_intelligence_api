# Multi-stage build para otimização
FROM node:20-alpine AS base

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

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN pnpm run build

# Estágio de produção
FROM node:20-alpine AS runner
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Instalar apenas dependências de produção
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copiar arquivos buildados e necessários
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Criar diretório de logs
RUN mkdir -p logs && chown nestjs:nodejs logs

USER nestjs

# Expor porta
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Comando de inicialização
CMD ["node", "dist/main"] 