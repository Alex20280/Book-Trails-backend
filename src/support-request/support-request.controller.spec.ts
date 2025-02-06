import { Test, TestingModule } from '@nestjs/testing';
import { SupportRequestController } from './support-request.controller';
import { SupportRequestService } from './support-request.service';

describe('SupportRequestController', () => {
  let controller: SupportRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportRequestController],
      providers: [SupportRequestService],
    }).compile();

    controller = module.get<SupportRequestController>(SupportRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
