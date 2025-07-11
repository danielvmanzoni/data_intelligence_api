// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Autentica um usuário com CNPJ e retorna o token JWT',
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
            cnpj: '11.111.111/0002-22',
            subdomain: 'lacoste-loja-shopping',
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
    description: 'CNPJ não encontrado ou credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'CNPJ não encontrado ou tenant inativo',
        error: 'Unauthorized',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
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
          cnpj: '11.111.111/0002-22',
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
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna informações do usuário logado' })
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
          cnpj: '11.111.111/0002-22',
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
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }

  @Get('accessible-tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna tenants acessíveis pelo usuário baseado em sua role',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants acessíveis',
    schema: {
      example: [
        {
          id: 'uuid-franqueador',
          name: 'Lacoste Matriz',
          cnpj: '11.111.111/0001-11',
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
  async getAccessibleTenants(@Request() req) {
    return this.authService.getAccessibleTenants(req.user.userId);
  }
}
