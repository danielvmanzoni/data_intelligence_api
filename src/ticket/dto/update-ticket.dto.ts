import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiProperty({
    description: 'Status do ticket',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
