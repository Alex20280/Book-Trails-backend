import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseAdminProvider } from './firebase-admin.provider';

@Module({
  controllers: [NotificationController],
  providers: [FirebaseAdminProvider, NotificationService],
})
export class NotificationModule {}
