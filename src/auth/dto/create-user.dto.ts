import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao.silva@empresa.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role/papel do usuário',
    enum: Role,
    example: Role.USER,
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'ID do tenant (obrigatório para não Crown admins)',
    example: 'uuid-do-tenant',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
