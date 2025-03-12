import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book } from './entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { BookSession } from '@/book-session/entities/book-session.entity';
import { Genre } from '@/genre/entities/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, User, BookSession, Genre])],
  controllers: [BookController],
  providers: [BookService, CloudinaryService],
})
export class BookModule {}
