import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { User } from '@/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { BookStatus } from '@/common/enums/book.enum';
import { BookSession } from '@/book-session/entities/book-session.entity';
import {
  BookResponse,
  StatisticsQueryParams,
} from '@/common/interfaces/book.interfces';
import {
  createReadDaysResponse,
  formatBooksPerMonth,
  getManyResponse,
  calculateReadingTime,
  findStartReadingDate,
  findEndReadingDate,
  calculateSinceStart,
} from '@/common/utils';
import { SubscriptionType } from '@/common/enums/user.enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(BookSession)
    private bookSessionRepository: Repository<BookSession>,
    readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    userId: number,
    payload: CreateBookDto,
    image?: Express.Multer.File,
  ): Promise<Book> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const newBook = new Book(payload);

    newBook.user = user;

    if (image) {
      const { secure_url } = await this.cloudinaryService.uploadFile(image);
      newBook.image = secure_url;
    }

    return await this.bookRepository.save(newBook);
  }

  async findAll(
    userId: number,
    page: number,
    limit: number,
    status?: BookStatus | null,
  ): Promise<BookResponse[]> {
    const query = this.bookRepository
      .createQueryBuilder('book')
      .select([
        'book.id',
        'book.title',
        'book.image',
        'book.author',
        'book.status',
        'book.pages',
        'book.userRating',
      ])
      .leftJoinAndSelect('book.bookSessions', 'bookSession')
      .leftJoin('book.user', 'user')
      .where('user.id = :userId', { userId });

    if (status) {
      query.andWhere('book.status = :status', { status });
    }

    const result = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return getManyResponse(result);
  }

  async findOne(userId: number, bookId: number, offset: number) {
    const data = await this.bookRepository.findOneByOrFail({
      id: bookId,
      user: { id: userId },
    });

    const { bookSessions, ...bookDetails } = data;

    let startReadingDate: string | undefined;
    let endReadingDate: string | undefined;
    let readingPlaces: string[] | undefined;
    let readingSessions: number | undefined;
    let readingTime: number | undefined;
    let sinceStart: number | undefined;

    if (data.status !== BookStatus.ToRead) {
      const sessions = bookSessions;
      readingSessions = sessions.length;

      readingTime = calculateReadingTime(sessions);
      startReadingDate = findStartReadingDate(sessions);
      endReadingDate =
        data.status === BookStatus.Read
          ? findEndReadingDate(sessions)
          : undefined;
      readingPlaces = [...new Set(sessions.map((s) => s.readingPlace))];
      sinceStart = calculateSinceStart(findStartReadingDate(sessions), offset);
    }

    const response = {
      ...bookDetails,
      startReadingDate,
      endReadingDate,
      readingPlaces,
      readingSessions,
      readingTime,
      sinceStart,
    };
    return response;
  }

  async delete(userId: number, bookId: number): Promise<{ message: string }> {
    const book = await this.bookRepository.findOneByOrFail({
      id: bookId,
      user: { id: userId },
    });

    await this.bookRepository.remove(book);

    return { message: 'book successfully deleted' };
  }

  async getBookStatistics(params: StatisticsQueryParams) {
    const { userId } = params;
    const [booksPerMonth, readDays, bookTypes, subData, averageHoursPerWeek] =
      await Promise.all([
        this.getBooksPerMonth(params),
        this.getReadDays(params),
        this.getBookType(params),
        this.userRepository
          .createQueryBuilder('user')
          .select(['user.id', 'user.subscriptionType'])
          .where('user.id = :userId', { userId })
          .getOneOrFail(),
        this.getAverageHoursPerWeek(params),
      ]);

    let readPlaces: Record<string, number> | undefined;
    let readSources: Record<string, number> | undefined;
    let readRating: Record<string, number> | undefined;
    let readLanguage: Record<string, number> | undefined;
    let readGenres: Record<string, number> | undefined;

    if (subData.subscriptionType === SubscriptionType.Premium) {
      [readPlaces, readSources, readRating, readLanguage, readGenres] =
        await Promise.all([
          this.getReadPlaces(params),
          this.getReadSource(params),
          this.getReadRating(params),
          this.getReadLanguage(params),
          this.getReadGenres(params),
        ]);
    }

    return {
      bookTypes,
      averageHoursPerWeek,
      booksPerMonth: formatBooksPerMonth(booksPerMonth),
      readDays: createReadDaysResponse(readDays),
      ...(readPlaces && { readPlaces }),
      ...(readSources && { readSources }),
      ...(readLanguage && { readLanguage }),
      ...(readRating && { readRating }),
      ...(readGenres && { readGenres }),
    };
  }

  private async getBooksPerMonth(params: StatisticsQueryParams) {
    const { userId, offset, year } = params;
    const booksPerMonth = await this.bookRepository
      .createQueryBuilder('book')
      .innerJoin('book.user', 'user')
      .select([
        `TO_CHAR(book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM') AS readMonth`,
        `COUNT(book.id) AS bookCount`,
      ])
      .where('user.id = :userId', { userId })
      .andWhere('book.endDate IS NOT NULL')
      .andWhere(
        `EXTRACT(YEAR FROM book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes') = :year`,
        { year },
      )
      .groupBy(
        `TO_CHAR(book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM')`,
      )
      .orderBy(
        `TO_CHAR(book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM')`,
        'ASC',
      )
      .getRawMany();

    return booksPerMonth;
  }

  private async getReadDays(params: StatisticsQueryParams) {
    const { userId, offset, year } = params;
    const readDays = await this.bookSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.book', 'book')
      .innerJoin('book.user', 'user')
      .select(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM-DD')`,
        'readDay',
      )
      .where('user.id = :userId', { userId })
      .andWhere(
        `EXTRACT(YEAR FROM session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes') = :year`,
        { year },
      )
      .distinctOn([
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM-DD')`,
      ])
      .groupBy(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM-DD'), session.startDate`,
      )
      .orderBy(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM-DD')`,
        'ASC',
      )
      .addOrderBy('session."startDate"', 'ASC')
      .getRawMany();

    return readDays;
  }

  private async getBookType(params: StatisticsQueryParams) {
    const result = await this.getFieldStats(params, 'type');
    return result;
  }

  private async getReadPlaces(params: StatisticsQueryParams) {
    const { userId, offset, year } = params;
    const data = await this.bookSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.book', 'book')
      .innerJoin('book.user', 'user')
      .select('session.readingPlace', 'place')
      .addSelect('COUNT(session.readingPlace)', 'count')
      .where('user.id = :userId', { userId })
      .andWhere('book.status = :status', { status: BookStatus.Read })
      .andWhere(
        `EXTRACT(YEAR FROM book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes') = :year`,
        { year },
      )
      .groupBy('session.readingPlace')
      .getRawMany();

    const result = data.reduce(
      (acc, { place, count }) => {
        acc[place] = Number(count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return result;
  }

  private async getReadSource(params: StatisticsQueryParams) {
    const result = await this.getFieldStats(params, 'source');
    return result;
  }

  private async getReadRating(params: StatisticsQueryParams) {
    const result = await this.getFieldStats(params, 'userRating');
    return result;
  }

  private async getReadLanguage(params: StatisticsQueryParams) {
    const result = await this.getFieldStats(params, 'language');
    return result;
  }

  private async getReadGenres(params: StatisticsQueryParams) {
    const result = await this.getFieldStats(params, 'genre');
    return result;
  }

  private async getFieldStats(
    params: StatisticsQueryParams,
    groupByField: string,
  ): Promise<Record<string | number, number>> {
    const { userId, offset, year } = params;
    const result = await this.bookRepository
      .createQueryBuilder('book')
      .select(`book.${groupByField}`, 'key')
      .addSelect('COUNT(book.id)', 'count')
      .where('book.userId = :userId', { userId })
      .andWhere('book.status = :status', { status: BookStatus.Read })
      .andWhere('book."endDate" IS NOT NULL')
      .andWhere(
        `EXTRACT(YEAR FROM book."endDate"::TIMESTAMP - INTERVAL '${offset} minutes') = :year`,
        { year },
      )
      .groupBy(`book.${groupByField}`)
      .getRawMany();

    return result.reduce(
      (acc, { key, count }) => {
        acc[key] = Number(count);
        return acc;
      },
      {} as Record<string | number, number>,
    );
  }

  private async getAverageHoursPerWeek(params: StatisticsQueryParams) {
    const { userId, offset, year } = params;
    const totalTimes = await this.bookSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.book', 'book')
      .leftJoin('session.pauses', 'pause')
      .select([
        `SUM(EXTRACT(EPOCH FROM (session."endDate"::TIMESTAMP - session."startDate"::TIMESTAMP))) AS "totalReadingTime"`,
        `COALESCE(SUM(EXTRACT(EPOCH FROM (pause."endDate"::TIMESTAMP - pause."startDate"::TIMESTAMP))), 0) AS "totalPauseTime"`, // Використовуємо COALESCE, щоб замінити NULL на 0
      ])
      .where('book."userId" = :userId', { userId })
      .andWhere('book."status" = :status', { status: BookStatus.Read })
      .andWhere('session."endDate" IS NOT NULL')
      .andWhere(
        `EXTRACT(YEAR FROM session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes') = :year`,
        { year },
      )
      .getRawOne();

    const totalHours =
      totalTimes.totalReadingTime && totalTimes.totalPauseTime
        ? +(+totalTimes.totalReadingTime - +totalTimes.totalPauseTime).toFixed(
            0,
          )
        : 0;
    return totalHours;
  }
}
