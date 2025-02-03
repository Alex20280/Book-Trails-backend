import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';

import { Review } from './entities/review.entity';
import { Book } from '@/book/entities/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Review])],
  controllers: [],
  providers: [ReviewService],
})
export class ReviewModule {}
