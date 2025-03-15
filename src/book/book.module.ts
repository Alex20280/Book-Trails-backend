import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { BookSession } from '@/book-session/entities/book-session.entity';
import { Genre } from '@/genre/entities/genre.entity';
import { ReadCount } from '@/read-count/entities/read-count.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, User, BookSession, Genre, ReadCount]),
  ],
  controllers: [BookController],
  providers: [BookService, CloudinaryService],
})
export class BookModule {}
