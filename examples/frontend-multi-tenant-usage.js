// ============================================================================
// 📚 DOCUMENTAÇÃO COMPLETA DA API MULTI-TENANT
// ============================================================================

// 🔧 Configuração base da API
const API_BASE_URL = 'http://localhost:3010';

// 🏪 TENANTS DISPONÍVEIS (usar os slugs corretos!)
const AVAILABLE_TENANTS = {
  // Crown Company (empresa principal)
  CROWN: 'crown',

  // Lacoste
  LACOSTE_MATRIZ: 'lacoste-matriz',
  LACOSTE_SHOPPING: 'lacoste-loja-shopping',
  LACOSTE_CENTRO: 'lacoste-loja-centro',

  // McDonald's
  MCDONALDS_MATRIZ: 'mcdonalds-matriz',
  MCDONALDS_PRACA: 'mcdonalds-loja-praca',

  // Drogasil
  DROGASIL_MATRIZ: 'drogasil-matriz',
  DROGASIL_BELA_VISTA: 'drogasil-loja-bela-vista',
};

// 🔐 CREDENCIAIS DE TESTE
const TEST_CREDENTIALS = {
  // Crown Company
  CROWN_ADMIN: {
    email: 'admin@crown.com',
    password: 'crown123',
    tenant: AVAILABLE_TENANTS.CROWN,
  },

  // Lacoste
  LACOSTE_ADMIN: {
    email: 'admin@lacoste.com',
    password: 'lacoste123',
    tenant: AVAILABLE_TENANTS.LACOSTE_MATRIZ,
  },
  LACOSTE_SHOPPING: {
    email: 'admin@lacoste-shopping.com',
    password: 'loja123',
    tenant: AVAILABLE_TENANTS.LACOSTE_SHOPPING,
  },
  LACOSTE_CENTRO: {
    email: 'admin@lacoste-centro.com',
    password: 'loja123',
    tenant: AVAILABLE_TENANTS.LACOSTE_CENTRO,
  },

  // McDonald's
  MCDONALDS_ADMIN: {
    email: 'admin@mcdonalds.com',
    password: 'mcdonalds123',
    tenant: AVAILABLE_TENANTS.MCDONALDS_MATRIZ,
  },

  // Drogasil
  DROGASIL_ADMIN: {
    email: 'admin@drogasil.com',
    password: 'drogasil123',
    tenant: AVAILABLE_TENANTS.DROGASIL_MATRIZ,
  },
};

