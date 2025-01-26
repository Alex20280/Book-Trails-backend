import { Test, TestingModule } from '@nestjs/testing';
import { BookSessionService } from './book-session.service';

describe('BookSessionService', () => {
  let service: BookSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookSessionService],
    }).compile();

    service = module.get<BookSessionService>(BookSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
