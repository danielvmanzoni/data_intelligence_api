# 🏢 API Multi-Tenant - Guia Frontend

## 📋 Visão Geral

Este documento contém todas as instruções necessárias para o frontend consumir a API multi-tenant. A API foi refatorada para usar **tenant como parâmetro na URL** em vez de CNPJ no login.

## 🔧 Configuração Base

```javascript
const API_BASE_URL = 'http://localhost:3010';
```

## 🏪 Tenants Disponíveis

**⚠️ IMPORTANTE**: Use os slugs corretos! Tenants incorretos retornam 404.

| Empresa | Slug | Tipo |
|---------|------|------|
| Crown Company | `crown` | Empresa Principal |
| Lacoste Matriz | `lacoste-matriz` | Franqueador |
| Lacoste Shopping | `lacoste-loja-shopping` | Franquia |
| Lacoste Centro | `lacoste-loja-centro` | Franquia |
| McDonald's Matriz | `mcdonalds-matriz` | Franqueador |
| McDonald's Praça | `mcdonalds-loja-praca` | Franquia |
| Drogasil Matriz | `drogasil-matriz` | Franqueador |
| Drogasil Bela Vista | `drogasil-loja-bela-vista` | Franquia |

## 🔐 Credenciais de Teste

### Crown Company
```javascript
{
  email: 'admin@crown.com',
  password: 'crown123',
  tenant: 'crown'
}
```

### Lacoste
```javascript
// Matriz
{
  email: 'admin@lacoste.com',
  password: 'lacoste123',
  tenant: 'lacoste-matriz'
}

// Loja Shopping
{
  email: 'admin@lacoste-shopping.com',
  password: 'loja123',
  tenant: 'lacoste-loja-shopping'
}

// Loja Centro
{
  email: 'admin@lacoste-centro.com',
  password: 'loja123',
  tenant: 'lacoste-loja-centro'
}
```

### McDonald's
```javascript
// Matriz
{
  email: 'admin@mcdonalds.com',
  password: 'mcdonalds123',
  tenant: 'mcdonalds-matriz'
}
```

### Drogasil
```javascript
// Matriz
{
  email: 'admin@drogasil.com',
  password: 'drogasil123',
  tenant: 'drogasil-matriz'
}
```

## 🚀 Endpoints da API

### Endpoints Públicos
```javascript
GET /tenants                    // Listar todos os tenants
```

### Endpoints por Tenant
```javascript
POST /{tenant}/auth/login       // Login específico do tenant
GET /{tenant}/tickets          // Listar tickets do tenant
POST /{tenant}/tickets         // Criar ticket
GET /{tenant}/tickets/{id}     // Buscar ticket específico
PATCH /{tenant}/tickets/{id}   // Atualizar ticket
DELETE /{tenant}/tickets/{id}  // Deletar ticket
GET /{tenant}/ticket-category  // Listar categorias
GET /{tenant}/ticket-comment   // Listar comentários
POST /{tenant}/ticket-comment  // Adicionar comentário
GET /{tenant}/log             // Buscar logs
```

## 📝 Exemplo de Login

### JavaScript Vanilla
```javascript
async function login(tenant, email, password) {
  const response = await fetch(`${API_BASE_URL}/${tenant}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  localStorage.setItem('authToken', data.access_token);
  localStorage.setItem('currentTenant', tenant);
  
  return data;
}

// Uso
const result = await login('mcdonalds-matriz', 'admin@mcdonalds.com', 'mcdonalds123');
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3010'
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function login(tenant, email, password) {
  const response = await api.post(`/${tenant}/auth/login`, {
    email,
    password
  });
  
  localStorage.setItem('authToken', response.data.access_token);
  localStorage.setItem('currentTenant', tenant);
  
  return response.data;
}

// Buscar tickets
async function getTickets(tenant) {
  const response = await api.get(`/${tenant}/tickets`);
  return response.data;
}
```

## ⚛️ Exemplo React

```jsx
import React, { useState } from 'react';

