// src/log/log.controller.ts
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Lista todos os logs do tenant' })
  @ApiParam({ name: 'tenantId', description: 'ID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Logs encontrados com sucesso',
    schema: {
      example: [
        {
          id: 'uuid',
          action: 'TICKET_CREATED',
          entity: 'TICKET',
          entityId: 'uuid-do-ticket',
          message: 'Ticket criado com título "Problema no sistema"',
          tenantId: 'uuid-do-tenant',
          userId: 'uuid-do-usuario',
          createdAt: '2025-01-15T00:00:00.000Z',
        },
      ],
    },
  })
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.logService.findAllByTenant(tenantId);
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Lista logs de um ticket específico' })
  @ApiParam({ name: 'ticketId', description: 'ID do ticket' })
  @ApiResponse({
    status: 200,
    description: 'Logs do ticket encontrados com sucesso',
  })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.logService.findByTicket(ticketId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lista logs de um usuário específico' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Logs do usuário encontrados com sucesso',
  })
  findByUser(@Param('userId') userId: string) {
    return this.logService.findByUser(userId);
  }
}
