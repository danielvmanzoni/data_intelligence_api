// Exemplo de uso da API no frontend

// Configuração base da API
const API_BASE_URL = 'http://localhost:3010';

// Classe para interagir com a API
class FranchiseAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.baseHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Headers com autenticação
  getAuthHeaders() {
    return {
      ...this.baseHeaders,
      Authorization: `Bearer ${this.token}`,
    };
  }

  // Login
  async login(cnpj, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ cnpj, email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Listar tenants
  async getTenants() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants`, {
        headers: this.getAuthHeaders(),
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

  // Listar marcas
  async getBrands() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/brands`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      return await response.json();
    } catch (error) {
      console.error('Get brands error:', error);
      throw error;
    }
  }

  // Buscar tenant por CNPJ
  async getTenantByCnpj(cnpj) {
    try {
      const encodedCnpj = encodeURIComponent(cnpj);
      const response = await fetch(
        `${API_BASE_URL}/tenants/cnpj/${encodedCnpj}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tenant');
      }

      return await response.json();
    } catch (error) {
      console.error('Get tenant by CNPJ error:', error);
      throw error;
    }
  }

  // Listar tickets
  async getTickets() {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      return await response.json();
    } catch (error) {
      console.error('Get tickets error:', error);
      throw error;
    }
  }

  // Criar ticket
  async createTicket(ticketData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      return await response.json();
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  }

  // Obter tenants acessíveis
  async getAccessibleTenants() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/accessible-tenants`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accessible tenants');
      }

      return await response.json();
    } catch (error) {
      console.error('Get accessible tenants error:', error);
      throw error;
    }
  }
}

// Exemplo de uso
async function exemploDeUso() {
  const api = new FranchiseAPI();

  try {
    // 1. Login
    console.log('Fazendo login...');
    const loginResult = await api.login(
      '11.111.111/0001-11',
      'admin@lacoste.com',
      'lacoste123',
    );
    console.log('Login realizado:', loginResult.user);

    // 2. Listar marcas
    console.log('Buscando marcas...');
    const brands = await api.getBrands();
    console.log('Marcas disponíveis:', brands);

    // 3. Listar tenants
    console.log('Buscando tenants...');
    const tenants = await api.getTenants();
    console.log('Tenants:', tenants);

    // 4. Buscar tenant por CNPJ
    console.log('Buscando tenant por CNPJ...');
    const tenant = await api.getTenantByCnpj('11.111.111/0002-22');
    console.log('Tenant encontrado:', tenant);

    // 5. Listar tickets
    console.log('Buscando tickets...');
    const tickets = await api.getTickets();
    console.log('Tickets:', tickets);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Exemplo com React
function LoginComponent() {
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const api = new FranchiseAPI();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.login(cnpj, email, password);
      setUser(result.user);
      alert('Login realizado com sucesso!');
    } catch (error) {
      alert('Erro no login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login Sistema de Franquias</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>CNPJ:</label>
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@empresa.com"
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

      {user && (
        <div>
          <h3>Bem-vindo, {user.name}!</h3>
          <p>Role: {user.role}</p>
          <p>Tenant: {user.tenant.name}</p>
          <p>Marca: {user.tenant.brand}</p>
          <p>Segmento: {user.tenant.segment}</p>
        </div>
      )}
    </div>
  );
}

// Exemplo com Vue.js
const VueLoginComponent = {
  data() {
    return {
      cnpj: '',
      email: '',
      password: '',
      loading: false,
      user: null,
      api: new FranchiseAPI(),
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;

      try {
        const result = await this.api.login(
          this.cnpj,
          this.email,
          this.password,
        );
        this.user = result.user;
        this.$toast.success('Login realizado com sucesso!');
      } catch (error) {
        this.$toast.error('Erro no login: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
  },
  template: `
    <div>
      <h2>Login Sistema de Franquias</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label>CNPJ:</label>
          <input v-model="cnpj" type="text" placeholder="00.000.000/0001-00" required />
        </div>
        <div>
          <label>Email:</label>
          <input v-model="email" type="email" placeholder="admin@empresa.com" required />
        </div>
        <div>
          <label>Senha:</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div v-if="user">
        <h3>Bem-vindo, {{ user.name }}!</h3>
        <p>Role: {{ user.role }}</p>
        <p>Tenant: {{ user.tenant.name }}</p>
        <p>Marca: {{ user.tenant.brand }}</p>
        <p>Segmento: {{ user.tenant.segment }}</p>
      </div>
    </div>
  `,
};

// Exportar para uso
export { FranchiseAPI, exemploDeUso, LoginComponent, VueLoginComponent };
