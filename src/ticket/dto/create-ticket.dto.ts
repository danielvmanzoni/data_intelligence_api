import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export class CreateTicketDto {
  @ApiProperty({
    description: 'Título do ticket',
    example: 'Problema no sistema de login',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do problema',
    example: 'Não consigo fazer login no sistema. Aparece erro 500.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Prioridade do ticket',
    enum: TicketPriority,
    example: TicketPriority.MEDIUM,
    default: TicketPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({
    description: 'ID da categoria do ticket',
    example: 'uuid-da-categoria',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Data de vencimento do ticket (opcional)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'ID do usuário responsável (opcional)',
    example: 'uuid-do-agente',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  // Campos para tickets de convidados
  @ApiProperty({
    description: 'Nome do solicitante (apenas para tickets de convidados)',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({
    description: 'Email do solicitante (apenas para tickets de convidados)',
    example: 'joao@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o: CreateTicketDto) => !!o.guestName) // Obrigatório se guestName for fornecido
  guestEmail?: string;

  @ApiProperty({
    description: 'Telefone do solicitante (apenas para tickets de convidados)',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  guestPhone?: string;
}
