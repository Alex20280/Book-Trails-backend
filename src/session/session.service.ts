import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from '@/user/entities/user.entity';
import { Session } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(user: User) {
    const newSession = new Session();
    newSession.user = user;

    return (await this.sessionRepository.save(newSession)).id;
  }

  async findOneForJwt(userId: number, sessionId: number) {
    const data = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.id = :sessionId', { sessionId })
      .andWhere('session.userId = :userId', { userId })
      .getOne();

    if (!data) {
      throw new BadRequestException('Session is closed!');
    }

    if (!data || !data.user.isLoggedIn) throw new UnauthorizedException();
  }

  async closeSession(userId: number) {
    await this.sessionRepository.delete({
      user: { id: userId },
    });
  }
}
