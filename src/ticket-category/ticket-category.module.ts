import { Module } from '@nestjs/common';
import { TicketCategoryService } from './ticket-category.service';
import { TicketCategoryController } from './ticket-category.controller';

@Module({
  providers: [TicketCategoryService],
  controllers: [TicketCategoryController]
})
export class TicketCategoryModule {}
