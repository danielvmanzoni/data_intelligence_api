import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';

@Injectable()
export class TicketCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    createTicketCategoryDto: CreateTicketCategoryDto,
  ) {
    // Verifica se já existe uma categoria com o mesmo nome no tenant
    const existing = await this.prisma.ticketCategory.findFirst({
      where: {
        tenantId,
        name: createTicketCategoryDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    return this.prisma.ticketCategory.create({
      data: {
        ...createTicketCategoryDto,
        tenant: {
          connect: {
            id: tenantId,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.ticketCategory.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findActive(tenantId: string) {
    return this.prisma.ticketCategory.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.ticketCategory.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    tenantId: string,
    id: string,
    updateTicketCategoryDto: UpdateTicketCategoryDto,
  ) {
    // Verifica se a categoria existe
    await this.findOne(tenantId, id);

    // Se estiver atualizando o nome, verifica se já existe outra categoria com o mesmo nome
    if (updateTicketCategoryDto.name) {
      const existing = await this.prisma.ticketCategory.findFirst({
        where: {
          tenantId,
          name: updateTicketCategoryDto.name,
          id: {
            not: id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe outra categoria com este nome');
      }
    }

    return this.prisma.ticketCategory.update({
      where: {
        id,
      },
      data: updateTicketCategoryDto,
    });
  }

  async remove(tenantId: string, id: string) {
    // Verifica se a categoria existe
    await this.findOne(tenantId, id);

    // Verifica se existem tickets usando esta categoria
    const ticketsCount = await this.prisma.ticket.count({
      where: {
        categoryId: id,
      },
    });

    if (ticketsCount > 0) {
      // Se existem tickets, apenas desativa a categoria
      return this.prisma.ticketCategory.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Se não existem tickets, remove a categoria
    return this.prisma.ticketCategory.delete({
      where: {
        id,
      },
    });
  }
}
