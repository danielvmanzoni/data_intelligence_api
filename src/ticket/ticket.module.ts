import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { TenantContextGuard } from '../auth/tenant-context.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [TicketService, TenantContextGuard, PrismaService, Reflector],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
