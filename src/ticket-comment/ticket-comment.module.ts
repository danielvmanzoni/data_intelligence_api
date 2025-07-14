import { Module } from '@nestjs/common';
import { TicketCommentService } from './ticket-comment.service';
import { TicketCommentController } from './ticket-comment.controller';

@Module({
  providers: [TicketCommentService],
  controllers: [TicketCommentController],
})
export class TicketCommentModule {}
