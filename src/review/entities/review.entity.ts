import { Book } from '@/book/entities/book.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CreateReviewDto } from '../dto/create-review.dto';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => Book, (book) => book.reviews, { onDelete: 'CASCADE' })
  book: Book;

  constructor(payload?: CreateReviewDto | { text: string }) {
    if (!payload) return;
    this.text = payload.text;
  }
}
