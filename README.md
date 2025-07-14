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

## 📋 Descrição

Esta API fornece um sistema completo de gestão de chamados/tickets de suporte **multi-tenant hierárquico** especificamente projetado para **sistemas de franquias**, permitindo:

- **🏢 Arquitetura Multi-Tenant via Param de Rota** - Tenants identificados por slug na URL
- **🔐 Autenticação por Tenant Slug** - Login contextual por tenant
- **🏷️ Segmentação por Mercado** - MODA, FOOD, FARMA, TECH, BEAUTY, SPORT
- **👑 Controle Total Crown** - Administração global com seleção de marca/segmento
- **🎫 Gestão Completa de Chamados** - Sistema robusto de tickets com filtros hierárquicos
- **📊 BI e Relatórios Hierárquicos** - Visibilidade baseada na estrutura de franquias
- **🚀 Escalabilidade com Docker/Kubernetes** - Infraestrutura pronta para produção

## 🏗️ Arquitetura Multi-Tenant via Param de Rota

### 🔗 Estrutura de URLs por Tenant

```
https://api.example.com/
├── /lacoste/auth/login          # Login na Lacoste
├── /lacoste/tickets             # Tickets da Lacoste
├── /nike/auth/login             # Login na Nike
├── /nike/tickets                # Tickets da Nike
├── /mcdonalds/auth/login        # Login no McDonald's
└── /mcdonalds/tickets           # Tickets do McDonald's
```

### 🎯 Funcionamento do Sistema

#### 1. **Identificação do Tenant**
- O tenant é identificado pelo **slug** na URL (ex: `/lacoste/...`)
- O sistema valida automaticamente se o tenant existe e está ativo
- Todas as operações são isoladas por tenant

#### 2. **Autenticação Contextual**
- **Login**: `POST /:tenant/auth/login`
- **Perfil**: `GET /:tenant/auth/me`
- **Tokens JWT** incluem informações do tenant
- **Validação automática** de correspondência entre JWT e tenant da URL

#### 3. **Operações com Tickets**
- **Criar**: `POST /:tenant/tickets`
- **Listar**: `GET /:tenant/tickets`
- **Visualizar**: `GET /:tenant/tickets/:id`
- **Atualizar**: `PATCH /:tenant/tickets/:id`
- **Excluir**: `DELETE /:tenant/tickets/:id`
- **Estatísticas**: `GET /:tenant/tickets/stats`

#### 4. **Operações com Categorias de Tickets**
- **Criar**: `POST /:tenant/ticket-category`
- **Listar Todas**: `GET /:tenant/ticket-category`
- **Listar Ativas**: `GET /:tenant/ticket-category/active`
- **Visualizar**: `GET /:tenant/ticket-category/:id`
- **Atualizar**: `PATCH /:tenant/ticket-category/:id`
- **Excluir**: `DELETE /:tenant/ticket-category/:id`

### 🔐 Segurança e Isolamento

#### **Guard Global TenantContextGuard**
- Intercepta todas as requisições
- Extrai o tenant slug da URL
- Valida existência e status do tenant
- Injeta contexto do tenant na requisição

#### **Validação de JWT**
- Verifica se o token JWT corresponde ao tenant da URL
- Impede acesso cruzado entre tenants
- Garante isolamento total de dados

### 🎨 Exemplos de Uso

#### **1. Login em um Tenant**
```bash
# Login na Lacoste
curl -X POST "http://localhost:3010/lacoste/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lacoste.com",
    "password": "senha123"
  }'
```

#### **2. Listar Tickets do Tenant**
```bash
# Listar tickets da Lacoste
curl -X GET "http://localhost:3010/lacoste/tickets" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

#### **3. Criar Ticket no Tenant**
```bash
# Criar ticket na Nike
curl -X POST "http://localhost:3010/nike/tickets" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Problema no Sistema",
    "description": "Descrição do problema",
    "categoryId": "uuid-da-categoria",
    "priority": "HIGH"
  }'
```

#### **4. Gerenciar Categorias de Tickets**
```bash
# Criar categoria
curl -X POST "http://localhost:3010/nike/ticket-category" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suporte Técnico",
    "description": "Problemas técnicos e suporte ao sistema",
    "color": "#FF5722",
    "icon": "support",
    "slaHours": 24
  }'

# Listar categorias ativas
curl -X GET "http://localhost:3010/nike/ticket-category/active" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

## 🔧 Componentes Principais

### **TenantContextGuard**
- Guard global que intercepta todas as requisições
- Extrai tenant slug da URL
- Valida tenant no banco de dados
- Injeta contexto do tenant na requisição

