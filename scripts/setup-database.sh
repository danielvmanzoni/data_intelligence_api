#!/bin/bash

# Script para configurar e popular o banco de dados

echo "🚀 Configurando banco de dados..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Iniciar PostgreSQL e Redis
echo "🐘 Iniciando PostgreSQL e Redis..."
docker-compose up -d postgres redis

# Aguardar o PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 10

# Verificar se o PostgreSQL está rodando
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL não está rodando. Verifique o docker-compose."
    exit 1
fi

# Aplicar migrações
echo "📋 Aplicando migrações do banco..."
DATABASE_URL="postgresql://tickets:tickets_secure_pass@localhost:5432/tickets_db?schema=public" \
npx prisma db push

# Gerar cliente Prisma
echo "🔄 Gerando cliente Prisma..."
npx prisma generate

# Popular banco com dados de teste
echo "🌱 Populando banco com dados de teste..."
DATABASE_URL="postgresql://tickets:tickets_secure_pass@localhost:5432/tickets_db?schema=public" \
npm run seed

echo "✅ Banco de dados configurado e populado com sucesso!"
echo ""
echo "📊 Dados de teste criados:"
echo "- 1 Crown Company"
echo "- 3 Franqueadores (Lacoste, McDonald's, Drogasil)"
echo "- 4 Franquias"
echo "- 9 Usuários (diversos roles)"
echo "- 5 Categorias de tickets"
echo "- 3 Tickets (diferentes status)"
echo "- 4 Comentários"
echo "- 3 Logs de auditoria"
echo ""
echo "🔑 Para iniciar a API:"
echo "DATABASE_URL=\"postgresql://tickets:tickets_secure_pass@localhost:5432/tickets_db?schema=public\" \\"
echo "JWT_SECRET=\"super_secure_jwt_secret_for_production\" \\"
echo "JWT_EXPIRES_IN=\"7d\" \\"
echo "PORT=3010 \\"
echo "npm run start:dev" 