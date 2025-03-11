import { Test, TestingModule } from '@nestjs/testing';
import { BestsellersService } from './bestsellers.service';

describe('BestsellersService', () => {
  let service: BestsellersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestsellersService],
    }).compile();

    service = module.get<BestsellersService>(BestsellersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