### **AuthController**
- Rota: `/:tenant/auth/*`
- Login contextual por tenant
- Validação de correspondência JWT/tenant

### **TicketController**
- Rota: `/:tenant/tickets/*`
- Operações CRUD isoladas por tenant
- Filtros automáticos por tenant

### **TicketCategoryController**
- Rota: `/:tenant/ticket-category/*`
- Gerenciamento de categorias de tickets
- Validações de nome único por tenant
- Soft delete para categorias em uso
- Personalização com cores e ícones
- SLA configurável por categoria

### **JWT Strategy**
- Validação de tokens JWT
- Verificação de correspondência com tenant
- Controle de acesso contextual

## 📊 Modelo de Dados

### Tickets

O sistema permite a organização dos tickets em categorias personalizáveis por tenant, com as seguintes características:

#### Campos
- **name**: Nome único da categoria (por tenant)
- **description**: Descrição detalhada (opcional)
- **color**: Cor em formato hexadecimal para UI (opcional)
- **icon**: Nome do ícone para UI (opcional)
- **isActive**: Status de ativação da categoria
- **slaHours**: Tempo de SLA em horas (1-720h, opcional)

#### Validações
- Nome único por tenant
- Cor em formato hexadecimal válido (ex: #FF5722)
- SLA entre 1 e 720 horas (30 dias)
- Soft delete para categorias com tickets associados

#### Relacionamentos
- Pertence a um Tenant específico
- Pode ter múltiplos Tickets associados

#### Exemplo de Categoria
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Suporte Técnico",
  "description": "Tickets relacionados a problemas técnicos",
  "color": "#FF5722",
  "icon": "support",
  "slaHours": 24,
  "isActive": true,
  "tenantId": "tenant-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🛠️ Tecnologias Utilizadas

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[Prisma](https://www.prisma.io/)** - ORM moderno com suporte a hierarquias
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação contextual
- **[Swagger](https://swagger.io/)** - Documentação interativa
- **[Docker](https://www.docker.com/)** - Containerização
- **[Kubernetes](https://kubernetes.io/)** - Orquestração de containers

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- PostgreSQL
- Docker (opcional)

### Configuração do Projeto

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd data_intelligence_api
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Inicie o PostgreSQL com Docker**
```bash
docker-compose up -d postgres redis
```

4. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env com as seguintes variáveis:
DATABASE_URL="postgresql://tickets:tickets_secure_pass@localhost:5432/tickets_db?schema=public"
JWT_SECRET="super_secure_jwt_secret_for_production"
JWT_EXPIRES_IN="7d"
PORT=3010
NODE_ENV=development
REDIS_URL="redis://localhost:6379"
```

5. **Execute as migrações do banco**
```bash
npx prisma db push
```

6. **Gere o cliente Prisma**
```bash
npx prisma generate
```

## 🚀 Executando a Aplicação

### Desenvolvimento
```bash
# Com variáveis de ambiente inline
DATABASE_URL="postgresql://tickets:tickets_secure_pass@localhost:5432/tickets_db?schema=public" \
JWT_SECRET="super_secure_jwt_secret_for_production" \
JWT_EXPIRES_IN="7d" \
PORT=3010 \
npm run start:dev
```

### Produção
```bash
# Com Docker Compose (recomendado)
docker-compose up -d

# Ou manualmente
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3010`

## 📖 Documentação da API

Após iniciar a aplicação, acesse a documentação interativa do Swagger em:
```
http://localhost:3010/docs
```

## 🧪 Testando a API Multi-Tenant

### 1. Verificar Status da API
```bash
curl http://localhost:3010/
# Resposta: Hello World!
```

### 2. Listar Tenants Disponíveis
```bash
curl http://localhost:3010/tenants
```

### 3. Login em um Tenant Específico
```bash
# Login na Lacoste
curl -X POST "http://localhost:3010/lacoste/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lacoste.com",
    "password": "senha123"
  }'
```

### 4. Acessar Tickets do Tenant
```bash
# Listar tickets da Lacoste (com token obtido no login)
curl -X GET "http://localhost:3010/lacoste/tickets" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### 5. Criar Ticket no Tenant
```bash
# Criar ticket na Nike
curl -X POST "http://localhost:3010/nike/tickets" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Problema no Sistema",
    "description": "Descrição detalhada do problema",
    "categoryId": "uuid-da-categoria",
    "priority": "HIGH"
  }'
```

### 6. Obter Estatísticas do Tenant
```bash
# Estatísticas dos tickets da Lacoste
curl -X GET "http://localhost:3010/lacoste/tickets/stats" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

## 🔄 Migrações e Mudanças

### Versão 2.0 - Multi-Tenant via Param de Rota

#### **Principais Mudanças:**
1. **Rota de Login**: `POST /:tenant/auth/login`
2. **Remoção do CNPJ**: Login agora usa apenas email/password
3. **TenantContextGuard**: Guard global para validação de tenant
4. **JWT Contextual**: Tokens incluem informações do tenant
5. **Rotas Contextuais**: Todas as rotas incluem tenant slug

#### **Benefícios:**
- ✅ **URLs mais intuitivas** e organizadas
- ✅ **Isolamento automático** por tenant
- ✅ **Segurança aprimorada** com validação cruzada
- ✅ **Melhor experiência** para desenvolvedores
- ✅ **Escalabilidade** para múltiplos tenants

## 🏗️ Arquitetura do Sistema de Franquias

### 🔗 Hierarquia de Tenants

```
👑 CROWN (Crown Company) - /crown/*
├── 🏬 FRANQUEADOR (Lacoste Matriz) - /lacoste-matriz/*
│   ├── 🏪 FRANQUIA (Lacoste Loja Shopping) - /lacoste-shopping/*
│   └── 🏪 FRANQUIA (Lacoste Loja Centro) - /lacoste-centro/*
├── 🏬 FRANQUEADOR (Nike Matriz) - /nike-matriz/*
│   └── 🏪 FRANQUIA (Nike Loja Outlet) - /nike-outlet/*
└── 🏬 FRANQUEADOR (McDonald's Matriz) - /mcdonalds-matriz/*
    └── 🏪 FRANQUIA (McDonald's Loja Praça) - /mcdonalds-praca/*
```

### 🎯 Níveis de Acesso

#### 👑 **CROWN (Crown Company)**
- **URL**: `/crown/auth/login`
- **Visibilidade**: **TUDO** sem filtros
- **Funcionalidades**:
  - Seleção de marca específica
  - Seleção de segmento
  - Relatórios globais e consolidados
  - Administração de todos os tenants

#### 🏬 **FRANQUEADOR (ex: Lacoste Matriz)**
- **URL**: `/lacoste-matriz/auth/login`
- **Visibilidade**: **Todas as lojas da sua marca**
- **Funcionalidades**:
  - Vê todos os chamados de suas franquias
  - BI consolidado da marca
  - Gerenciamento de franquias
  - Configurações da marca

#### 🏪 **FRANQUIA (ex: Lacoste Loja Shopping)**
- **URL**: `/lacoste-shopping/auth/login`
- **Visibilidade**: **Apenas seus próprios dados**
- **Funcionalidades**:
  - Vê apenas chamados da sua loja
  - BI específico da loja
  - Gerenciamento local
  - Configurações da loja

## 🎨 Segmentação de Mercado

### 📂 Segmentos Disponíveis

- **👗 MODA** - Lacoste, Nike, Adidas, Zara, etc.
- **🍔 FOOD** - McDonald's, Burger King, KFC, etc.
- **💊 FARMA** - Drogasil, Raia, Pacheco, etc.
- **💻 TECH** - Apple Store, Samsung, etc.
- **💄 BEAUTY** - Sephora, O Boticário, etc.
- **⚽ SPORT** - Centauro, Decathlon, etc.
- **📦 OTHER** - Outros segmentos

### 🎯 Funcionalidades por Segmento

- **Categorização automática** de tickets
- **Relatórios segmentados** para Crown
- **Configurações específicas** por segmento
- **Templates personalizados** por mercado

## 🏷️ Categorização Flexível
- **Categorias personalizadas** por tenant
- **Cores e ícones** customizáveis
- **SLA específico** por categoria
- **Herança de configurações** do franqueador

## 🌐 CORS Configurado
A API está configurada para aceitar requisições de frontends rodando em:
- `http://localhost:3000` (React/Next.js)
- `http://localhost:3001` (React alternativo)
- `http://localhost:5173` (Vite)
- `http://localhost:5174` (Vite alternativo)
- `http://localhost:8080` (Vue.js)
- `http://localhost:4200` (Angular)
- `http://127.0.0.1:*` (Localhost alternativo)

## 🧪 Testes e Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod

# Testes
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format

# Banco de dados
npx prisma studio
npx prisma migrate dev
npx prisma db push
npx prisma generate
```

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o arquivo CONTRIBUTING.md para detalhes sobre como contribuir.

## 📞 Suporte

Para suporte, entre em contato através dos issues do GitHub ou email: suporte@seudominio.com

---

**Desenvolvido com ❤️ usando NestJS, Prisma e PostgreSQL**
