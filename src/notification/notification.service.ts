import { Injectable, Logger } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendNotification(payload: SendNotificationDto) {
    try {
      const response = await firebase.messaging().send({
        notification: {
          title: payload.title,
          body: payload.body,
        },
        token: payload.deviceId,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      });

      this.logger.log('✅ The message has been successfully sent! Response ID:', response);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending a message:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(
          '⚠️ The token is no longer valid. It should be removed from the database.',
        );
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async sendLegacyBookMilestone(deviceId: string, currentCount: number) {
    try {
      const response = await firebase.messaging().send({
        notification: {
          title: 'Congratulations 🎉',
          body: `This is your ${currentCount}th completed book! Keep it up 💪`,
        },

        token: deviceId,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      });

      this.logger.log(`✅ Legacy milestone notification sent. Response ID: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending the legacy milestone notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Remove from the database.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}
