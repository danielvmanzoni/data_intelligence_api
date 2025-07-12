// src/auth/tenant-context.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extrair tenant slug da rota
    const tenantSlug = request.params.tenant;

    if (!tenantSlug) {
      // Se não há tenant slug, pode ser uma rota que não precisa de tenant
      return true;
    }

    // Validar formato do tenant slug
    if (!/^[a-zA-Z0-9-]+$/.test(tenantSlug)) {
      throw new BadRequestException('Formato inválido de tenant slug');
    }

    // Buscar o tenant no banco de dados
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        subdomain: tenantSlug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        type: true,
        brand: true,
        segment: true,
        isActive: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant '${tenantSlug}' não encontrado ou inativo`,
      );
    }

    // Injetar tenant no request para uso posterior
    request.tenant = tenant;
    request.tenantSlug = tenantSlug;

    return true;
  }
}
