import { Injectable, Logger } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';
import { BookType } from '@/common/enums/book.enum';
import { AchievementName } from '@/common/enums/ach.enum';

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

  async sendBigBookAch(deviceId: string) {
    if (!deviceId) {
      this.logger.warn('⚠️ No deviceId provided for Big Book Achievement notification.');
      return;
    }

    try {
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

      this.logger.log('✅ Big Book Achievement message sent! Response ID:', response);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending Big Book Achievement message:', error);

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

  async sendFirstPlaceAch(deviceId: string, achievementName: AchievementName) {
    const readableNames: Partial<Record<AchievementName, string>> = {
      [AchievementName.BookAtHome]: 'at home',
      [AchievementName.BookAtWork]: 'at work',
      [AchievementName.BookInACafe]: 'in a café',
      [AchievementName.BookInEducationInstitution]: 'in an educational institution',
      [AchievementName.BookInNature]: 'in nature',
      [AchievementName.BookInTransport]: 'in transport',
      [AchievementName.BookOnTheRoad]: 'on the road',
      [AchievementName.BookInTheLibrary]: 'in the library',
    };

    const readablePlace = readableNames[achievementName] || 'somewhere special';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🎯 New Achievement!',
          body: `You've completed your first book ${readablePlace}! Keep it up 🚀`,
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

      this.logger.log(`✅ First location achievement notification sent. Response ID: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending first location achievement notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Should remove from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async sendThreeBooksAchievement(deviceId: string, achievementName: AchievementName) {
    const readableAchievements: Partial<Record<AchievementName, string>> = {
      [AchievementName.ThreeBooksByOneAuthor]: '3 books by one author',
      [AchievementName.ThreeBooksOfOneGenre]: '3 books of one genre',
      [AchievementName.ThreeHorrorBooks]: '3 horror books',
    };

    const readableAchievement = readableAchievements[achievementName] || '3 awesome books';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🏆 New Achievement!',
          body: `You've read ${readableAchievement}! Fantastic progress 🚀`,
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

      this.logger.log(`✅ Three-books achievement notification sent. Response ID: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending three-books achievement notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Should remove from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async sendReadBookInOneDayAch(deviceId: string, achName: AchievementName) {
    const readableNames: Partial<Record<AchievementName, string>> = {
      [AchievementName.BookReadInOneDay]: 'Read a book in one day',
    };

    const readableAchievement = readableNames[achName] || 'Great Achievement';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🎯 New Achievement!',
          body: `${readableAchievement}! Keep it up 🚀`,
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
        `✅ Read Book in One Day Achievement notification sent. Response ID: ${response}`,
      );
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending Read Book in One Day Achievement notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Should remove from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async friendBookAch(deviceId: string, achName: AchievementName) {
    const readableNames: Partial<Record<AchievementName, string>> = {
      [AchievementName.FriendBook]: 'Friend Book',
    };

    const friendBookAchievement = readableNames[achName] || 'Great Achievement';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🎯 New Achievement!',
          body: `${friendBookAchievement}! Keep it up 🚀`,
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

      this.logger.log(`✅ Friend book Achievement notification sent. Response ID: ${response}`);
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Error sending Read Book in One Day Achievement notification:', error);

      if (error.code === 'messaging/registration-token-not-registered') {
        this.logger.warn('⚠️ Invalid firebase token. Should remove from DB.');
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  async nonStopThirtydaysAch(deviceId: string, achName: AchievementName) {
    const readableNames: Partial<Record<AchievementName, string>> = {
      [AchievementName.ReadNonStopThirtyDays]: 'Read non stop thirty days',
    };

    const nonStopThirtyDaysAchievement = readableNames[achName] || 'Great Achievement';

    try {
      const response = await firebase.messaging().send({
        notification: {
          title: '🎯 New Achievement!',
          body: `${nonStopThirtyDaysAchievement}! Keep it up 🚀`,
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
        `✅ Read non stop thirty days Achievement notification sent. Response ID: ${response}`,
      );
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error('❌ Read non stop thirty days Achievement notification:', error);

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
