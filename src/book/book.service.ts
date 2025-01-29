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
  ): Promise<BookResponse[]> {
    const result = await this.bookRepository
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
      .where('user.id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return await this.getManyResponse(result);
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

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }
}
