// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TenantService } from '../tenant/tenant.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly tenantService: TenantService,
  ) {}

  async login(dto: LoginDto, tenant: any) {
    // Verificar se o tenant foi passado corretamente
    if (!tenant) {
      throw new BadRequestException('Tenant não encontrado');
    }

    // Encontrar o usuário no tenant
    const user: any = await (this.prisma as any).user.findFirst({
      where: {
        email: dto.email,
        tenantId: tenant.id,
        isActive: true,
      },
      include: {
        tenant: {
          include: {
            settings: true,
            parentTenant: true,
            childTenants: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      tenantSlug: tenant.subdomain,
      role: user.role,
      email: user.email,
      tenantType: tenant.type,
      brand: tenant.brand,
      segment: tenant.segment,
    };

    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
          type: user.tenant.type,
          brand: user.tenant.brand,
          segment: user.tenant.segment,
          parentTenant: user.tenant.parentTenant,
          childTenants: user.tenant.childTenants,
        },
      },
    };
  }

  async register(dto: CreateUserDto) {
    // Crown Admin pode ser criado sem tenant específico
    if (dto.role === ('CROWN_ADMIN' as any)) {
      // Verificar se email já existe
      const existingUser = await (this.prisma as any).user.findFirst({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Criar ou encontrar tenant Crown
      let crownTenant = await (this.prisma as any).tenant.findFirst({
        where: { type: 'CROWN' },
      });

      if (!crownTenant) {
        crownTenant = await (this.prisma as any).tenant.create({
          data: {
            name: 'Crown Company',
            cnpj: '00.000.000/0001-00',
            subdomain: 'crown',
            type: 'CROWN',
            settings: {
              create: {},
            },
          },
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await (this.prisma as any).user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
          tenantId: crownTenant.id,
        },
        include: {
          tenant: {
            include: {
              parentTenant: true,
              childTenants: true,
            },
          },
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    // Para outros roles, tenant é obrigatório
    if (!dto.tenantId) {
      throw new BadRequestException(
        'TenantId é obrigatório para este tipo de usuário',
      );
    }

    // Verificar se email já existe no tenant
    const existingUser = await (this.prisma as any).user.findFirst({
      where: {
        email: dto.email,
        tenantId: dto.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso neste tenant');
    }

    // Verificar se tenant existe
    const tenant = await this.tenantService.findOne(dto.tenantId);

    // Validar role baseado no tipo de tenant
    const roleToValidate = dto.role || ('USER' as any);
    this.validateRoleForTenant(roleToValidate, tenant.type);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Criar usuário
    const user = await (this.prisma as any).user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'USER',
        tenantId: dto.tenantId,
      },
      include: {
        tenant: {
          include: {
            parentTenant: true,
            childTenants: true,
          },
        },
      },
    });

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  private validateRoleForTenant(role: any, tenantType: any) {
    switch (tenantType) {
      case 'CROWN':
        if (role !== 'CROWN_ADMIN') {
          throw new BadRequestException(
            'Apenas CROWN_ADMIN pode ser criado em tenant Crown',
          );
        }
        break;

      case 'FRANCHISOR':
        if (!['FRANCHISOR_ADMIN', 'AGENT', 'USER'].includes(role)) {
          throw new BadRequestException(
            'Roles permitidos para franqueador: FRANCHISOR_ADMIN, AGENT, USER',
          );
        }
        break;

      case 'FRANCHISE':
        if (!['FRANCHISE_ADMIN', 'AGENT', 'USER'].includes(role)) {
          throw new BadRequestException(
            'Roles permitidos para franquia: FRANCHISE_ADMIN, AGENT, USER',
          );
        }
        break;

      default:
        throw new BadRequestException('Tipo de tenant inválido');
    }
  }

  async validateUser(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAccessibleTenants(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            parentTenant: true,
            childTenants: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    let accessibleTenants: any[] = [];

    switch (user.role) {
      case 'CROWN_ADMIN':
        // Crown Admin vê todos os tenants
        accessibleTenants = await (this.prisma as any).tenant.findMany({
          where: { isActive: true },
          include: {
            parentTenant: true,
            childTenants: true,
          },
        });
        break;

      case 'FRANCHISOR_ADMIN':
        // Franqueador vê o próprio tenant e todos os filhos
        accessibleTenants = await (this.prisma as any).tenant.findMany({
          where: {
            OR: [{ id: user.tenantId }, { parentTenantId: user.tenantId }],
            isActive: true,
          },
          include: {
            parentTenant: true,
            childTenants: true,
          },
        });
        break;

      case 'FRANCHISE_ADMIN':
      case 'AGENT':
      case 'USER':
        // Outros roles veem apenas o próprio tenant
        accessibleTenants = [user.tenant];
        break;

      default:
        throw new UnauthorizedException('Role não reconhecida');
    }

    return accessibleTenants;
  }
}
