import { Book } from '@/book/entities/book.entity';
import { Pause } from '@/pause/entities/pause.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateBookSessionDto } from '../dto/create-book-session.dto';

@Entity()
@Index('IDX_BOOKSESSION_BOOK', ['book'])
export class BookSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column({ nullable: true, default: null })
  endDate: Date;

  @Column({ nullable: true, default: null })
  currentPage: number;

  @Column()
  readingPlace: string;

  @Exclude()
  @ManyToOne(() => Book, (book) => book.bookSessions, { onDelete: 'CASCADE' })
  book: Book;

  @Exclude()
  @OneToMany(() => Pause, (pause) => pause.bookSession)
  pauses: Pause[];

  constructor(payload: CreateBookSessionDto) {
    if (!payload) return;

    if (payload instanceof CreateBookSessionDto) {
      this.readingPlace = payload.readingPlace;
    }
  }
}
