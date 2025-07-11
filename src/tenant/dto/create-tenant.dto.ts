import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantType, Segment } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nome do tenant/organização',
    example: 'Lacoste Matriz',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'CNPJ único do tenant',
    example: '11.111.111/0001-11',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Subdomínio único para o tenant',
    example: 'lacoste-matriz',
  })
  @IsNotEmpty()
  @IsString()
  subdomain: string;

  @ApiProperty({
    description: 'Domínio personalizado (opcional)',
    example: 'tickets.lacoste.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  domain?: string;

  @ApiProperty({
    description: 'Tipo do tenant',
    enum: TenantType,
    example: TenantType.FRANCHISOR,
  })
  @IsNotEmpty()
  @IsEnum(TenantType)
  type: TenantType;

  @ApiProperty({
    description: 'Marca/Brand do tenant',
    example: 'Lacoste',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: 'Segmento do tenant',
    enum: Segment,
    example: Segment.MODA,
    required: false,
  })
  @IsOptional()
  @IsEnum(Segment)
  segment?: Segment;

  @ApiProperty({
    description: 'ID do tenant pai (para franquias)',
    example: 'uuid-do-franqueador',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentTenantId?: string;

  @ApiProperty({
    description: 'Se o tenant está ativo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
