import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './log/log.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketCategoryModule } from './ticket-category/ticket-category.module';
import { TicketCommentModule } from './ticket-comment/ticket-comment.module';
import { TenantContextGuard } from './auth/tenant-context.guard';
import { PrismaService } from './prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    LogModule,
    PrismaModule,
    TenantModule,
    TicketModule,
    TicketCategoryModule,
    TicketCommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TenantContextGuard,
      useClass: TenantContextGuard,
    },
    PrismaService,
    Reflector,
  ],
})
export class AppModule {}
