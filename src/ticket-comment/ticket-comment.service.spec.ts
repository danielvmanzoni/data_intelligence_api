import { Test, TestingModule } from '@nestjs/testing';
import { TicketCommentService } from './ticket-comment.service';

describe('TicketCommentService', () => {
  let service: TicketCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketCommentService],
    }).compile();

    service = module.get<TicketCommentService>(TicketCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
