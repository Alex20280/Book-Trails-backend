import { Test, TestingModule } from '@nestjs/testing';
import { ReadCountService } from './read-count.service';

describe('ReadCountService', () => {
  let service: ReadCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadCountService],
    }).compile();

    service = module.get<ReadCountService>(ReadCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
