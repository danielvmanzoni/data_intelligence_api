import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { TicketCategoryService } from './ticket-category.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../auth/tenant-context.guard';
import { CurrentStore } from '../auth/decorators/current-store.decorator';

@ApiTags('Categorias de Tickets')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT no formato: Bearer {token}',
  required: true,
})
@UseGuards(JwtAuthGuard, TenantContextGuard)
@Controller(':tenant/ticket-category')
export class TicketCategoryController {
  constructor(private readonly ticketCategoryService: TicketCategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar uma nova categoria de ticket',
    description:
      'Cria uma nova categoria de ticket para o tenant especificado. Requer autenticação JWT e acesso ao tenant.',
  })
  @ApiParam({
    name: 'tenant',
    description: 'Identificador único do tenant (slug/subdomínio)',
    example: 'lacoste',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada com sucesso',
    type: CreateTicketCategoryDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma categoria com este nome no tenant especificado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente ou inválido',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem acesso ao tenant especificado',
  })
  create(
    @CurrentStore() tenantId: string,
    @Body() createTicketCategoryDto: CreateTicketCategoryDto,
  ) {
    return this.ticketCategoryService.create(tenantId, createTicketCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias de tickets' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas as categorias retornada com sucesso',
  })
  findAll(@CurrentStore() tenantId: string) {
    return this.ticketCategoryService.findAll(tenantId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar categorias de tickets ativas' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias ativas retornada com sucesso',
  })
  findActive(@CurrentStore() tenantId: string) {
    return this.ticketCategoryService.findActive(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma categoria de ticket específica' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
  })
  findOne(@CurrentStore() tenantId: string, @Param('id') id: string) {
    return this.ticketCategoryService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria de ticket' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe outra categoria com este nome',
  })
  update(
    @CurrentStore() tenantId: string,
    @Param('id') id: string,
    @Body() updateTicketCategoryDto: UpdateTicketCategoryDto,
  ) {
    return this.ticketCategoryService.update(
      tenantId,
      id,
      updateTicketCategoryDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Remover uma categoria de ticket ou desativá-la se houver tickets associados',
  })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria removida ou desativada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
  })
  remove(@CurrentStore() tenantId: string, @Param('id') id: string) {
    return this.ticketCategoryService.remove(tenantId, id);
  }
}
