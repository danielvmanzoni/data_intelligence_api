import { PartialType } from '@nestjs/swagger';
import { CreateTicketCategoryDto } from './create-ticket-category.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateTicketCategoryDto extends PartialType(
  CreateTicketCategoryDto,
) {
  @ApiProperty({
    description: 'Status de ativação da categoria',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
