import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { BookSession } from './entities/book-session.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import {
  CreateBookSession,
  FinishBook,
  UpdateBookSession,
} from '@/common/interfaces/book.session.service.interfaces';
import { BookStatus, BookType } from '@/common/enums/book.enum';
import { ReviewService } from '../review/review.service';
import { User } from '@/user/entities/user.entity';
import { NotificationService } from '@/notification/notification.service';
import { ReadCount } from '@/read-count/entities/read-count.entity';
import { Achievement } from '@/achievement/entities/achievement.entity';
import { AchievementName } from '@/common/enums/ach.enum';
import { bookCountAchMap } from '@/common/helpers/book-count-ach';

@Injectable()
export class BookSessionService {
  constructor(
    @InjectRepository(BookSession)
    readonly bookSessionRepository: Repository<BookSession>,
    @InjectRepository(Book)
    readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
    @InjectRepository(ReadCount)
    readonly readCountRepository: Repository<ReadCount>,
    @InjectRepository(Achievement)
    readonly achRepository: Repository<Achievement>,
    readonly notificationService: NotificationService,
    readonly reviewService: ReviewService,
    readonly dataSource: DataSource,
  ) {}

  async create(payload: CreateBookSession): Promise<BookSession> {
    const { userId, bookId, readingPlace } = payload;
    try {
      const book = await this.bookRepository.findOneOrFail({
        where: { id: bookId, user: { id: userId } },
      });

      const isSomeSessionNotnished = book.bookSessions.some((s) => s.endDate === null);

      if (isSomeSessionNotnished) {
        throw new ConflictException('Some reading session is not finished!');
      }

      await this.bookRepository.update({ id: book.id }, { status: BookStatus.Reading });

      const newBookSession = new BookSession({ readingPlace });

      newBookSession.book = book;

      return await this.bookSessionRepository.save(newBookSession);
    } catch (error) {
      throw error;
    }
  }

  async update(payload: UpdateBookSession): Promise<{ message: string }> {
    const { userId, bookId, bookSessionId, updateDto: { currentPage } = {} } = payload;

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
      const endDate = new Date().toISOString();
      await this.bookSessionRepository.save(
        this.bookSessionRepository.merge(bookSession, {
          currentPage,
          endDate,
        }),
      );

      return { message: 'The book session has been successfully completed' };
    } catch (error) {
      throw error;
    }
  }

  async finishTheBook(payload: FinishBook): Promise<boolean> {
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

      const endDate = new Date().toISOString();

      const [book, bookSession, newReview, readBookCount, totalReadCount] = await Promise.all([
        manager.findOneOrFail(Book, {
          where: { id: bookId },
          select: ['id', 'pages', 'type'],
        }),

        manager.findOneOrFail(BookSession, {
          where: {
            id: bookSessionId,
            book: { id: bookId, user: { id: userId } },
          },
        }),

        review ? this.reviewService.create({ text: review }, manager) : null,

        manager
          .createQueryBuilder(Book, 'book')
          .where('book.status = :status', { status: 'read' })
          .andWhere('book.userId = :userId', { userId })
          .getCount(),

        manager
          .createQueryBuilder(ReadCount, 'rc')
          .innerJoin('rc.book', 'book')
          .where('book.userId = :userId', { userId })
          .getCount(),
      ]);

      if (currentPage !== book.pages) {
        throw new BadRequestException('Current page cannot be greater or lower than total pages');
      }
      const currentCount = +readBookCount + +totalReadCount + 1;

      await this.checkAndAssignBookAchievement(userId, currentCount, manager);

      bookSession.currentPage = currentPage;
      bookSession.endDate = endDate;

      book.userRating = stars;
      book.status = BookStatus.Read;
      book.endDate = endDate;
      book.isLegacy = true;

      if (newReview) {
        book.reviews.push(newReview);
      }

      await Promise.all([manager.save(BookSession, bookSession), manager.save(Book, book)]);

      await queryRunner.commitTransaction();

      if ([BookType.Audio, BookType.EBook].includes(book.type)) {
        await this.typeBookAchievement(userId, book.type);
      }

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async checkAndAssignBookAchievement(
    userId: number,
    currentCount: number,
    manager: EntityManager,
  ): Promise<void> {
    const milestoneCounts = new Set(Object.keys(bookCountAchMap).map(Number));

    if (!milestoneCounts.has(currentCount)) return;

    const achievementName = bookCountAchMap[currentCount];

    const [user, achievement] = await Promise.all([
      manager.findOneOrFail(User, {
        where: { id: userId },
        relations: ['achievements'],
      }),
      manager.findOneOrFail(Achievement, {
        where: { name: achievementName },
      }),
    ]);

    user.achievements.push(achievement);

    await Promise.all([
      this.notificationService.sendLegacyBookMilestone(user.firebaseDeviceId, currentCount),
      manager.save(User, user),
    ]);
  }

  private async typeBookAchievement(userId: number, bookType: BookType) {
    const [bookCount, readCount] = await Promise.all([
      this.bookRepository
        .createQueryBuilder('book')
        .where('book.userId = :userId', { userId })
        .andWhere('book.type = :type', { type: bookType })
        .andWhere('book.status = :status', { status: BookStatus.Read })
        .getCount(),

      this.readCountRepository
        .createQueryBuilder('rc')
        .innerJoin('rc.book', 'book')
        .where('book.userId = :userId', { userId })
        .andWhere('book.type = :type', { type: bookType })
        .getCount(),
    ]);

    const totalCount = bookCount + readCount;

    if (totalCount === 1) {
      const typeToAchievementMap: Record<BookType, AchievementName | null> = {
        [BookType.Audio]: AchievementName.Audiobook,
        [BookType.EBook]: AchievementName.EBook,
        [BookType.Soft]: null,
      };

      const achievementName = typeToAchievementMap[bookType];

      if (achievementName) {
        const [user, achievement] = await Promise.all([
          this.userRepository.findOneOrFail({
            where: { id: userId },
            select: ['id', 'firebaseDeviceId'],
            relations: ['achievements'],
          }),
          this.achRepository.findOne({
            where: { name: achievementName },
            select: ['id'],
          }),
        ]);

        if (achievement && !user.achievements.some((a) => a.id === achievement.id)) {
          user.achievements.push(achievement);
          await Promise.all([
            this.userRepository.save(user),
            this.notificationService.sendFirstBookTypeMilestone(user.firebaseDeviceId, bookType),
          ]);
        }
      }
    }
  }
}
