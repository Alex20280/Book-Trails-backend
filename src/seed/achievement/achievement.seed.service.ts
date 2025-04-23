import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Achievement } from '../../achievement/entities/achievement.entity';

@Injectable()
export class AchievementSeedService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
  ) {}

  async run() {
    const count = await this.achievementRepo.count();
    if (count === 0) {
      const achievement = new Achievement();
    }
  }
}
