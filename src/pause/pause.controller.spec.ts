import { Test, TestingModule } from '@nestjs/testing';
import { PauseController } from './pause.controller';
import { PauseService } from './pause.service';

describe('PauseController', () => {
  let controller: PauseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PauseController],
      providers: [PauseService],
    }).compile();

    controller = module.get<PauseController>(PauseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
