// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantContextGuard } from './tenant-context.guard';

@ApiTags('Auth')
@Controller(':tenant/auth')
@UseGuards(TenantContextGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary:
      'Autentica um usuário no tenant especificado e retorna o token JWT',
  })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant (subdomain)',
    example: 'lacoste',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid-do-usuario',
          name: 'João Silva',
          email: 'joao@empresa.com',
          role: 'FRANCHISE_ADMIN',
          tenant: {
            id: 'uuid-do-tenant',
            name: 'Lacoste Loja Shopping',
            subdomain: 'lacoste',
            type: 'FRANCHISE',
            brand: 'Lacoste',
            segment: 'MODA',
            parentTenant: {
              id: 'uuid-franqueador',
              name: 'Lacoste Matriz',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Tenant não encontrado ou credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: "Tenant 'lacoste' não encontrado ou inativo",
        error: 'Not Found',
      },
    },
  })
  login(
    @Param('tenant') tenantSlug: string,
    @Body() dto: LoginDto,
    @Request() req,
  ) {
    return this.authService.login(dto, req.tenant);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário no tenant especificado' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant (subdomain)',
    example: 'lacoste',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        name: 'João Silva',
        email: 'joao@empresa.com',
        role: 'FRANCHISE_ADMIN',
        tenantId: 'uuid-do-tenant',
        tenant: {
          id: 'uuid-do-tenant',
          name: 'Lacoste Loja Shopping',
          subdomain: 'lacoste',
          type: 'FRANCHISE',
          brand: 'Lacoste',
          segment: 'MODA',
        },
        createdAt: '2025-01-15T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado ou tenant não encontrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email já está em uso neste tenant',
        error: 'Conflict',
      },
    },
  })
  register(
    @Param('tenant') tenantSlug: string,
    @Body() dto: CreateUserDto,
    @Request() req,
  ) {
    return this.authService.register({ ...dto, tenantId: req.tenant.id });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna informações do usuário logado' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant (subdomain)',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário',
    schema: {
      example: {
        id: 'uuid-do-usuario',
        name: 'João Silva',
        email: 'joao@empresa.com',
        role: 'FRANCHISE_ADMIN',
        tenant: {
          id: 'uuid-do-tenant',
          name: 'Lacoste Loja Shopping',
          subdomain: 'lacoste',
          type: 'FRANCHISE',
          brand: 'Lacoste',
          segment: 'MODA',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getProfile(@Param('tenant') tenantSlug: string, @Request() req) {
    // Verificar se o tenant do JWT corresponde ao tenant da rota
    if (req.user.tenantSlug !== tenantSlug) {
      throw new UnauthorizedException('Token não válido para este tenant');
    }

    return this.authService.validateUser(req.user.userId);
  }

  @Get('accessible-tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna tenants acessíveis pelo usuário baseado em sua role',
  })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant (subdomain)',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants acessíveis',
    schema: {
      example: [
        {
          id: 'uuid-franqueador',
          name: 'Lacoste Matriz',
          subdomain: 'lacoste-matriz',
          type: 'FRANCHISOR',
          brand: 'Lacoste',
          segment: 'MODA',
          childTenants: [
            {
              id: 'uuid-franquia',
              name: 'Lacoste Loja Shopping',
              type: 'FRANCHISE',
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getAccessibleTenants(
    @Param('tenant') tenantSlug: string,
    @Request() req,
  ) {
    // Verificar se o tenant do JWT corresponde ao tenant da rota
    if (req.user.tenantSlug !== tenantSlug) {
      throw new UnauthorizedException('Token não válido para este tenant');
    }

    return this.authService.getAccessibleTenants(req.user.userId);
  }
}
