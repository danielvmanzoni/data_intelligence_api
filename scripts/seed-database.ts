import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpar banco de dados
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenantSettings.deleteMany();
  await prisma.tenant.deleteMany();

  // Criar tenant Crown (principal)
  const crownTenant = await prisma.tenant.create({
    data: {
      name: 'Crown Company',
      cnpj: '00.000.000/0001-00',
      subdomain: 'crown',
      type: 'CROWN',
      isActive: true,
      settings: {
        create: {
          primaryColor: '#1976D2',
          secondaryColor: '#424242',
          logo: 'https://placehold.co/200x100/1976D2/FFF.png?text=Crown',
          favicon: 'https://placehold.co/32x32/1976D2/FFF.png?text=C',
        },
      },
    },
  });

  // Criar admin do Crown
  const crownAdmin = await prisma.user.create({
    data: {
      name: 'Admin Crown',
      email: 'admin@crown.com',
      password: await bcrypt.hash('123456', 10),
      role: 'CROWN_ADMIN',
      isActive: true,
      tenantId: crownTenant.id,
    },
  });

  // Criar tenant Franqueador (Lacoste)
  const lacosteTenant = await prisma.tenant.create({
    data: {
      name: 'Lacoste Brasil',
      cnpj: '11.111.111/0001-11',
      subdomain: 'lacoste',
      type: 'FRANCHISOR',
      brand: 'Lacoste',
      segment: 'MODA',
      isActive: true,
      settings: {
        create: {
          primaryColor: '#27ae60',
          secondaryColor: '#2c3e50',
          logo: 'https://placehold.co/200x100/27ae60/FFF.png?text=Lacoste',
          favicon: 'https://placehold.co/32x32/27ae60/FFF.png?text=L',
        },
      },
    },
  });

  // Criar admin do Franqueador
  const lacosteAdmin = await prisma.user.create({
    data: {
      name: 'Admin Lacoste',
      email: 'admin@lacoste.com',
      password: await bcrypt.hash('123456', 10),
      role: 'FRANCHISOR_ADMIN',
      isActive: true,
      tenantId: lacosteTenant.id,
    },
  });

  // Criar agentes do Franqueador
  const lacosteAgent1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@lacoste.com',
      password: await bcrypt.hash('123456', 10),
      role: 'AGENT',
      isActive: true,
      tenantId: lacosteTenant.id,
    },
  });

  const lacosteAgent2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@lacoste.com',
      password: await bcrypt.hash('123456', 10),
      role: 'AGENT',
      isActive: true,
      tenantId: lacosteTenant.id,
    },
  });

  // Criar tenant Franquia (Lacoste Shopping)
  const lacosteFranchise = await prisma.tenant.create({
    data: {
      name: 'Lacoste Shopping Ibirapuera',
      cnpj: '22.222.222/0001-22',
      subdomain: 'lacoste-ibirapuera',
      type: 'FRANCHISE',
      brand: 'Lacoste',
      segment: 'MODA',
      isActive: true,
      parentTenantId: lacosteTenant.id,
      settings: {
        create: {
          primaryColor: '#27ae60',
          secondaryColor: '#2c3e50',
          logo: 'https://placehold.co/200x100/27ae60/FFF.png?text=Lacoste+Ibirapuera',
          favicon: 'https://placehold.co/32x32/27ae60/FFF.png?text=LI',
        },
      },
    },
  });

  // Criar admin da Franquia
  const franchiseAdmin = await prisma.user.create({
    data: {
      name: 'Admin Franquia',
      email: 'admin@lacoste-ibirapuera.com',
      password: await bcrypt.hash('123456', 10),
      role: 'FRANCHISE_ADMIN',
      isActive: true,
      tenantId: lacosteFranchise.id,
    },
  });

  // Criar categorias de tickets
  const categories = await Promise.all([
    prisma.ticketCategory.create({
      data: {
        name: 'Suporte Técnico',
        description: 'Problemas técnicos com sistemas e equipamentos',
        color: '#FF5722',
        icon: 'computer',
        isActive: true,
        slaHours: 24,
        tenantId: lacosteFranchise.id,
      },
    }),
    prisma.ticketCategory.create({
      data: {
        name: 'Vendas',
        description: 'Dúvidas sobre produtos, preços e vendas',
        color: '#4CAF50',
        icon: 'shopping_cart',
        isActive: true,
        slaHours: 4,
        tenantId: lacosteFranchise.id,
      },
    }),
    prisma.ticketCategory.create({
      data: {
        name: 'Financeiro',
        description: 'Questões relacionadas a pagamentos e faturamento',
        color: '#2196F3',
        icon: 'attach_money',
        isActive: true,
        slaHours: 48,
        tenantId: lacosteFranchise.id,
      },
    }),
  ]);

  // Criar alguns tickets de exemplo
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Problema com PDV',
        description: 'Sistema travando durante fechamento de vendas',
        status: 'OPEN',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
        guestName: 'Carlos Vendedor',
        guestEmail: 'carlos@lacoste-ibirapuera.com',
        guestPhone: '11999999999',
        tenantId: lacosteFranchise.id,
        categoryId: categories[0].id,
        creatorId: franchiseAdmin.id,
        assigneeId: lacosteAgent1.id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Dúvida sobre desconto',
        description:
          'Cliente perguntando sobre política de desconto para compras acima de R$ 1000',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
        guestName: 'Ana Vendedora',
        guestEmail: 'ana@lacoste-ibirapuera.com',
        guestPhone: '11988888888',
        tenantId: lacosteFranchise.id,
        categoryId: categories[1].id,
        creatorId: franchiseAdmin.id,
        assigneeId: lacosteAgent2.id,
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Erro na conciliação',
        description: 'Divergência nos valores do fechamento do dia',
        status: 'PENDING',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // +48h
        guestName: 'Paulo Financeiro',
        guestEmail: 'paulo@lacoste-ibirapuera.com',
        guestPhone: '11977777777',
        tenantId: lacosteFranchise.id,
        categoryId: categories[2].id,
        creatorId: franchiseAdmin.id,
      },
    }),
  ]);

  // Adicionar alguns comentários
  await Promise.all([
    prisma.ticketComment.create({
      data: {
        content: 'Iniciando análise do problema no PDV',
        ticketId: tickets[0].id,
        userId: lacosteAgent1.id,
      },
    }),
    prisma.ticketComment.create({
      data: {
        content:
          'Verificando com o setor comercial sobre a política de descontos',
        ticketId: tickets[1].id,
        userId: lacosteAgent2.id,
      },
    }),
  ]);

  console.log('✅ Seed concluído com sucesso!');
  console.log('\nCredenciais para teste:');
  console.log('\nCrown Admin:');
  console.log('Email: admin@crown.com');
  console.log('Senha: 123456');
  console.log('\nFranqueador (Lacoste):');
  console.log('Email: admin@lacoste.com');
  console.log('Senha: 123456');
  console.log('\nFranquia (Lacoste Shopping):');
  console.log('Email: admin@lacoste-ibirapuera.com');
  console.log('Senha: 123456');
  console.log('\nAgentes:');
  console.log('Email: joao@lacoste.com');
  console.log('Email: maria@lacoste.com');
  console.log('Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
