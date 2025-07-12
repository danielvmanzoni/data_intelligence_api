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
@UseGuards(TenantContextGuard, JwtAuthGuard)
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
  @ApiOperation({ summary: 'Obter estatísticas de tickets do tenant' })
  @ApiParam({
    name: 'tenant',
    description: 'Slug do tenant',
    example: 'lacoste',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas dos tickets' })
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
