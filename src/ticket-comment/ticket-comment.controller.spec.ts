import { Test, TestingModule } from '@nestjs/testing';
import { TicketCommentController } from './ticket-comment.controller';

describe('TicketCommentController', () => {
  let controller: TicketCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketCommentController],
    }).compile();

    controller = module.get<TicketCommentController>(TicketCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
