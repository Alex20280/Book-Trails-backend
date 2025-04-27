import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Achievement } from '../../achievement/entities/achievement.entity';
import { achievements } from './data';

@Injectable()
export class AchievementSeedService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
  ) {}

  private logger = new Logger(AchievementSeedService.name);

  async run() {
    const count = await this.achievementRepo.count();
    const achs = achievements;

    if (count === 0) {
      await Promise.all(
        achs.map(async (achievement) => {
          const newAchievement = new Achievement(achievement);
          await this.achievementRepo.save(newAchievement);
        }),
      );
    }
    this.logger.log('Achievements seeded');
  }
}
