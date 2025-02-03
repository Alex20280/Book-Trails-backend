import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Book } from '@/book/entities/book.entity';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Book)
    readonly bookRepository: Repository<Book>,
    @InjectRepository(Review)
    readonly reviewRepository: Repository<Review>,
  ) {}

  async create(payload: CreateReviewDto, manager: EntityManager) {
    return await manager.save(Review, new Review(payload));
  }
}
