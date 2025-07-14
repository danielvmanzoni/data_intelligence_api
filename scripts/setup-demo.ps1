Write-Host "🚀 Iniciando setup do ambiente de demonstração..." -ForegroundColor Cyan

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    exit 1
}

# Parar containers antigos se existirem
Write-Host "🧹 Limpando ambiente anterior..." -ForegroundColor Yellow
docker-compose down | Out-Null

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
pnpm install

# Subir banco de dados
Write-Host "🐘 Iniciando banco de dados..." -ForegroundColor Yellow
docker-compose up -d postgres

# Esperar banco ficar pronto
Write-Host "⏳ Aguardando banco de dados iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Rodar migrations
Write-Host "🔄 Configurando banco de dados..." -ForegroundColor Yellow
pnpm prisma migrate deploy

# Rodar seed
Write-Host "🌱 Populando banco com dados de exemplo..." -ForegroundColor Yellow
pnpm prisma db seed

# Subir a API
Write-Host "🚀 Iniciando a API..." -ForegroundColor Yellow
docker-compose up -d api

Write-Host @"

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
"@ -ForegroundColor Green 