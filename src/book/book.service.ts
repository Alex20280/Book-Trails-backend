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

  async getBooksAndReadDays(userId: number, offset: number, year: number) {
    const { startOfYearUserTime, endOfYearUserTime } = getStartEndOfYear(
      offset,
      year,
    );

    const baseQuery = await this.baseQuery(
      userId,
      offset,
      year,
      startOfYearUserTime,
      endOfYearUserTime,
    );

    const booksPerMonthQuery = baseQuery
      .select([
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM') AS readMonth`,
        `COUNT(DISTINCT book.id) AS bookCount`,
      ])
      .andWhere('book.status = :status', { status: BookStatus.Read })
      .groupBy(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM')`,
      )
      .orderBy(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM')`,
        'ASC',
      );

    const booksPerMonth = await booksPerMonthQuery.getRawMany();

    const readDaysQuery = baseQuery
      .select(
        `TO_CHAR(session."startDate"::TIMESTAMP - INTERVAL '${offset} minutes', 'YYYY-MM-DD')`,
        'readDay',
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
      .addOrderBy('session."startDate"', 'ASC');

    const readDays = await readDaysQuery.getRawMany();

    return {
      booksPerMonth: formatBooksPerMonth(booksPerMonth),
      readDays: createReadDaysResponse(readDays),
    };
  }

  private async baseQuery(
    userId: number,
    offset: number,
    year: number,
    startOfYearUserTime: Date,
    endOfYearUserTime: Date,
  ) {
    const baseQuery = this.bookSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.book', 'book')
      .innerJoin('book.user', 'user')
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
      });

    return baseQuery;
  }
}
