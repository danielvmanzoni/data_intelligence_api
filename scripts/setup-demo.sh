#!/bin/bash

echo "🚀 Iniciando setup do ambiente de demonstração..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi

# Parar containers antigos se existirem
echo "🧹 Limpando ambiente anterior..."
docker-compose down > /dev/null 2>&1

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Subir banco de dados
echo "🐘 Iniciando banco de dados..."
docker-compose up -d postgres

# Esperar banco ficar pronto
echo "⏳ Aguardando banco de dados iniciar..."
sleep 10

# Rodar migrations
echo "🔄 Configurando banco de dados..."
pnpm prisma migrate deploy

# Rodar seed
echo "🌱 Populando banco com dados de exemplo..."
pnpm prisma db seed

# Subir a API
echo "🚀 Iniciando a API..."
docker-compose up -d api

echo "
✅ Setup concluído com sucesso!

📝 Credenciais para acesso:

Crown Admin:
Email: admin@crown.com
Senha: 123456

Franqueador (Lacoste):
Email: admin@lacoste.com
Senha: 123456

Franquia (Lacoste Shopping):
Email: admin@lacoste-ibirapuera.com
Senha: 123456

Agentes:
Email: joao@lacoste.com
Email: maria@lacoste.com
Senha: 123456

🌐 A API está rodando em: http://localhost:3010
📚 Documentação Swagger: http://localhost:3010/docs

Para parar o ambiente:
$ docker-compose down

Para ver os logs:
$ docker-compose logs -f
" 