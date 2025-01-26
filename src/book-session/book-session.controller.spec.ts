import { Test, TestingModule } from '@nestjs/testing';
import { BookSessionController } from './book-session.controller';
import { BookSessionService } from './book-session.service';

describe('BookSessionController', () => {
  let controller: BookSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookSessionController],
      providers: [BookSessionService],
    }).compile();

    controller = module.get<BookSessionController>(BookSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
