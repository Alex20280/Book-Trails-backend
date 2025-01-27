import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { BookSession } from './entities/book-session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import {
  CreateBookSession,
  UpdateBookSession,
} from '@/common/interfaces/book.session.service.interfaces';

@Injectable()
export class BookSessionService {
  constructor(
    @InjectRepository(BookSession)
    readonly bookSessionRepository: Repository<BookSession>,
    @InjectRepository(Book)
    readonly bookRepository: Repository<Book>,
  ) {}

  async create(payload: CreateBookSession): Promise<BookSession> {
    const { userId, bookId, createDto } = payload;
    try {
      const book = await this.bookRepository.findOneOrFail({
        where: { id: bookId, user: { id: userId } },
      });

      const isSomeSessionNotnished = book.bookSessions.some(
        (s) => s.endDate === null,
      );

      if (isSomeSessionNotnished) {
        throw new ConflictException('Some reading session is not finished!');
      }

      const newBookSession = new BookSession(createDto);

      newBookSession.startDate = new Date();
      newBookSession.book = book;

      return await this.bookSessionRepository.save(newBookSession);
    } catch (error) {
      throw error;
    }
  }

  async update(payload: UpdateBookSession): Promise<{ message: string }> {
    const {
      userId,
      bookId,
      bookSessionId,
      updateDto: { currentPage } = {},
    } = payload;

    try {
      const bookSession = await this.bookSessionRepository.findOneOrFail({
        where: {
          id: bookSessionId,
          book: { id: bookId, user: { id: userId } },
        },
      });

      if (bookSession.endDate) {
        throw new BadRequestException('Book session is finished!');
      }

      const updatedBookSession = this.bookSessionRepository.merge(bookSession, {
        currentPage,
        endDate: new Date(),
      });

      await this.bookSessionRepository.save(updatedBookSession);

      return { message: 'The book session has been successfully completed' };
    } catch (error) {
      throw error;
    }
  }
}
