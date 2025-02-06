import { Module } from '@nestjs/common';
import { SupportRequestService } from './support-request.service';
import { SupportRequestController } from './support-request.controller';
import { SupportRequest } from './entities/support-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '@/mailer/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportRequest])],
  controllers: [SupportRequestController],
  providers: [SupportRequestService, EmailService],
})
export class SupportRequestModule {}
