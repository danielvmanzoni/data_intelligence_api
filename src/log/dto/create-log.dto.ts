// src/log/dto/create-log.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateLogDto {
  @ApiProperty({
    example: 'TICKET_CREATED',
    description: 'Ação realizada',
  })
  @IsString()
  action: string;

  @ApiProperty({
    example: 'TICKET',
    description: 'Entidade afetada',
  })
  @IsString()
  entity: string;

  @ApiProperty({
    example: 'uuid-da-entidade',
    description: 'ID da entidade afetada',
  })
  @IsString()
  entityId: string;

  @ApiProperty({
    example: 'Ticket criado com título "Problema no sistema"',
    description: 'Mensagem descritiva da ação',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'uuid-do-tenant',
    description: 'ID do tenant',
  })
  @IsUUID()
  tenantId: string;

  @ApiProperty({
    example: 'uuid-do-usuario',
    description: 'ID do usuário que executou a ação',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: 'uuid-do-ticket',
    description: 'ID do ticket relacionado (se aplicável)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @ApiProperty({
    example: 'OPEN',
    description: 'Valor anterior (para mudanças)',
    required: false,
  })
  @IsOptional()
  @IsString()
  oldValue?: string;

  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'Novo valor (para mudanças)',
    required: false,
  })
  @IsOptional()
  @IsString()
  newValue?: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP de onde veio a ação',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0...',
    description: 'User agent do navegador',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
