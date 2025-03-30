import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationService {
  async sendNotification(payload: SendNotificationDto) {
    try {
      await firebase
        .messaging()
        .send({
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
        })
        .catch((error: any) => {
          console.error(error);
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
