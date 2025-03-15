import { Book } from '@/book/entities/book.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ReadCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  readDate: string;

  @Column()
  userRating: number;

  @Exclude()
  @ManyToOne(() => Book, (book) => book.readCount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}
