import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { User } from '@/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { BookStatus } from '@/common/enums/book.enum';
import { BookSession } from '@/book-session/entities/book-session.entity';
import { BookResponse } from '@/common/interfaces/book.interfces';
import {
  getStartEndOfYear,
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

  async getBookStatistics(userId: number, offset: number, year: number) {
    const { startOfYearUserTime, endOfYearUserTime } = getStartEndOfYear(
      offset,
      year,
    );

    const booksPerMonthQuery = this.booksPerMonthQuery(userId, offset, year);
    const readDaysQuery = this.readDaysQuery(
      userId,
      offset,
      year,
      startOfYearUserTime,
      endOfYearUserTime,
    );

    const booksPerMonth = await booksPerMonthQuery.getRawMany();
    const readDays = await readDaysQuery.getRawMany();
    const bookTypes = await this.getBookType(userId, offset, year);

    const subData = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.subscriptionType'])
      .where('user.id = :userId', { userId })
      .getOneOrFail();

    let readPlaces: Record<string, number> | undefined;
    let readSources: Record<string, number> | undefined;
    let readRating: Record<string, number> | undefined;
    let readLanguage: Record<string, number> | undefined;

    if (subData.subscriptionType !== SubscriptionType.Premium) {
      [readPlaces, readSources, readRating, readLanguage] = await Promise.all([
        this.getReadPlaces(userId, offset, year),
        this.getReadSource(userId, offset, year),
        this.getReadRating(userId, offset, year),
        this.getReadLanguage(userId, offset, year),
      ]);
    }

    return {
      booksPerMonth: formatBooksPerMonth(booksPerMonth),
      readDays: createReadDaysResponse(readDays),
      bookTypes,
      ...(readPlaces && { readPlaces }),
      ...(readSources && { readSources }),
      ...(readRating && { readRating }),
      ...(readLanguage && { readLanguage }),
    };
  }

  private booksPerMonthQuery(userId: number, offset: number, year: number) {
    const booksPerMonthQuery = this.bookRepository
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
      );

    return booksPerMonthQuery;
  }

  private readDaysQuery(
    userId: number,
    offset: number,
    year: number,
    startOfYearUserTime: Date,
    endOfYearUserTime: Date,
  ) {
    const readDaysQuery = this.bookSessionRepository
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
      .andWhere('session."startDate" >= :startOfYearUserTime', {
        startOfYearUserTime: new Date(
          startOfYearUserTime.getTime() - offset * 60000,
        ).toISOString(),
      })
      .andWhere('session."startDate" < :endOfYearUserTime', {
        endOfYearUserTime: new Date(
          endOfYearUserTime.getTime() - offset * 60000,
        ).toISOString(),
      })
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
      .addOrderBy('session."startDate"', 'ASC');

    return readDaysQuery;
  }

  private async getBookType(userId: number, offset: number, year: number) {
    const result = await this.getFieldStats(userId, offset, year, 'type');
    return result;
  }

  private async getReadPlaces(userId: number, offset: number, year: number) {
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

  private async getReadSource(userId: number, offset: number, year: number) {
    const result = await this.getFieldStats(userId, offset, year, 'source');
    return result;
  }

  private async getReadRating(userId: number, offset: number, year: number) {
    const result = await this.getFieldStats(userId, offset, year, 'userRating');
    return result;
  }

  private async getReadLanguage(userId: number, offset: number, year: number) {
    const result = await this.getFieldStats(userId, offset, year, 'language');
    return result;
  }

  private async getFieldStats(
    userId: number,
    offset: number,
    year: number,
    groupByField: string,
  ): Promise<Record<string | number, number>> {
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
}
