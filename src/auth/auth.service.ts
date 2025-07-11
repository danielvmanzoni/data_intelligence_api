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
import { TenantType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly tenantService: TenantService,
  ) {}

  async login(dto: LoginDto) {
    // Primeiro, encontrar o tenant pelo CNPJ
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        cnpj: dto.cnpj,
        isActive: true,
      },
      include: {
        settings: true,
        parentTenant: true,
        childTenants: true,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('CNPJ não encontrado ou tenant inativo');
    }

    // Encontrar o usuário no tenant
    const user = await this.prisma.user.findFirst({
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
          cnpj: user.tenant.cnpj,
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
    if (dto.role === Role.CROWN_ADMIN) {
      // Verificar se email já existe
      const existingUser = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Criar ou encontrar tenant Crown
      let crownTenant = await this.prisma.tenant.findFirst({
        where: { type: TenantType.CROWN },
      });

      if (!crownTenant) {
        crownTenant = await this.prisma.tenant.create({
          data: {
            name: 'Crown Company',
            cnpj: '00.000.000/0001-00',
            subdomain: 'crown',
            type: TenantType.CROWN,
            settings: {
              create: {},
            },
          },
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
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
    const existingUser = await this.prisma.user.findFirst({
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
    const roleToValidate = dto.role || Role.USER;
    this.validateRoleForTenant(roleToValidate, tenant.type);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || Role.USER,
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

  private validateRoleForTenant(role: Role, tenantType: TenantType) {
    switch (tenantType) {
      case TenantType.CROWN:
        if (role !== Role.CROWN_ADMIN) {
          throw new BadRequestException(
            'Apenas CROWN_ADMIN pode ser criado em tenant Crown',
          );
        }
        break;

      case TenantType.FRANCHISOR:
        if (
          ![
            Role.FRANCHISOR_ADMIN as Role,
            Role.AGENT as Role,
            Role.USER as Role,
          ].includes(role)
        ) {
          throw new BadRequestException(
            'Roles permitidos para franqueador: FRANCHISOR_ADMIN, AGENT, USER',
          );
        }
        break;

      case TenantType.FRANCHISE:
        if (
          ![
            Role.FRANCHISE_ADMIN as Role,
            Role.AGENT as Role,
            Role.USER as Role,
          ].includes(role)
        ) {
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
    const user = await this.prisma.user.findUnique({
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    return user;
  }

  async getAccessibleTenants(userId: string) {
    const user = await this.validateUser(userId);

    return this.tenantService.getAccessibleTenants(
      userId,
      user.role,
      user.tenantId,
    );
  }
}
