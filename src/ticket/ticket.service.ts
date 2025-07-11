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
import { Role, TicketStatus } from '@prisma/client';

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

  async findOne(
    id: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
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
    const ticket = await this.findOne(id, userId, userRole, userTenantId);

    // Verificar se o usuário pode atualizar este ticket
    if (userRole === Role.USER && ticket.creatorId !== userId) {
      throw new ForbiddenException(
        'Você só pode atualizar seus próprios tickets',
      );
    }

    // Se está atribuindo a alguém, verificar se o assignee pertence ao tenant
    if (updateTicketDto.assigneeId) {
      const assignee = await this.prisma.user.findFirst({
        where: {
          id: updateTicketDto.assigneeId,
          tenantId: ticket.tenantId,
        },
      });

      if (!assignee) {
        throw new BadRequestException('Usuário não encontrado no tenant');
      }
    }

    // Atualizar datas baseado no status
    const updateData: any = { ...updateTicketDto };

    if (
      updateTicketDto.status === TicketStatus.RESOLVED &&
      ticket.status !== TicketStatus.RESOLVED
    ) {
      updateData.resolvedAt = new Date();
    }

    if (
      updateTicketDto.status === TicketStatus.CLOSED &&
      ticket.status !== TicketStatus.CLOSED
    ) {
      updateData.closedAt = new Date();
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateData,
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
  }

  async remove(
    id: string,
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    const ticket = await this.findOne(id, userId, userRole, userTenantId);

    // Apenas admins podem remover tickets
    const adminRoles: Role[] = [
      Role.CROWN_ADMIN,
      Role.FRANCHISOR_ADMIN,
      Role.FRANCHISE_ADMIN,
    ];
    if (!adminRoles.includes(userRole)) {
      throw new ForbiddenException(
        'Você não tem permissão para remover tickets',
      );
    }

    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  // Métodos específicos para relatórios/BI
  async getTicketStats(userId: string, userRole: Role, userTenantId: string) {
    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const tenantIds = accessibleTenants.map((tenant) => tenant.id);

    const stats = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      _count: {
        id: true,
      },
    });

    return stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getTicketsByBrandStats(
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    // Apenas Crown e Franqueadores podem ver stats por marca
    const allowedRoles: Role[] = [Role.CROWN_ADMIN, Role.FRANCHISOR_ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(
        'Você não tem permissão para ver estatísticas por marca',
      );
    }

    const accessibleTenants = await this.tenantService.getAccessibleTenants(
      userId,
      userRole,
      userTenantId,
    );

    const tenantIds = accessibleTenants.map((tenant) => tenant.id);

    const stats = await this.prisma.ticket.groupBy({
      by: ['tenantId'],
      where: {
        tenantId: {
          in: tenantIds,
        },
      },
      _count: {
        id: true,
      },
    });

    // Buscar informações dos tenants para incluir marca
    const tenants = await this.prisma.tenant.findMany({
      where: {
        id: {
          in: stats.map((s) => s.tenantId),
        },
      },
      select: {
        id: true,
        name: true,
        brand: true,
        type: true,
      },
    });

    return stats.map((stat) => ({
      tenant: tenants.find((t) => t.id === stat.tenantId),
      count: stat._count.id,
    }));
  }
}
