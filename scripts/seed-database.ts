import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando população do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.log.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenantSettings.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('🧹 Dados existentes limpos');

  // 1. Criar Crown Company
  const crownTenant = await prisma.tenant.create({
    data: {
      name: 'Crown Company',
      cnpj: '00.000.000/0001-00',
      subdomain: 'crown',
      type: 'CROWN',
      settings: {
        create: {
          allowGuestTickets: true,
          autoAssignTickets: false,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: false,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 24,
        },
      },
    },
  });

  console.log('👑 Crown Company criada');

  // 2. Criar Franqueadores
  const lacosteFranqueador = await prisma.tenant.create({
    data: {
      name: 'Lacoste Matriz',
      cnpj: '11.111.111/0001-11',
      subdomain: 'lacoste-matriz',
      domain: 'tickets.lacoste.com',
      type: 'FRANCHISOR',
      brand: 'Lacoste',
      segment: 'MODA',
      settings: {
        create: {
          allowGuestTickets: false,
          autoAssignTickets: true,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: true,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 12,
        },
      },
    },
  });

  const mcdonaldsFranqueador = await prisma.tenant.create({
    data: {
      name: "McDonald's Matriz",
      cnpj: '22.222.222/0001-22',
      subdomain: 'mcdonalds-matriz',
      domain: 'tickets.mcdonalds.com',
      type: 'FRANCHISOR',
      brand: "McDonald's",
      segment: 'FOOD',
      settings: {
        create: {
          allowGuestTickets: true,
          autoAssignTickets: true,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: false,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 8,
        },
      },
    },
  });

  const drogasilFranqueador = await prisma.tenant.create({
    data: {
      name: 'Drogasil Matriz',
      cnpj: '33.333.333/0001-33',
      subdomain: 'drogasil-matriz',
      domain: 'tickets.drogasil.com',
      type: 'FRANCHISOR',
      brand: 'Drogasil',
      segment: 'FARMA',
      settings: {
        create: {
          allowGuestTickets: false,
          autoAssignTickets: false,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: true,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 6,
        },
      },
    },
  });

  console.log('🏬 Franqueadores criados');

  // 3. Criar Franquias
  const lacosteFranquia1 = await prisma.tenant.create({
    data: {
      name: 'Lacoste Loja Shopping',
      cnpj: '11.111.111/0002-22',
      subdomain: 'lacoste-loja-shopping',
      type: 'FRANCHISE',
      brand: 'Lacoste',
      segment: 'MODA',
      parentTenantId: lacosteFranqueador.id,
      settings: {
        create: {
          allowGuestTickets: false,
          autoAssignTickets: true,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: false,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 12,
        },
      },
    },
  });

  const lacosteFranquia2 = await prisma.tenant.create({
    data: {
      name: 'Lacoste Loja Centro',
      cnpj: '11.111.111/0003-33',
      subdomain: 'lacoste-loja-centro',
      type: 'FRANCHISE',
      brand: 'Lacoste',
      segment: 'MODA',
      parentTenantId: lacosteFranqueador.id,
      settings: {
        create: {
          allowGuestTickets: false,
          autoAssignTickets: false,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: true,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 12,
        },
      },
    },
  });

  const mcdonaldsFranquia = await prisma.tenant.create({
    data: {
      name: "McDonald's Loja Praça",
      cnpj: '22.222.222/0002-33',
      subdomain: 'mcdonalds-loja-praca',
      type: 'FRANCHISE',
      brand: "McDonald's",
      segment: 'FOOD',
      parentTenantId: mcdonaldsFranqueador.id,
      settings: {
        create: {
          allowGuestTickets: true,
          autoAssignTickets: true,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: false,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 8,
        },
      },
    },
  });

  const drogasilFranquia = await prisma.tenant.create({
    data: {
      name: 'Drogasil Loja Bela Vista',
      cnpj: '33.333.333/0002-44',
      subdomain: 'drogasil-loja-bela-vista',
      type: 'FRANCHISE',
      brand: 'Drogasil',
      segment: 'FARMA',
      parentTenantId: drogasilFranqueador.id,
      settings: {
        create: {
          allowGuestTickets: false,
          autoAssignTickets: false,
          requireCategory: true,
          emailNotifications: true,
          smsNotifications: true,
          timezone: 'America/Sao_Paulo',
          defaultSlaHours: 6,
        },
      },
    },
  });

  console.log('🏪 Franquias criadas');

  // 4. Criar Usuários
  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  // Crown Admin
  const crownAdmin = await prisma.user.create({
    data: {
      name: 'Admin Crown',
      email: 'admin@crown.com',
      password: await hashPassword('crown123'),
      role: 'CROWN_ADMIN',
      tenantId: crownTenant.id,
    },
  });

  // Franqueador Admins
  const lacosteFranqueadorAdmin = await prisma.user.create({
    data: {
      name: 'Admin Lacoste Matriz',
      email: 'admin@lacoste.com',
      password: await hashPassword('lacoste123'),
      role: 'FRANCHISOR_ADMIN',
      tenantId: lacosteFranqueador.id,
    },
  });

  const mcdonaldsFranqueadorAdmin = await prisma.user.create({
    data: {
      name: "Admin McDonald's Matriz",
      email: 'admin@mcdonalds.com',
      password: await hashPassword('mcdonalds123'),
      role: 'FRANCHISOR_ADMIN',
      tenantId: mcdonaldsFranqueador.id,
    },
  });

  const drogasilFranqueadorAdmin = await prisma.user.create({
    data: {
      name: 'Admin Drogasil Matriz',
      email: 'admin@drogasil.com',
      password: await hashPassword('drogasil123'),
      role: 'FRANCHISOR_ADMIN',
      tenantId: drogasilFranqueador.id,
    },
  });

  // Franquia Admins
  const lacosteFranquiaAdmin1 = await prisma.user.create({
    data: {
      name: 'Admin Lacoste Shopping',
      email: 'admin@lacoste-shopping.com',
      password: await hashPassword('loja123'),
      role: 'FRANCHISE_ADMIN',
      tenantId: lacosteFranquia1.id,
    },
  });

  const lacosteFranquiaAdmin2 = await prisma.user.create({
    data: {
      name: 'Admin Lacoste Centro',
      email: 'admin@lacoste-centro.com',
      password: await hashPassword('loja123'),
      role: 'FRANCHISE_ADMIN',
      tenantId: lacosteFranquia2.id,
    },
  });

  // Agentes
  const lacosteAgent = await prisma.user.create({
    data: {
      name: 'João Silva - Atendente',
      email: 'joao@lacoste-shopping.com',
      password: await hashPassword('agent123'),
      role: 'AGENT',
      tenantId: lacosteFranquia1.id,
    },
  });

  const mcdonaldsAgent = await prisma.user.create({
    data: {
      name: 'Maria Santos - Atendente',
      email: 'maria@mcdonalds-praca.com',
      password: await hashPassword('agent123'),
      role: 'AGENT',
      tenantId: mcdonaldsFranquia.id,
    },
  });

  // Usuários finais
  const lacosteUser = await prisma.user.create({
    data: {
      name: 'Cliente Lacoste',
      email: 'cliente@lacoste-shopping.com',
      password: await hashPassword('user123'),
      role: 'USER',
      tenantId: lacosteFranquia1.id,
    },
  });

  console.log('👥 Usuários criados');

  // 5. Criar Categorias de Tickets
  const lacosteCategorias = await prisma.ticketCategory.createMany({
    data: [
      {
        name: 'Produto Defeituoso',
        description: 'Problemas com qualidade do produto',
        color: '#FF5722',
        icon: 'defect',
        slaHours: 24,
        tenantId: lacosteFranquia1.id,
      },
      {
        name: 'Atendimento',
        description: 'Questões relacionadas ao atendimento',
        color: '#2196F3',
        icon: 'service',
        slaHours: 12,
        tenantId: lacosteFranquia1.id,
      },
      {
        name: 'Troca/Devolução',
        description: 'Solicitações de troca ou devolução',
        color: '#4CAF50',
        icon: 'exchange',
        slaHours: 48,
        tenantId: lacosteFranquia1.id,
      },
    ],
  });

  const mcdonaldsCategorias = await prisma.ticketCategory.createMany({
    data: [
      {
        name: 'Pedido Incorreto',
        description: 'Problemas com pedidos',
        color: '#FF9800',
        icon: 'order',
        slaHours: 2,
        tenantId: mcdonaldsFranquia.id,
      },
      {
        name: 'Limpeza',
        description: 'Questões de limpeza e higiene',
        color: '#9C27B0',
        icon: 'clean',
        slaHours: 4,
        tenantId: mcdonaldsFranquia.id,
      },
    ],
  });

  console.log('📂 Categorias criadas');

  // 6. Criar Tickets
  const categoriaLacoste = await prisma.ticketCategory.findFirst({
    where: { tenantId: lacosteFranquia1.id },
  });

  const categoriaMcdonalds = await prisma.ticketCategory.findFirst({
    where: { tenantId: mcdonaldsFranquia.id },
  });

  const ticketLacoste1 = await prisma.ticket.create({
    data: {
      number: '001',
      title: 'Camiseta com defeito de costura',
      description:
        'Comprei uma camiseta Lacoste e ela veio com defeito na costura da manga direita.',
      status: 'OPEN',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      tenantId: lacosteFranquia1.id,
      creatorId: lacosteUser.id,
      assigneeId: lacosteAgent.id,
      categoryId: categoriaLacoste!.id,
    },
  });

  const ticketLacoste2 = await prisma.ticket.create({
    data: {
      number: '002',
      title: 'Solicitação de troca de tamanho',
      description: 'Gostaria de trocar uma polo tamanho M por tamanho G.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      tenantId: lacosteFranquia1.id,
      creatorId: lacosteUser.id,
      assigneeId: lacosteFranquiaAdmin1.id,
      categoryId: categoriaLacoste!.id,
    },
  });

  const ticketMcdonalds = await prisma.ticket.create({
    data: {
      number: '001',
      title: 'Pedido veio incompleto',
      description:
        'Pedi um Big Mac com batata e refrigerante, mas não veio a batata.',
      status: 'RESOLVED',
      priority: 'HIGH',
      resolvedAt: new Date(),
      tenantId: mcdonaldsFranquia.id,
      creatorId: null, // Ticket de convidado
      guestName: 'Carlos Silva',
      guestEmail: 'carlos@email.com',
      guestPhone: '(11) 99999-9999',
      assigneeId: mcdonaldsAgent.id,
      categoryId: categoriaMcdonalds!.id,
      rating: 4,
      feedback: 'Problema resolvido rapidamente, obrigado!',
    },
  });

  console.log('🎫 Tickets criados');

  // 7. Criar Comentários
  await prisma.ticketComment.createMany({
    data: [
      {
        content: 'Recebemos sua solicitação e vamos analisar o produto.',
        isInternal: false,
        tenantId: lacosteFranquia1.id,
        ticketId: ticketLacoste1.id,
        authorId: lacosteAgent.id,
      },
      {
        content: 'Cliente parece insatisfeito, vamos priorizar este caso.',
        isInternal: true,
        tenantId: lacosteFranquia1.id,
        ticketId: ticketLacoste1.id,
        authorId: lacosteFranquiaAdmin1.id,
      },
      {
        content: 'Temos o tamanho G disponível. Pode vir fazer a troca.',
        isInternal: false,
        tenantId: lacosteFranquia1.id,
        ticketId: ticketLacoste2.id,
        authorId: lacosteFranquiaAdmin1.id,
      },
      {
        content: 'Pedido refeito e entregue ao cliente. Problema resolvido.',
        isInternal: false,
        tenantId: mcdonaldsFranquia.id,
        ticketId: ticketMcdonalds.id,
        authorId: mcdonaldsAgent.id,
      },
    ],
  });

  console.log('💬 Comentários criados');

  // 8. Criar Logs
  await prisma.log.createMany({
    data: [
      {
        action: 'TICKET_CREATED',
        entity: 'TICKET',
        entityId: ticketLacoste1.id,
        message: 'Ticket #001 criado por Cliente Lacoste',
        tenantId: lacosteFranquia1.id,
        userId: lacosteUser.id,
        ticketId: ticketLacoste1.id,
      },
      {
        action: 'TICKET_ASSIGNED',
        entity: 'TICKET',
        entityId: ticketLacoste1.id,
        oldValue: null,
        newValue: lacosteAgent.id,
        message: 'Ticket #001 atribuído para João Silva - Atendente',
        tenantId: lacosteFranquia1.id,
        userId: lacosteFranquiaAdmin1.id,
        ticketId: ticketLacoste1.id,
      },
      {
        action: 'STATUS_CHANGED',
        entity: 'TICKET',
        entityId: ticketMcdonalds.id,
        oldValue: 'IN_PROGRESS',
        newValue: 'RESOLVED',
        message: 'Ticket #001 resolvido',
        tenantId: mcdonaldsFranquia.id,
        userId: mcdonaldsAgent.id,
        ticketId: ticketMcdonalds.id,
      },
    ],
  });

  console.log('📋 Logs criados');

  console.log('✅ Banco de dados populado com sucesso!');
  console.log('\n📊 Resumo dos dados criados:');
  console.log('- 1 Crown Company');
  console.log("- 3 Franqueadores (Lacoste, McDonald's, Drogasil)");
  console.log('- 4 Franquias');
  console.log('- 9 Usuários (diversos roles)');
  console.log('- 5 Categorias de tickets');
  console.log('- 3 Tickets (diferentes status)');
  console.log('- 4 Comentários');
  console.log('- 3 Logs de auditoria');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
