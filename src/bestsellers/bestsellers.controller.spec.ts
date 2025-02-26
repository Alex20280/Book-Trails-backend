import { Test, TestingModule } from '@nestjs/testing';
import { BestsellersController } from './bestsellers.controller';
import { BestsellersService } from './bestsellers.service';

describe('BestsellersController', () => {
  let controller: BestsellersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestsellersController],
      providers: [BestsellersService],
    }).compile();

    controller = module.get<BestsellersController>(BestsellersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
