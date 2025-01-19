import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from '@/session/entities/session.entity';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  // Виконання крону кожну годину
  @Cron('0 * * * *', {
    name: 'delete expired sessions',
    timeZone: 'Europe/Kyiv',
  })
  async handleCron(): Promise<void> {
    const EXPIRATION_HOURS = 2;
    const now = new Date();
    now.setHours(now.getHours() - EXPIRATION_HOURS);
    console.log('now :>> ', now);
    const twoHoursAgo = now.toISOString();

    try {
      const result = await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .from(Session)
        .where('createdAt < :twoHoursAgo', { twoHoursAgo })
        .execute();

      if (result.affected) {
        console.log(`Deleted ${result.affected} expired sessions.`);
      } else {
        console.log('No expired sessions found.');
      }
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
    }
  }
}
