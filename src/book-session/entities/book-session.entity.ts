import { Book } from '@/book/entities/book.entity';
import { Pause } from '@/pause/entities/pause.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BookSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  currentPage: number;

  @Column()
  readingPlace: string;

  @Exclude()
  @ManyToOne(() => Book, (book) => book.bookSessions, { onDelete: 'CASCADE' })
  book: Book;

  @Exclude()
  @OneToMany(() => Pause, (pause) => pause.bookSession)
  pauses: Pause[];
}
