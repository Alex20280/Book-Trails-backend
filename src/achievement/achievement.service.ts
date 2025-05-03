import { Injectable } from '@nestjs/common';
import { Achievement } from './entities/achievement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
  ) {}

  async findAll() {
    return await this.achievementRepo.find();
  }
}