// 🚀 Classe principal para interagir com a API Multi-Tenant
class MultiTenantAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.currentTenant = localStorage.getItem('currentTenant');
    this.baseHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // 📝 Headers com autenticação
  getAuthHeaders() {
    return {
      ...this.baseHeaders,
      Authorization: `Bearer ${this.token}`,
    };
  }

  // 🔓 Login em um tenant específico
  async login(tenant, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/${tenant}/auth/login`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      this.token = data.access_token;
      this.currentTenant = tenant;

      // Salvar no localStorage
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('currentTenant', tenant);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 🚪 Logout
  logout() {
    this.token = null;
    this.currentTenant = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentTenant');
    localStorage.removeItem('user');
  }

  // 📋 Listar todos os tenants (rota global)
  async getTenants() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants`, {
        headers: this.baseHeaders,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      return await response.json();
    } catch (error) {
      console.error('Get tenants error:', error);
      throw error;
    }
  }

  // 🎫 Listar tickets do tenant atual
  async getTickets() {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/tickets`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      return await response.json();
    } catch (error) {
      console.error('Get tickets error:', error);
      throw error;
    }
  }

  // ➕ Criar novo ticket
  async createTicket(ticketData) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/tickets`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(ticketData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  }

  // 🔍 Buscar ticket por ID
  async getTicketById(ticketId) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/tickets/${ticketId}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ticket by ID error:', error);
      throw error;
    }
  }

  // ✏️ Atualizar ticket
  async updateTicket(ticketId, updateData) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/tickets/${ticketId}`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Update ticket error:', error);
      throw error;
    }
  }

  // 🗑️ Deletar ticket
  async deleteTicket(ticketId) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/tickets/${ticketId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      return true;
    } catch (error) {
      console.error('Delete ticket error:', error);
      throw error;
    }
  }

  // 🏷️ Listar categorias de tickets
  async getTicketCategories() {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/ticket-category`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ticket categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ticket categories error:', error);
      throw error;
    }
  }

  // 💬 Listar comentários de um ticket
  async getTicketComments(ticketId) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/ticket-comment?ticketId=${ticketId}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ticket comments');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ticket comments error:', error);
      throw error;
    }
  }

  // ➕ Adicionar comentário a um ticket
  async addTicketComment(ticketId, comment) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/${this.currentTenant}/ticket-comment`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ ticketId, comment }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add comment');
      }

      return await response.json();
    } catch (error) {
      console.error('Add ticket comment error:', error);
      throw error;
    }
  }

  // 📊 Buscar logs
  async getLogs(filters = {}) {
    if (!this.currentTenant) {
      throw new Error('No tenant selected. Please login first.');
    }

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/${this.currentTenant}/log${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Get logs error:', error);
      throw error;
    }
  }
}

// ============================================================================
// 🎯 EXEMPLOS DE USO
// ============================================================================

// 📘 Exemplo básico de uso
async function exemploBasico() {
  const api = new MultiTenantAPI();

  try {
    // 1. Login no tenant McDonald's
    console.log("🔑 Fazendo login no McDonald's...");
    const loginResult = await api.login(
      AVAILABLE_TENANTS.MCDONALDS_MATRIZ,
      'admin@mcdonalds.com',
      'mcdonalds123',
    );
    console.log('✅ Login realizado:', loginResult.user);

    // 2. Listar tickets
    console.log('📋 Buscando tickets...');
    const tickets = await api.getTickets();
    console.log('📄 Tickets encontrados:', tickets);

    // 3. Criar um novo ticket
    console.log('➕ Criando novo ticket...');
    const newTicket = await api.createTicket({
      title: 'Problema com sistema de pedidos',
      description: 'O sistema está lento durante o horário de pico',
      priority: 'HIGH',
      categoryId: 1, // Assumindo que existe uma categoria com ID 1
    });
    console.log('✅ Ticket criado:', newTicket);

    // 4. Buscar categorias
    console.log('🏷️ Buscando categorias...');
    const categories = await api.getTicketCategories();
    console.log('📝 Categorias:', categories);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// 🔄 Exemplo com troca de tenant
async function exemploTrocaTenant() {
  const api = new MultiTenantAPI();

  try {
    // Login no Lacoste
    console.log('🔑 Login no Lacoste...');
    await api.login(
      AVAILABLE_TENANTS.LACOSTE_MATRIZ,
      'admin@lacoste.com',
      'lacoste123',
    );

    const lacosteTtickets = await api.getTickets();
    console.log('👔 Tickets do Lacoste:', lacosteTtickets);

    // Logout e login em outro tenant
    api.logout();
    console.log('🔄 Trocando para Drogasil...');

    await api.login(
      AVAILABLE_TENANTS.DROGASIL_MATRIZ,
      'admin@drogasil.com',
      'drogasil123',
    );

    const drogasilTickets = await api.getTickets();
    console.log('💊 Tickets do Drogasil:', drogasilTickets);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// ============================================================================
// ⚛️ COMPONENTE REACT
// ============================================================================

// 🎨 Exemplo com React (usando hooks)
function MultiTenantLoginComponent() {
  const [selectedTenant, setSelectedTenant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const api = new MultiTenantAPI();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(selectedTenant, email, password);
      setUser(result.user);

      // Carregar tickets automaticamente após login
      const userTickets = await api.getTickets();
      setTickets(userTickets);

      alert('✅ Login realizado com sucesso!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTickets([]);
    setSelectedTenant('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="multi-tenant-login">
      <h2>🏢 Sistema Multi-Tenant</h2>

      {!user ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>🏪 Tenant:</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              required
            >
              <option value="">Selecione um tenant</option>
              <option value={AVAILABLE_TENANTS.CROWN}>Crown Company</option>
              <option value={AVAILABLE_TENANTS.LACOSTE_MATRIZ}>
                Lacoste Matriz
              </option>
              <option value={AVAILABLE_TENANTS.LACOSTE_SHOPPING}>
                Lacoste Shopping
              </option>
              <option value={AVAILABLE_TENANTS.MCDONALDS_MATRIZ}>
                McDonald's Matriz
              </option>
              <option value={AVAILABLE_TENANTS.DROGASIL_MATRIZ}>
                Drogasil Matriz
              </option>
            </select>
          </div>

          <div>
            <label>📧 Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
              required
            />
          </div>

          <div>
            <label>🔒 Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Entrando...' : '🔑 Entrar'}
          </button>

          {error && <div className="error">❌ {error}</div>}
        </form>
      ) : (
        <div>
          <div className="user-info">
            <h3>👋 Bem-vindo, {user.name}!</h3>
            <p>🏢 Tenant: {user.tenant.name}</p>
            <p>👤 Role: {user.role}</p>
            <button onClick={handleLogout}>🚪 Sair</button>
          </div>

          <div className="tickets-section">
            <h4>📋 Tickets ({tickets.length})</h4>
            {tickets.length === 0 ? (
              <p>Nenhum ticket encontrado</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <h5>{ticket.title}</h5>
                  <p>{ticket.description}</p>
                  <span className={`status ${ticket.status.toLowerCase()}`}>
                    {ticket.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 🌟 COMPONENTE VUE.JS
// ============================================================================

const VueMultiTenantComponent = {
  data() {
    return {
      api: new MultiTenantAPI(),
      selectedTenant: '',
      email: '',
      password: '',
      loading: false,
      user: null,
      tickets: [],
      error: '',
      availableTenants: [
        { value: AVAILABLE_TENANTS.CROWN, label: 'Crown Company' },
        { value: AVAILABLE_TENANTS.LACOSTE_MATRIZ, label: 'Lacoste Matriz' },
        {
          value: AVAILABLE_TENANTS.LACOSTE_SHOPPING,
          label: 'Lacoste Shopping',
        },
        {
          value: AVAILABLE_TENANTS.MCDONALDS_MATRIZ,
          label: "McDonald's Matriz",
        },
        { value: AVAILABLE_TENANTS.DROGASIL_MATRIZ, label: 'Drogasil Matriz' },
      ],
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';

      try {
        const result = await this.api.login(
          this.selectedTenant,
          this.email,
          this.password,
        );
        this.user = result.user;

        // Carregar tickets
        this.tickets = await this.api.getTickets();

        this.$toast.success('✅ Login realizado com sucesso!');
      } catch (error) {
        this.error = error.message;
        this.$toast.error('❌ Erro no login: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    handleLogout() {
      this.api.logout();
      this.user = null;
      this.tickets = [];
      this.selectedTenant = '';
      this.email = '';
      this.password = '';
    },
  },

  template: `
    <div class="multi-tenant-login">
      <h2>🏢 Sistema Multi-Tenant</h2>
      
      <form v-if="!user" @submit.prevent="handleLogin">
        <div>
          <label>🏪 Tenant:</label>
          <select v-model="selectedTenant" required>
            <option value="">Selecione um tenant</option>
            <option v-for="tenant in availableTenants" :key="tenant.value" :value="tenant.value">
              {{ tenant.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label>📧 Email:</label>
          <input v-model="email" type="email" placeholder="admin@empresa.com" required />
        </div>
        
        <div>
          <label>🔒 Senha:</label>
          <input v-model="password" type="password" required />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? '⏳ Entrando...' : '🔑 Entrar' }}
        </button>
        
        <div v-if="error" class="error">❌ {{ error }}</div>
      </form>
      
      <div v-else>
        <div class="user-info">
          <h3>👋 Bem-vindo, {{ user.name }}!</h3>
          <p>🏢 Tenant: {{ user.tenant.name }}</p>
          <p>👤 Role: {{ user.role }}</p>
          <button @click="handleLogout">🚪 Sair</button>
        </div>
        
        <div class="tickets-section">
          <h4>📋 Tickets ({{ tickets.length }})</h4>
          <div v-if="tickets.length === 0">
            <p>Nenhum ticket encontrado</p>
          </div>
          <div v-else>
            <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
              <h5>{{ ticket.title }}</h5>
              <p>{{ ticket.description }}</p>
              <span :class="['status', ticket.status.toLowerCase()]">
                {{ ticket.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

// ============================================================================
// 🎯 HELPER FUNCTIONS
// ============================================================================

// 🛠️ Função para testar credenciais rapidamente
async function testCredentials(credentialKey) {
  const api = new MultiTenantAPI();
  const credentials = TEST_CREDENTIALS[credentialKey];

  if (!credentials) {
    console.error('❌ Credencial não encontrada:', credentialKey);
    return;
  }

  try {
    console.log(`🔑 Testando login: ${credentialKey}`);
    const result = await api.login(
      credentials.tenant,
      credentials.email,
      credentials.password,
    );
    console.log('✅ Login bem-sucedido:', result.user.name);

    const tickets = await api.getTickets();
    console.log('📋 Tickets encontrados:', tickets.length);

    return { success: true, user: result.user, tickets };
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { success: false, error: error.message };
  }
}

// 🔄 Função para listar todos os tenants disponíveis
async function listAllTenants() {
  const api = new MultiTenantAPI();

  try {
    const tenants = await api.getTenants();
    console.log('🏢 Tenants disponíveis:');
    tenants.forEach((tenant) => {
      console.log(`- ${tenant.slug} (${tenant.name})`);
    });
    return tenants;
  } catch (error) {
    console.error('❌ Erro ao buscar tenants:', error);
    throw error;
  }
}

// ============================================================================
// 📤 EXPORTS
// ============================================================================

// Para uso em módulos ES6
export {
  MultiTenantAPI,
  AVAILABLE_TENANTS,
  TEST_CREDENTIALS,
  exemploBasico,
  exemploTrocaTenant,
  MultiTenantLoginComponent,
  VueMultiTenantComponent,
  testCredentials,
  listAllTenants,
};

// Para uso em CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MultiTenantAPI,
    AVAILABLE_TENANTS,
    TEST_CREDENTIALS,
    exemploBasico,
    exemploTrocaTenant,
    MultiTenantLoginComponent,
    VueMultiTenantComponent,
    testCredentials,
    listAllTenants,
  };
}

