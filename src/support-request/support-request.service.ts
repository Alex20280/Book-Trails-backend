import { Injectable } from '@nestjs/common';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SupportRequest } from './entities/support-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '@/mailer/email.service';

@Injectable()
export class SupportRequestService {
  constructor(
    @InjectRepository(SupportRequest)
    private supportRepository: Repository<SupportRequest>,
    readonly emailService: EmailService,
  ) {}

  async create(
    userId: number,
    userEmail: string,
    payload: CreateSupportRequestDto,
  ): Promise<{ message: string }> {
    //temporarily
    // const data = { userId, userEmail, message: payload.message };
    // const newEntity = new SupportRequest(data);
    // await this.supportRepository.save(newEntity);

    await this.emailService.supportEmail(userEmail, payload.message);

    return { message: 'the message has been successfully delivered' };
  }
}
