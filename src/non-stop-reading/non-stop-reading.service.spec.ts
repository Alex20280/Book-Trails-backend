import { Test, TestingModule } from '@nestjs/testing';
import { NonStopReadingService } from './non-stop-reading.service';

describe('NonStopReadingService', () => {
  let service: NonStopReadingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NonStopReadingService],
    }).compile();

    service = module.get<NonStopReadingService>(NonStopReadingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
