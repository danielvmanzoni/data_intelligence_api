// src/log/log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLogDto) {
    return this.prisma.log.create({ data: dto });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.log.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticket: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.log.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.log.findMany({
      where: { userId },
      include: {
        ticket: {
          select: {
            id: true,
            number: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
