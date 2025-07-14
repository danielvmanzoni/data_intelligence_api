import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../auth/tenant-context.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller(':tenant/tickets')
@UseGuards(JwtAuthGuard, TenantContextGuard)
@ApiBearerAuth()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo ticket' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @Param('tenant') tenantSlug: string,
    @Body() createTicketDto: CreateTicketDto,
    @Request() req,
  ) {
    return this.ticketService.create(createTicketDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tickets do tenant' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({ status: 200, description: 'Lista de tickets' })
  findAll(@Param('tenant') tenantSlug: string, @Request() req) {
    return this.ticketService.findByTenant(
      req.tenant.id,
      req.user.userId,
      req.user.role,
      req.user.tenantId,
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas detalhadas de tickets do tenant',
    description: `Retorna insights detalhados sobre os tickets, incluindo:
    - Total de tickets
    - Distribuição por status (aberto, em andamento, resolvido, etc.)
    - Distribuição por prioridade
    - Distribuição por categoria
    - Distribuição por agente responsável
    - Tickets sem agente atribuído
    - Tickets vencidos
    - Tickets próximos do vencimento (24h)
    - Tempo médio de resolução`,
  })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas dos tickets',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'Total de tickets',
          example: 150,
        },
        byStatus: {
          type: 'array',
          description: 'Distribuição de tickets por status',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'OPEN' },
              count: { type: 'number', example: 45 },
              percentage: { type: 'string', example: '30.0%' },
            },
          },
        },
        byPriority: {
          type: 'array',
          description: 'Distribuição de tickets por prioridade',
          items: {
            type: 'object',
            properties: {
              priority: { type: 'string', example: 'HIGH' },
              count: { type: 'number', example: 25 },
              percentage: { type: 'string', example: '16.7%' },
            },
          },
        },
        byCategory: {
          type: 'array',
          description: 'Distribuição de tickets por categoria',
          items: {
            type: 'object',
            properties: {
              categoryId: { type: 'string', example: 'uuid' },
              categoryName: { type: 'string', example: 'Suporte Técnico' },
              count: { type: 'number', example: 30 },
              percentage: { type: 'string', example: '20.0%' },
            },
          },
        },
        byAssignee: {
          type: 'array',
          description: 'Distribuição de tickets por agente responsável',
          items: {
            type: 'object',
            properties: {
              assigneeId: { type: 'string', example: 'uuid' },
              assigneeName: { type: 'string', example: 'João Silva' },
              count: { type: 'number', example: 20 },
              percentage: { type: 'string', example: '13.3%' },
            },
          },
        },
        unassigned: {
          type: 'object',
          description: 'Tickets sem agente atribuído',
          properties: {
            count: { type: 'number', example: 15 },
            percentage: { type: 'string', example: '10.0%' },
          },
        },
        overdue: {
          type: 'object',
          description: 'Tickets vencidos',
          properties: {
            count: { type: 'number', example: 5 },
            percentage: { type: 'string', example: '3.3%' },
          },
        },
        dueSoon: {
          type: 'object',
          description: 'Tickets próximos do vencimento (24h)',
          properties: {
            count: { type: 'number', example: 8 },
            percentage: { type: 'string', example: '5.3%' },
          },
        },
        averageResolutionTime: {
          type: 'object',
          description: 'Tempo médio de resolução',
          properties: {
            milliseconds: { type: 'number', example: 172800000 },
            hours: { type: 'number', example: 48.0 },
            days: { type: 'number', example: 2.0 },
          },
        },
      },
    },
  })
  getStats(@Param('tenant') tenantSlug: string, @Request() req) {
    return this.ticketService.getTicketStats(
      req.user.userId,
      req.user.role,
      req.user.tenantId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um ticket específico' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do ticket',
    example: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Dados do ticket' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  findOne(
    @Param('tenant') tenantSlug: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.ticketService.findOne(
      id,
      req.user.userId,
      req.user.role,
      req.user.tenantId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um ticket' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do ticket',
    example: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Ticket atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  update(
    @Param('tenant') tenantSlug: string,
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketService.update(
      id,
      updateTicketDto,
      req.user.userId,
      req.user.role,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um ticket' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do ticket',
    example: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Ticket deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  remove(
    @Param('tenant') tenantSlug: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.ticketService.remove(
      id,
      req.user.userId,
      req.user.role,
      req.user.tenantId,
    );
  }
}
