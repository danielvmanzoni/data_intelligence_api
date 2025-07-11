// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: '11.111.111/0001-11',
    description: 'CNPJ do tenant',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiProperty({
    example: 'admin@lacoste.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'superseguro123',
    description: 'Senha do usuário',
  })
  @IsNotEmpty()
  password: string;
}
