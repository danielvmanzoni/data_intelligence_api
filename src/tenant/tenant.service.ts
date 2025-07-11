import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantType, Segment, Role } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Verificar se CNPJ já existe
    const existingCnpj = await this.prisma.tenant.findUnique({
      where: { cnpj: createTenantDto.cnpj },
    });

    if (existingCnpj) {
      throw new ConflictException('CNPJ já está em uso');
    }

    // Verificar se subdomain já existe
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomínio já está em uso');
    }

    // Verificar se domain já existe (se fornecido)
    if (createTenantDto.domain) {
      const existingDomain = await this.prisma.tenant.findUnique({
        where: { domain: createTenantDto.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Domínio já está em uso');
      }
    }

    // Validar hierarquia
    if (createTenantDto.parentTenantId) {
      const parentTenant = await this.prisma.tenant.findUnique({
        where: { id: createTenantDto.parentTenantId },
      });

      if (!parentTenant) {
        throw new NotFoundException('Tenant pai não encontrado');
      }

      if (parentTenant.type !== TenantType.FRANCHISOR) {
        throw new BadRequestException('Tenant pai deve ser um FRANQUEADOR');
      }

      // Franquia deve ter a mesma marca do franqueador
      if (createTenantDto.brand !== parentTenant.brand) {
        throw new BadRequestException(
          'Franquia deve ter a mesma marca do franqueador',
        );
      }
    }

    // Criar tenant com settings padrão
    const tenant = await this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        settings: {
          create: {}, // Usa valores padrão do schema
        },
      },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });

    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
        _count: {
          select: {
            users: true,
            tickets: true,
            childTenants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
        _count: {
          select: {
            users: true,
            tickets: true,
            ticketCategories: true,
            childTenants: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findByCnpj(cnpj: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { cnpj },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findByDomain(domain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findByBrand(brand: string) {
    return this.prisma.tenant.findMany({
      where: { brand },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
        _count: {
          select: {
            users: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        type: 'asc', // FRANCHISOR primeiro, depois FRANCHISE
      },
    });
  }

  async findBySegment(segment: Segment) {
    return this.prisma.tenant.findMany({
      where: { segment },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
        _count: {
          select: {
            users: true,
            tickets: true,
          },
        },
      },
      orderBy: [{ brand: 'asc' }, { type: 'asc' }],
    });
  }

  async findFranchisesByFranchisor(franchisorId: string) {
    const franchisor = await this.prisma.tenant.findUnique({
      where: { id: franchisorId },
    });

    if (!franchisor) {
      throw new NotFoundException('Franqueador não encontrado');
    }

    if (franchisor.type !== TenantType.FRANCHISOR) {
      throw new BadRequestException('Tenant deve ser um FRANQUEADOR');
    }

    return this.prisma.tenant.findMany({
      where: { parentTenantId: franchisorId },
      include: {
        settings: true,
        _count: {
          select: {
            users: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Método para obter tenants acessíveis por um usuário baseado em sua role
  async getAccessibleTenants(
    userId: string,
    userRole: Role,
    userTenantId: string,
  ) {
    const userTenant = await this.findOne(userTenantId);

    switch (userRole) {
      case Role.CROWN_ADMIN:
        // Crown vê todos os tenants
        return this.findAll();

      case Role.FRANCHISOR_ADMIN:
        // Franqueador vê ele mesmo + suas franquias
        return this.prisma.tenant.findMany({
          where: {
            OR: [
              { id: userTenantId }, // O próprio franqueador
              { parentTenantId: userTenantId }, // Suas franquias
            ],
          },
          include: {
            settings: true,
            parentTenant: true,
            childTenants: true,
            _count: {
              select: {
                users: true,
                tickets: true,
              },
            },
          },
          orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });

      case Role.FRANCHISE_ADMIN:
      case Role.AGENT:
      case Role.USER:
        // Franquia, agente e usuário veem apenas seu próprio tenant
        return [userTenant];

      default:
        throw new BadRequestException('Role não reconhecida');
    }
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.findOne(id);

    // Verificar conflitos de CNPJ
    if (updateTenantDto.cnpj && updateTenantDto.cnpj !== tenant.cnpj) {
      const existingCnpj = await this.prisma.tenant.findUnique({
        where: { cnpj: updateTenantDto.cnpj },
      });

      if (existingCnpj) {
        throw new ConflictException('CNPJ já está em uso');
      }
    }

    // Verificar conflitos de subdomain
    if (
      updateTenantDto.subdomain &&
      updateTenantDto.subdomain !== tenant.subdomain
    ) {
      const existingSubdomain = await this.prisma.tenant.findUnique({
        where: { subdomain: updateTenantDto.subdomain },
      });

      if (existingSubdomain) {
        throw new ConflictException('Subdomínio já está em uso');
      }
    }

    // Verificar conflitos de domain
    if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
      const existingDomain = await this.prisma.tenant.findUnique({
        where: { domain: updateTenantDto.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Domínio já está em uso');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);

    // Verificar se é um franqueador com franquias
    if (
      tenant.type === TenantType.FRANCHISOR &&
      tenant.childTenants.length > 0
    ) {
      throw new BadRequestException(
        'Não é possível remover franqueador que possui franquias',
      );
    }

    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const tenant = await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: !tenant.isActive,
      },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });
  }

  // Métodos específicos para Crown
  async getAllBrands() {
    const brands = await this.prisma.tenant.findMany({
      where: {
        brand: {
          not: null,
        },
      },
      select: {
        brand: true,
        segment: true,
      },
      distinct: ['brand'],
      orderBy: {
        brand: 'asc',
      },
    });

    return brands.map((item) => ({
      brand: item.brand,
      segment: item.segment,
    }));
  }

  async getAllSegments() {
    const segments = await this.prisma.tenant.findMany({
      where: {
        segment: {
          not: null,
        },
      },
      select: {
        segment: true,
      },
      distinct: ['segment'],
      orderBy: {
        segment: 'asc',
      },
    });

    return segments.map((item) => item.segment);
  }
}
