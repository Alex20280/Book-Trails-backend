import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionPause, EndSessionPause } from '@/common/interfaces';
import { Pause } from './entities/pause.entity';
import { BookSession } from '@/book-session/entities/book-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PauseService {
  constructor(
    @InjectRepository(BookSession)
    readonly bookSessionRepository: Repository<BookSession>,
    @InjectRepository(Pause)
    readonly pauseRepository: Repository<Pause>,
  ) {}

  async create(payload: CreateSessionPause): Promise<Pause> {
    const { userId, bookId, bookSessionId } = payload;

    const bookSession = await this.bookSessionRepository.findOneOrFail({
      where: {
        id: bookSessionId,
        book: { id: bookId, user: { id: userId } },
      },
    });

    if (bookSession.endDate) {
      throw new BadRequestException('Book session is finished!');
    }

    const newPause = new Pause();

    newPause.startDate = new Date().toISOString();
    newPause.bookSession = bookSession;

    return await this.pauseRepository.save(newPause);
  }

  async update(payload: EndSessionPause): Promise<{ message: string }> {
    const { userId, bookId, bookSessionId, pauseId } = payload;

    const pause = await this.pauseRepository.findOneByOrFail({
      id: pauseId,
      bookSession: {
        id: bookSessionId,
        book: { id: bookId, user: { id: userId } },
      },
    });

    const updatedPause = this.pauseRepository.merge(pause, {
      endDate: new Date().toISOString(),
    });

    await this.pauseRepository.save(updatedPause);

    return { message: 'The book session continues' };
  }
}
