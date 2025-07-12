import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TenantService } from '../tenant/tenant.service';
import { Role } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se a categoria pertence ao tenant
    const category = await this.prisma.ticketCategory.findFirst({
      where: {
        id: createTicketDto.categoryId,
        tenantId: user.tenantId,
      },
    });

    if (!category) {
      throw new BadRequestException(
        'Categoria não encontrada ou não pertence ao tenant',
      );
    }

    // Gerar número sequencial do ticket
    const lastTicket = await this.prisma.ticket.findFirst({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const nextNumber = lastTicket
      ? String(parseInt(lastTicket.number) + 1).padStart(3, '0')
      : '001';

    // Criar ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        number: nextNumber,
        creatorId: userId,
        tenantId: user.tenantId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: true,
      },
    });

    return ticket;
  }

  async findByTenant(
    tenantId: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Verificar se o usuário tem permissão para ver tickets do tenant
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const hasAccess = accessibleTenants.some(
      (tenant) => tenant.id === tenantId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para ver tickets deste tenant',
      );
    }

    return this.prisma.ticket.findMany({
      where: { tenantId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(userId: string, userRole: Role, userTenantId: string) {
    // Obter tenants acessíveis pelo usuário
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const tenantIds = accessibleTenants.map((tenant) => tenant.id);

    return this.prisma.ticket.findMany({
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByBrand(
    brand: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Verificar se o usuário tem permissão para ver tickets da marca
    if (
      userRole === Role.FRANCHISE_ADMIN ||
      userRole === Role.AGENT ||
      userRole === Role.USER
    ) {
      const userTenant = await this.tenantService.findOne(userTenantId);
      if (userTenant.brand !== brand) {
        throw new ForbiddenException(
          'Você não tem permissão para ver tickets desta marca',
        );
      }
    }

    const tenants = await this.tenantService.findByBrand(brand);
    const tenantIds = tenants.map((tenant) => tenant.id);

    return this.prisma.ticket.findMany({
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Primeiro, encontrar o ticket
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    // Verificar se o usuário tem permissão para ver este ticket
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const hasAccess = accessibleTenants.some(
      (tenant) => tenant.id === ticket.tenantId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para ver este ticket',
      );
    }

    return ticket;
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Primeiro, verificar se o ticket existe e se o usuário tem permissão
    const ticket = await this.findOne(id, userId, userRole, userTenantId);

    // Verificar se o usuário tem permissão para atualizar
    if (userRole === Role.USER && ticket.creatorId !== userId) {
      throw new ForbiddenException(
        'Você só pode atualizar tickets que você criou',
      );
    }

    // Se está sendo atribuído a alguém, verificar se o usuário pertence ao tenant
    if (updateTicketDto.assigneeId) {
      const assignee = await this.prisma.user.findFirst({
        where: {
          id: updateTicketDto.assigneeId,
          tenantId: ticket.tenantId,
        },
      });

      if (!assignee) {
        throw new BadRequestException(
          'Usuário não encontrado ou não pertence ao tenant',
        );
      }
    }

    // Se está sendo alterada a categoria, verificar se pertence ao tenant
    if (updateTicketDto.categoryId) {
      const category = await this.prisma.ticketCategory.findFirst({
        where: {
          id: updateTicketDto.categoryId,
          tenantId: ticket.tenantId,
        },
      });

      if (!category) {
        throw new BadRequestException(
          'Categoria não encontrada ou não pertence ao tenant',
        );
      }
    }

    // Atualizar ticket
    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
        resolvedAt:
          updateTicketDto.status === 'RESOLVED' ? new Date() : undefined,
        closedAt: updateTicketDto.status === 'CLOSED' ? new Date() : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            brand: true,
            type: true,
          },
        },
      },
    });

    return updatedTicket;
  }

  async remove(
    id: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Primeiro, verificar se o ticket existe e se o usuário tem permissão
    const ticket = await this.findOne(id, userId, userRole, userTenantId);

    // Verificar se o usuário tem permissão para deletar
    if (
      userRole === Role.USER ||
      (userRole === Role.AGENT && ticket.creatorId !== userId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este ticket',
      );
    }

    await this.prisma.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket deletado com sucesso' };
  }

  async getTicketStats(userId: string, userRole: Role, userTenantId: string) {
    // Obter tenants acessíveis pelo usuário
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const tenantIds = accessibleTenants.map((tenant) => tenant.id);

    // Contar tickets por status
    const ticketStats = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      _count: {
        status: true,
      },
    });

    // Contar tickets por prioridade
    const priorityStats = await this.prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      _count: {
        priority: true,
      },
    });

    // Total de tickets
    const totalTickets = await this.prisma.ticket.count({
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
    });

    return {
      total: totalTickets,
      byStatus: ticketStats,
      byPriority: priorityStats,
    };
  }

  async getTicketsByBrandStats(
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Obter tenants acessíveis pelo usuário
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const tenantIds = accessibleTenants.map((tenant) => tenant.id);

    // Contar tickets por marca
    const brandStats = await this.prisma.ticket.groupBy({
      by: ['tenantId'],
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      _count: {
        tenantId: true,
      },
    });

    // Obter informações das marcas
    const brands = await this.prisma.tenant.findMany({
      where: {
        id: {
          in: tenantIds,
        },
      },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
      },
    });

    // Combinar estatísticas com informações das marcas
    const result = brandStats.map((stat) => {
      const brand = brands.find((b) => b.id === stat.tenantId);
      return {
        tenantId: stat.tenantId,
        tenantName: brand?.name || 'Desconhecido',
        brand: brand?.brand || 'Desconhecido',
        type: brand?.type || 'Desconhecido',
        ticketCount: stat._count.tenantId,
      };
    });

    return result;
  }
}
