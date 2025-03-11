import { Test, TestingModule } from '@nestjs/testing';
import { BestCategoryService } from './best-category.service';

describe('BestCategoryService', () => {
  let service: BestCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestCategoryService],
    }).compile();

    service = module.get<BestCategoryService>(BestCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
