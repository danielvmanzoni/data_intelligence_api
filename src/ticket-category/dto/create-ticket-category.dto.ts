import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsHexColor,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateTicketCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria. Deve ser único dentro do tenant.',
    example: 'Suporte Técnico',
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
  @IsString({ message: 'O nome da categoria deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada da categoria e sua finalidade',
    example: 'Tickets relacionados a problemas técnicos e suporte ao sistema',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string;

  @ApiProperty({
    description: 'Cor da categoria em formato hexadecimal (incluindo #)',
    example: '#FF5722',
    required: false,
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsOptional()
  @IsHexColor({
    message: 'A cor deve estar em formato hexadecimal válido (ex: #FF5722)',
  })
  color?: string;

  @ApiProperty({
    description: 'Identificador do ícone a ser usado na interface',
    example: 'support',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'O ícone deve ser uma string' })
  icon?: string;

  @ApiProperty({
    description:
      'Tempo máximo em horas para resolução dos tickets desta categoria (SLA)',
    example: 24,
    required: false,
    minimum: 1,
    maximum: 720,
    default: 24,
  })
  @IsOptional()
  @IsInt({ message: 'O tempo de SLA deve ser um número inteiro' })
  @Min(1, { message: 'O tempo mínimo de SLA é 1 hora' })
  @Max(720, { message: 'O tempo máximo de SLA é 720 horas (30 dias)' })
  slaHours?: number;
}
