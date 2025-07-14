<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <h1 align="center">API de Gestão de Chamados Multi-Tenant com Sistema de Franquias</h1>
</p>

<p align="center">Uma API robusta para gerenciamento de tickets/chamados de suporte com arquitetura multi-tenant hierárquica para franquias, desenvolvida com <a href="http://nestjs.com/" target="_blank">NestJS</a>, <a href="https://www.prisma.io/" target="_blank">Prisma</a> e <a href="https://www.postgresql.org/" target="_blank">PostgreSQL</a>.</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

# API de Gestão de Tickets

## 🚀 Guia Rápido para Demonstração

### Pré-requisitos

1. Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Instale o [Node.js](https://nodejs.org/) (versão LTS)
3. Instale o PNPM:
   ```bash
   npm install -g pnpm
   ```

### Configuração do Ambiente

1. Inicie o Docker Desktop
2. Abra o terminal (ou PowerShell no Windows)
3. Navegue até a pasta do projeto
4. Execute o script de setup:

   **No Windows (PowerShell):**
   ```powershell
   .\scripts\setup-demo.ps1
   ```

   **No Mac/Linux:**
   ```bash
   sh scripts/setup-demo.sh
   ```

   Se tiver problemas de permissão no Windows, execute o PowerShell como administrador e use:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

O script vai:
- Instalar todas as dependências
- Configurar o banco de dados
- Criar dados de exemplo
- Iniciar a API

### Acessando o Sistema

Após o setup, você terá acesso a:

- API: http://localhost:3010
- Documentação Swagger: http://localhost:3010/docs

### Credenciais para Teste

**Crown Admin:**
- Email: admin@crown.com
- Senha: 123456

**Franqueador (Lacoste):**
- Email: admin@lacoste.com
- Senha: 123456

**Franquia (Lacoste Shopping):**
- Email: admin@lacoste-ibirapuera.com
- Senha: 123456

**Agentes:**
- Email: joao@lacoste.com
- Email: maria@lacoste.com
- Senha: 123456

### Comandos Úteis

**Parar o ambiente:**
```bash
docker-compose down
```

**Ver logs:**
```bash
docker-compose logs -f
```

### Problemas Comuns

1. **"O script não pode ser carregado" no Windows**
   - Abra o PowerShell como administrador
   - Execute: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Tente rodar o script novamente

2. **Docker não está rodando**
   - Verifique se o Docker Desktop está aberto e rodando
   - No Windows, certifique-se que o WSL2 está instalado e configurado

3. **Portas em uso**
   - Se receber erro de porta em uso, verifique se não há outros serviços rodando nas portas 3010 (API) ou 5432 (PostgreSQL)
   - Pare os serviços que estão usando essas portas ou altere as portas no `docker-compose.yml`

## 🏢 Estrutura Multi-tenant

O sistema está configurado com uma estrutura hierárquica:

1. **Crown** (Crown Company)
   - Empresa principal que gerencia todo o sistema

2. **Franqueador** (Lacoste Brasil)
   - Gerencia todas as suas franquias
   - Possui equipe de suporte (agentes)

3. **Franquia** (Lacoste Shopping Ibirapuera)
   - Loja individual
   - Pode abrir tickets para o franqueador

## 📋 Funcionalidades Principais

1. **Gestão de Tickets**
   - Abertura de chamados
   - Atribuição para agentes
   - Comentários e respostas
   - Diferentes status e prioridades

2. **Categorias**
   - Suporte Técnico (SLA: 24h)
   - Vendas (SLA: 4h)
   - Financeiro (SLA: 48h)

3. **Usuários e Permissões**
   - Administradores (Crown, Franqueador, Franquia)
   - Agentes de Suporte
   - Convidados (podem abrir tickets)
