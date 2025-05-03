import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BookSession } from './entities/book-session.entity';
import { Repository, DataSource, EntityManager, DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import {
  CreateBookSession,
  FinishBook,
  UpdateBookSession,
} from '@/common/interfaces/book.session.service.interfaces';
import { BookStatus, BookType, ReadingPlace, Source } from '@/common/enums/book.enum';
import { ReviewService } from '../review/review.service';
import { User } from '@/user/entities/user.entity';
import { NotificationService } from '@/notification/notification.service';
import { ReadCount } from '@/read-count/entities/read-count.entity';
import { Achievement } from '@/achievement/entities/achievement.entity';
import { AchievementName } from '@/common/enums/ach.enum';
import { bookCountAchMap, bookLocationAchMap } from '@/common/helpers/book-ach';
import { Review } from '@/review/entities/review.entity';
import { isSameDay } from '@/common/helpers/is.same.day';
import { NonStopReadingService } from '@/non-stop-reading/non-stop-reading.service';

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
    readonly nonStopReadingService: NonStopReadingService,
    readonly dataSource: DataSource,
  ) {}

  private readonly milestoneCounts = new Set(Object.keys(bookCountAchMap).map(Number));
  private readonly typeToAchievementMap: Record<BookType, AchievementName | null> = {
    [BookType.Audio]: AchievementName.Audiobook,
    [BookType.EBook]: AchievementName.EBook,
    [BookType.Soft]: null,
  };

  async create(payload: CreateBookSession) {
    const { userId, bookId, readingPlace } = payload;

    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
        relations: ['achievements'],
      });
      const achNames = user.achievements.map((a) => a.name);

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

      const savedSession = await this.bookSessionRepository.save(newBookSession);

      if (!achNames.includes(AchievementName.ReadNonStopThirtyDays)) {
        const nonStopThirtyDays = await this.nonStopReadingService.nonStopManipulation(
          user,
          newBookSession.startDate,
        );
        if (nonStopThirtyDays) {
          await this.nonStopThirtydaysAch(user, AchievementName.ReadNonStopThirtyDays);
        }
      }
      return savedSession;
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

      const [session, book, firstSession] = await Promise.all([
        manager
          .createQueryBuilder(BookSession, 'session')
          .select(['session.id', 'session.readingPlace'])
          .where('session.id = :bookSessionId', { bookSessionId })
          .andWhere('session.bookId = :bookId', { bookId })
          .getOne(),

        manager
          .createQueryBuilder(Book, 'book')
          .leftJoin('book.genres', 'genre')
          .select([
            'book.id',
            'book.pages',
            'book.type',
            'book.author',
            'genre.id',
            'genre.name',
            'book.source',
          ])
          .where('book.id = :bookId', { bookId })
          .getOne(),

        manager
          .createQueryBuilder(BookSession, 'firstSession')
          .select(['firstSession.id', 'firstSession.startDate'])
          .where('firstSession.bookId = :bookId', { bookId })
          .orderBy('firstSession.startDate', 'ASC')
          .limit(1)
          .getOne(),
      ]);

      if (!session) {
        throw new NotFoundException('Book session not found');
      }

      if (book.pages !== currentPage) {
        throw new BadRequestException('Current page is not equal to book pages');
      }

      const query = manager
        .createQueryBuilder(User, 'user')
        .leftJoin('user.achievements', 'ach')
        .loadRelationCountAndMap('user.booksByOneAuthor', 'user.books', 'book', (qb) =>
          qb
            .where('book.author = :author', { author: book.author })
            .andWhere('book.endDate IS NOT NULL')
            .andWhere('book.id != :currentBookId', { currentBookId: bookId }),
        )
        .loadRelationCountAndMap('user.booksByOneGenre', 'user.books', 'book', (qb) =>
          qb
            .innerJoin('book.genres', 'genre')
            .where('genre.id IN (:...genreIds)', {
              genreIds: book.genres.map((g) => g.id),
            })
            .andWhere('book.endDate IS NOT NULL')
            .andWhere('book.id != :currentBookId', { currentBookId: bookId }),
        )
        .select(['user.id', 'user.readBookCount', 'user.firebaseDeviceId', 'ach.id', 'ach.name'])
        .where('user.id = :userId', { userId });

      const hasHorrorGenre = book.genres.some((g) => g.name.toLowerCase() === 'horror');

      if (hasHorrorGenre) {
        query.loadRelationCountAndMap('user.booksHorrorCount', 'user.books', 'book', (qb) =>
          qb
            .innerJoin('book.genres', 'genre')
            .where('genre.name = :genreName', { genreName: 'horror' })
            .andWhere('book.endDate IS NOT NULL')
            .andWhere('book.id != :currentBookId', { currentBookId: bookId }),
        );
      }

      const endDate = new Date().toISOString();

      const [user] = await Promise.all([
        await query.getOneOrFail(),

        manager
          .createQueryBuilder()
          .update(BookSession)
          .set({
            ...(currentPage !== undefined && { currentPage }),
            endDate,
          })
          .where('id = :bookSessionId', { bookSessionId })
          .andWhere('bookId = :bookId', { bookId })
          .execute(),

        manager
          .createQueryBuilder()
          .update(Book)
          .set({
            ...(stars !== undefined && {
              userRating: stars,
              status: BookStatus.Read,
              endDate,
              isLegacy: true,
            }),
          })
          .where('id = :bookId', { bookId })
          .andWhere('userId = :userId', { userId })
          .execute(),

        review
          ? manager
              .createQueryBuilder()
              .insert()
              .into(Review)
              .values({
                text: review,
                book: { id: bookId },
              })
              .execute()
          : null,
      ]);

      const extendedUser = user as User & {
        booksByOneAuthor: number;
        booksByOneGenre: number;
        booksHorrorCount: number;
      };

      const achNames = user.achievements.map((a) => a.name);

      const tasks: Promise<any>[] = [];

      if (
        isSameDay(firstSession.startDate, endDate) &&
        !achNames.includes(AchievementName.BookReadInOneDay)
      ) {
        tasks.push(this.readBookInOneDayAch(user, AchievementName.BookReadInOneDay, manager));
      }

      if (book.source === Source.Borrowed && !achNames.includes(AchievementName.FriendBook)) {
        tasks.push(this.friendBookAch(user, AchievementName.FriendBook, manager));
      }

      const currentCount = user.readBookCount + 1;

      const bookCountAchievementName = bookCountAchMap[currentCount];

      if (this.milestoneCounts.has(currentCount) && !achNames.includes(bookCountAchievementName)) {
        tasks.push(this.bookCountAchievement(user, currentCount, manager));
      }

      if (book.pages >= 1000 && !achNames.includes(AchievementName.Book1000Pages)) {
        const bigBooksCount = await manager
          .createQueryBuilder(Book, 'book')
          .where('book.userId = :userId', { userId: user.id })
          .andWhere('book.endDate IS NOT NULL')
          .andWhere('book.pages >= 1000')
          .andWhere('book.id != :currentBookId', { currentBookId: bookId })
          .getCount();

        if (bigBooksCount === 0) {
          tasks.push(this.bigBookAchievement(user, manager));
        }
      }

      const achievementName = this.typeToAchievementMap[book.type];

      if (book.type !== BookType.Soft && !achNames.includes(achievementName)) {
        const completedSoftBooksCount = await manager
          .createQueryBuilder(Book, 'book')
          .where('book.userId = :userId', { userId: user.id })
          .andWhere('book.type = :type', { type: BookType.Soft })
          .andWhere('book.id != :currentBookId', { currentBookId: bookId })
          .andWhere('book.endDate IS NOT NULL')
          .getCount();

        if (completedSoftBooksCount === 0) {
          tasks.push(this.typeBookAchievement(user, book.type, manager));
        }
      }

      const locationAchievementName = bookLocationAchMap[session.readingPlace as ReadingPlace];

      if (locationAchievementName && !achNames.includes(locationAchievementName)) {
        const completedSessionsCount = await manager
          .createQueryBuilder(BookSession, 'session')
          .where('session.readingPlace = :readingPlace', {
            readingPlace: session.readingPlace,
          })
          .andWhere('session.endDate IS NOT NULL')
          .andWhere('session.id != :currentSessionId', { currentSessionId: session.id })
          .getCount();

        if (completedSessionsCount === 0) {
          tasks.push(this.bookLocationAchievement(user, locationAchievementName, manager));
        }
      }

      const achThreeToCheck = [
        {
          achievementName: AchievementName.ThreeBooksByOneAuthor,
          condition: extendedUser.booksByOneAuthor === 2,
        },
        {
          achievementName: AchievementName.ThreeHorrorBooks,
          condition: hasHorrorGenre && extendedUser.booksHorrorCount === 2,
        },
        {
          achievementName: AchievementName.ThreeBooksOfOneGenre,
          condition: extendedUser.booksByOneGenre === 2,
        },
      ];

      tasks.push(this.threeBooksAchievement(user, achThreeToCheck, manager));

      await Promise.all(tasks);
      user.readBookCount += 1;
      await manager.save(User, user);

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async bookCountAchievement(
    user: DeepPartial<User>,
    currentCount: number,
    manager: EntityManager,
  ): Promise<void> {
    const achievementName = bookCountAchMap[currentCount];

    const achievement = await manager.findOneOrFail(Achievement, {
      where: { name: achievementName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.notificationService.sendCountAch(user.firebaseDeviceId, currentCount);
    }
  }

  private async bigBookAchievement(user: DeepPartial<User>, manager: EntityManager) {
    const achievementName = AchievementName.Book1000Pages;

    const achievement = await manager.findOneOrFail(Achievement, {
      where: { name: achievementName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.notificationService.sendBigBookAch(user.firebaseDeviceId);
    }
  }

  private async typeBookAchievement(
    user: DeepPartial<User>,
    bookType: BookType,
    manager: EntityManager,
  ): Promise<void> {
    const typeToAchievementMap: Record<BookType, AchievementName | null> = {
      [BookType.Audio]: AchievementName.Audiobook,
      [BookType.EBook]: AchievementName.EBook,
      [BookType.Soft]: null,
    };

    const achievementName = typeToAchievementMap[bookType];

    if (achievementName) {
      const achievement = await manager.findOneOrFail(Achievement, {
        where: { name: achievementName },
        select: ['id'],
      });

      if (!user.achievements.some((a) => a.id === achievement.id)) {
        user.achievements.push(achievement);
        await this.notificationService.sendFirstBookTypeAch(user.firebaseDeviceId, bookType);
      }
    }
  }

  private async bookLocationAchievement(
    user: DeepPartial<User>,
    achName: AchievementName,
    manager: EntityManager,
  ) {
    const achievement = await manager.findOneOrFail(Achievement, {
      where: { name: achName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.notificationService.sendAchNoteByAchName(user.firebaseDeviceId, achName);
    }
  }

  private async threeBooksAchievement(
    user: DeepPartial<User>,
    achievements: { achievementName: AchievementName; condition: boolean }[],
    manager: EntityManager,
  ) {
    const achNames = user.achievements.map((a) => a.name);

    const tasks = achievements.map(async ({ achievementName, condition }) => {
      if (achNames.includes(achievementName) || !condition) {
        return;
      }

      const achievement = await manager.findOneOrFail(Achievement, {
        where: { name: achievementName },
        select: ['id'],
      });
      user.achievements.push(achievement);
      await this.notificationService.sendAchNoteByAchName(user.firebaseDeviceId, achievementName);
    });

    await Promise.all(tasks);
  }

  private async readBookInOneDayAch(
    user: DeepPartial<User>,
    achName: AchievementName,
    manager: EntityManager,
  ) {
    const achievement = await manager.findOneOrFail(Achievement, {
      where: { name: achName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.notificationService.sendAchNoteByAchName(user.firebaseDeviceId, achName);
    }
  }

  private async friendBookAch(
    user: DeepPartial<User>,
    achName: AchievementName,
    manager: EntityManager,
  ) {
    const achievement = await manager.findOneOrFail(Achievement, {
      where: { name: achName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.notificationService.sendAchNoteByAchName(user.firebaseDeviceId, achName);
    }
  }

  private async nonStopThirtydaysAch(user: DeepPartial<User>, achName: AchievementName) {
    const achievement = await this.achRepository.findOneOrFail({
      where: { name: achName },
      select: ['id'],
    });

    if (!user.achievements.some((a) => a.id === achievement.id)) {
      user.achievements.push(achievement);
      await this.userRepository.save(user);
      await this.notificationService.sendAchNoteByAchName(user.firebaseDeviceId, achName);
    }
  }
}
