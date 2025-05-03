import { Injectable, Logger } from '@nestjs/common';

import * as firebase from 'firebase-admin';
import { BookType } from '@/common/enums/book.enum';
import { AchievementName } from '@/common/enums/ach.enum';
import { achievementMessages } from './ach.messages';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendBigBookAch(deviceId: string) {
    // 如果没有提供deviceId，则返回
    if (!deviceId) {
      this.logger.warn('⚠️ No deviceId provided for Big Book Achievement notification.');
      return;
    }

    try {
      // 发送通知
      const response = await firebase.messaging().send({
        notification: {
          title: 'Congratulations! 🎉',
          body: 'You’ve completed a book with over 1000 pages! ',
        },
        token: deviceId,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      });

      // 记录发送成功的消息
      this.logger.log('✅ Big Book Achievement message sent! Response ID:', response);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      // 记录发送失败的消息
      this.logger.error('❌ Error sending Big Book Achievement message:', error);

      // 如果token无效，则记录警告信息
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

  async sendCountAch(deviceId: string, currentCount: number) {
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

  async sendFirstBookTypeAch(deviceId: string, bookType: BookType) {
    const typeToLabel: Record<BookType, string> = {
      [BookType.Audio]: 'audiobook',
      [BookType.EBook]: 'eBook',
      [BookType.Soft]: 'paper book',
    };

    const readableType = typeToLabel[bookType] || 'book';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🎉 Milestone Reached!',
          body: `You've completed your first ${readableType}! Keep going 🚀`,
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

      this.logger.log(
        `✅ First ${readableType} milestone notification sent. Response ID: ${response}`,
      );
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending the first book type milestone notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Consider removing from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async sendAchNoteByAchName(deviceId: string, achievementName: AchievementName) {
    const achMessages = achievementMessages;

    const message = achMessages[achievementName] || {
      title: '🎉 Achievement Unlocked!',
      body: 'You unlocked a new achievement! Keep going 🚀',
    };

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: message.title,
          body: message.body,
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

      this.logger.log(`✅ Achievement notification sent. Response ID: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending achievement notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Should remove from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}
