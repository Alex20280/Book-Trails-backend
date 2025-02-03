import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { BookSession } from './entities/book-session.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import {
  CreateBookSession,
  FinishBook,
  UpdateBookSession,
} from '@/common/interfaces/book.session.service.interfaces';
import { BookStatus } from '@/common/enums/book.enum';
import { ReviewService } from '../review/review.service';

@Injectable()
export class BookSessionService {
  constructor(
    @InjectRepository(BookSession)
    readonly bookSessionRepository: Repository<BookSession>,
    @InjectRepository(Book)
    readonly bookRepository: Repository<Book>,
    readonly reviewService: ReviewService,
    readonly dataSource: DataSource,
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

      await this.bookRepository.update(
        { id: book.id },
        { status: BookStatus.Reading },
      );

      const newBookSession = new BookSession(createDto);

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
      const [book, bookSession] = await Promise.all([
        this.bookRepository.findOneOrFail({
          where: { id: bookId },
          select: ['id', 'pages'],
        }),
        this.bookSessionRepository.findOneOrFail({
          where: {
            id: bookSessionId,
            book: { id: bookId, user: { id: userId } },
          },
        }),
      ]);

      if (bookSession.endDate) {
        throw new BadRequestException('Book session is finished!');
      }

      const bookPages = book.pages;

      if (currentPage === bookPages) {
        await this.bookRepository.update(
          { id: book.id },
          { status: BookStatus.Read, isLegacy: true },
        );
      }

      await this.bookSessionRepository.save(
        this.bookSessionRepository.merge(bookSession, {
          currentPage,
        }),
      );

      return { message: 'The book session has been successfully completed' };
    } catch (error) {
      throw error;
    }
  }

  async finishTheBook(payload: FinishBook) {
    const {
      userId,
      bookId,
      bookSessionId,
      finishDto: { currentPage, stars, review } = {},
    } = payload;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const [book, bookSession, newReview] = await Promise.all([
        manager.findOneOrFail(Book, {
          where: { id: bookId },
          select: ['id', 'pages'],
        }),
        manager.findOneOrFail(BookSession, {
          where: {
            id: bookSessionId,
            book: { id: bookId, user: { id: userId } },
          },
        }),
        review ? this.reviewService.create({ text: review }, manager) : null,
      ]);

      bookSession.currentPage = currentPage;

      book.userRating = stars;
      book.status = BookStatus.Read;

      if (newReview) {
        book.reviews.push(newReview);
      }

      await Promise.all([
        manager.save(BookSession, bookSession),
        manager.save(Book, book),
      ]);

      await queryRunner.commitTransaction();

      return book;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
