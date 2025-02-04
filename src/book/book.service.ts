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

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
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
    console.log('status :>> ', status);
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

    return await this.getManyResponse(result);
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

      const [
        calculatedReadingTime,
        startReadingDateResult,
        endReadingDateResult,
        places,
        calculatedSinceStart,
      ] = await Promise.all([
        this.calculateReadingTime(sessions),
        this.findStartReadingDate(sessions),
        data.status === BookStatus.Read
          ? this.findEndReadingDate(sessions)
          : undefined,
        [...new Set(sessions.map((s) => s.readingPlace))],
        this.calculateSinceStart(
          await this.findStartReadingDate(sessions),
          offset,
        ),
      ]);

      readingTime = calculatedReadingTime;
      startReadingDate = startReadingDateResult;
      endReadingDate = endReadingDateResult;
      readingPlaces = places;
      sinceStart = calculatedSinceStart;
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

  private async getManyResponse(books: Book[]): Promise<BookResponse[]> {
    const response = books.map((book) => {
      const { id, title, image, author, status, pages, userRating } = book;
      const totalReadingTime = book.bookSessions?.reduce((total, session) => {
        if (
          session.startDate &&
          session.endDate &&
          book.status === BookStatus.Read
        ) {
          const start = new Date(session.startDate).getTime();
          const end = new Date(session.endDate).getTime();
          return total + (end - start);
        }
        return total;
      }, 0);

      let readPercetage: number | undefined;

      if (book.status !== BookStatus.ToRead) {
        const readPages = book.bookSessions?.length
          ? book.bookSessions.reduce(
              (max: number, session: BookSession) =>
                session.currentPage > max ? session.currentPage : max,
              0,
            )
          : 0;

        const readPerc = parseFloat((readPages / book.pages).toFixed(2)) * 100;

        readPercetage = readPerc;
      }

      return {
        id,
        title,
        image,
        author,
        status,
        pages,
        ...(userRating && { userRating }),
        ...(totalReadingTime !== 0 && { totalReadingTime }),
        ...(readPercetage !== 0 && { readPercetage }),
      };
    });

    return response;
  }

  private async calculateReadingTime(sessions: BookSession[]) {
    const { totalSessionTime, totalPauseTime } = sessions.reduce(
      (acc, session) => {
        const sessionStart = new Date(session.startDate).getTime();
        const sessionEnd = new Date(session.endDate).getTime();

        acc.totalSessionTime += sessionEnd - sessionStart;

        session.pauses.forEach((pause) => {
          const pauseStart = new Date(pause.startDate).getTime();
          const pauseEnd = new Date(pause.endDate).getTime();
          acc.totalPauseTime += pauseEnd - pauseStart;
        });

        return acc;
      },
      { totalSessionTime: 0, totalPauseTime: 0 },
    );

    return Math.round((totalSessionTime - totalPauseTime) / 60000);
  }

  private async adjustForUserTimezone(
    dateStr: string,
    offsetInMinutes: number,
  ) {
    const date = new Date(dateStr);
    const adjustedDate = new Date(date.getTime() - offsetInMinutes * 60000);
    return adjustedDate;
  }

  private async findStartReadingDate(bookSessions: BookSession[]) {
    return bookSessions.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0]?.startDate;
  }

  private async findEndReadingDate(bookSessions: BookSession[]) {
    return bookSessions.sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    )[0]?.endDate;
  }

  private async calculateSinceStart(startReadingDate: string, offset: number) {
    const now = new Date().toISOString();
    const userNowDate = await this.adjustForUserTimezone(now, offset);
    const userStartDate = await this.adjustForUserTimezone(
      startReadingDate,
      offset,
    );
    const diffInMillis = userNowDate.getTime() - userStartDate.getTime();
    return Math.floor(diffInMillis / (1000 * 3600 * 24));
  }
}
