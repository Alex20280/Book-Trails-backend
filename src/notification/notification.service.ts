import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationService {
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
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });

      console.log(
        '✅ Повідомлення успішно відправлено! Response ID:',
        response,
      );
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('❌ Помилка при надсиланні повідомлення:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        console.warn('⚠️ Токен більше не дійсний. Його слід видалити з бази.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}
