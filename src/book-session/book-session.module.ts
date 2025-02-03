import { Module } from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { BookSessionController } from './book-session.controller';
import { BookSession } from './entities/book-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import { ReviewService } from '@/review/review.service';
import { Review } from '@/review/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookSession, Book, Review])],
  controllers: [BookSessionController],
  providers: [BookSessionService, ReviewService],
})
export class BookSessionModule {}