// ============================================================================
// 📝 NOTAS IMPORTANTES
// ============================================================================

/*
🚨 PONTOS IMPORTANTES PARA O FRONTEND:

1. 🏪 TENANT OBRIGATÓRIO: Todas as rotas protegidas precisam do tenant na URL
   - ✅ Correto: /mcdonalds-matriz/tickets
   - ❌ Errado: /tickets

2. 🔑 AUTHENTICATION: 
   - Login: POST /{tenant}/auth/login
   - Apenas email e password são necessários
   - Token JWT retornado deve ser usado em todas as requisições

3. 📋 ENDPOINTS DISPONÍVEIS:
   - GET /tenants (público - listar todos os tenants)
   - POST /{tenant}/auth/login (login específico do tenant)
   - GET /{tenant}/tickets (listar tickets do tenant)
   - POST /{tenant}/tickets (criar ticket)
   - GET /{tenant}/tickets/{id} (buscar ticket específico)
   - PATCH /{tenant}/tickets/{id} (atualizar ticket)
   - DELETE /{tenant}/tickets/{id} (deletar ticket)
   - GET /{tenant}/ticket-category (listar categorias)
   - GET /{tenant}/ticket-comment (listar comentários)
   - POST /{tenant}/ticket-comment (adicionar comentário)
   - GET /{tenant}/log (buscar logs)

4. 🎯 SLUGS CORRETOS:
   - crown, lacoste-matriz, lacoste-loja-shopping, lacoste-loja-centro
   - mcdonalds-matriz, mcdonalds-loja-praca
   - drogasil-matriz, drogasil-loja-bela-vista

5. 🔒 SEGURANÇA:
   - Cada tenant tem seus próprios dados isolados
   - Usuários só podem acessar dados do seu tenant
   - JWT contém informações do tenant para validação

6. 📊 ESTRUTURA DE DADOS:
   - User: { id, name, email, role, tenant: { id, name, slug } }
   - Ticket: { id, title, description, status, priority, category, tenant }
   - Tenant: { id, name, slug, cnpj, brand, segment }
*/
