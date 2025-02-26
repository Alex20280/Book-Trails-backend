import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@/user/entities/user.entity';
import { Role, SubscriptionType } from '@/common/enums/user.enum';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    readonly configService: ConfigService,
  ) {}

  async run() {
    const count = await this.userRepository.count({
      where: { role: Role.Admin },
    });
    if (count === 0) {
      const admin = new User();

      admin.role = Role.Admin;
      admin.password = await bcrypt.hash(
        this.configService.get<string>('ADMIN_PASS'),
        10,
      );
      admin.email = this.configService.get<string>('ADMIN_EMAIL');
      admin.isLoggedIn = true;
      admin.isVerifyEmail = true;
      admin.subscriptionType = SubscriptionType.Premium;
      admin.name = 'admin';

      await this.userRepository.save(admin);
    }
  }
}