function LoginForm() {
  const [selectedTenant, setSelectedTenant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const tenants = [
    { value: 'crown', label: 'Crown Company' },
    { value: 'lacoste-matriz', label: 'Lacoste Matriz' },
    { value: 'mcdonalds-matriz', label: "McDonald's Matriz" },
    { value: 'drogasil-matriz', label: 'Drogasil Matriz' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3010/${selectedTenant}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      localStorage.setItem('authToken', data.access_token);
      setUser(data.user);
      
      alert('Login realizado com sucesso!');
    } catch (error) {
      alert('Erro no login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login Multi-Tenant</h2>
      
      {!user ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Tenant:</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              required
            >
              <option value="">Selecione um tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.value} value={tenant.value}>
                  {tenant.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      ) : (
        <div>
          <h3>Bem-vindo, {user.name}!</h3>
          <p>Tenant: {user.tenant.name}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
```

## 🌟 Exemplo Vue.js

```vue
<template>
  <div>
    <h2>Login Multi-Tenant</h2>
    
    <form v-if="!user" @submit.prevent="handleLogin">
      <div>
        <label>Tenant:</label>
        <select v-model="selectedTenant" required>
          <option value="">Selecione um tenant</option>
          <option v-for="tenant in tenants" :key="tenant.value" :value="tenant.value">
            {{ tenant.label }}
          </option>
        </select>
      </div>
      
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      
      <div>
        <label>Senha:</label>
        <input v-model="password" type="password" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
    
    <div v-else>
      <h3>Bem-vindo, {{ user.name }}!</h3>
      <p>Tenant: {{ user.tenant.name }}</p>
      <p>Role: {{ user.role }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedTenant: '',
      email: '',
      password: '',
      loading: false,
      user: null,
      tenants: [
        { value: 'crown', label: 'Crown Company' },
        { value: 'lacoste-matriz', label: 'Lacoste Matriz' },
        { value: 'mcdonalds-matriz', label: "McDonald's Matriz" },
        { value: 'drogasil-matriz', label: 'Drogasil Matriz' },
      ]
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      
      try {
        const response = await fetch(`http://localhost:3010/${this.selectedTenant}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: this.email, 
            password: this.password 
          }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('authToken', data.access_token);
        this.user = data.user;
        
        this.$toast.success('Login realizado com sucesso!');
      } catch (error) {
        this.$toast.error('Erro no login: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## 🎯 Gerenciamento de Estado

### Context API (React)
```jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(
    localStorage.getItem('currentTenant')
  );

  const login = async (tenant, email, password) => {
    const response = await fetch(`http://localhost:3010/${tenant}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('currentTenant', tenant);
    
    setUser(data.user);
    setCurrentTenant(tenant);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentTenant');
    setUser(null);
    setCurrentTenant(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentTenant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Vuex (Vue.js)
```javascript
// store/auth.js
export default {
  namespaced: true,
  state: {
    user: null,
    currentTenant: localStorage.getItem('currentTenant'),
    token: localStorage.getItem('authToken')
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TENANT(state, tenant) {
      state.currentTenant = tenant;
      localStorage.setItem('currentTenant', tenant);
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('authToken', token);
    },
    LOGOUT(state) {
      state.user = null;
      state.currentTenant = null;
      state.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentTenant');
    }
  },
  actions: {
    async login({ commit }, { tenant, email, password }) {
      const response = await fetch(`http://localhost:3010/${tenant}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      commit('SET_TOKEN', data.access_token);
      commit('SET_USER', data.user);
      commit('SET_TENANT', tenant);
      
      return data;
    },
    logout({ commit }) {
      commit('LOGOUT');
    }
  }
};
```

## 🛠️ Interceptors e Middleware

### Axios Interceptor
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3010'
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentTenant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 📊 Estrutura de Dados

### Resposta do Login
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin McDonald's",
    "email": "admin@mcdonalds.com",
    "role": "FRANCHISOR_ADMIN",
    "tenant": {
      "id": 2,
      "name": "McDonald's Matriz",
      "slug": "mcdonalds-matriz",
      "cnpj": "22.222.222/0001-22",
      "brand": "McDonald's",
      "segment": "FAST_FOOD"
    }
  }
}
```

### Estrutura do Ticket
```javascript
{
  "id": 1,
  "title": "Problema no sistema",
  "description": "Sistema está lento",
  "status": "OPEN",
  "priority": "HIGH",
  "categoryId": 1,
  "tenantId": 2,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "category": {
    "id": 1,
    "name": "Técnico",
    "description": "Problemas técnicos"
  }
}
```

## 🚨 Pontos Importantes

1. **Tenant Obrigatório**: Todas as rotas protegidas precisam do tenant na URL
2. **Slugs Corretos**: Use os slugs exatos listados acima
3. **Autenticação**: Apenas email e password são necessários (sem CNPJ)
4. **Isolamento**: Cada tenant tem dados completamente isolados
5. **JWT**: Token contém informações do tenant e usuário
6. **Segurança**: Usuários só acessam dados do seu tenant

## 🔍 Debugging

### Verificar se a API está funcionando
```bash
# Listar tenants
curl http://localhost:3010/tenants

# Testar login
curl -X POST http://localhost:3010/mcdonalds-matriz/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mcdonalds.com","password":"mcdonalds123"}'
```

### Logs úteis
```javascript
// Verificar se o tenant está correto
console.log('Current tenant:', localStorage.getItem('currentTenant'));

// Verificar se o token está válido
console.log('Auth token:', localStorage.getItem('authToken'));

// Testar endpoints
fetch('http://localhost:3010/tenants')
  .then(r => r.json())
  .then(console.log);
```

## 📞 Suporte

Para dúvidas ou problemas, verifique:

1. Se o tenant slug está correto
2. Se as credenciais estão corretas
3. Se o token JWT está sendo enviado
4. Se a API está rodando na porta 3010

---

**Arquivo de exemplo completo**: `examples/frontend-multi-tenant-usage.js` 