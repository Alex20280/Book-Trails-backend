import { Book } from '@/book/entities/book.entity';
import { Pause } from '@/pause/entities/pause.entity';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReadingPlace } from '@/common/enums/book.enum';

@Entity()
@Index('IDX_BOOKSESSION_BOOK', ['book'])
@Index('IDX_BOOKSESSION_STARTDATE', ['startDate'])
@Index('IDX_BOOKSESSION_ENDDATE', ['endDate'])
export class BookSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: string;

  @Column({ nullable: true, default: null })
  endDate: string;

  @BeforeInsert()
  setCreatedAt(): void {
    this.startDate = new Date().toISOString();
  }

  @Column({ nullable: true, default: null })
  currentPage: number;

  @Column()
  readingPlace: string;

  @Exclude()
  @ManyToOne(() => Book, (book) => book.bookSessions, { onDelete: 'CASCADE' })
  book: Book;

  // @Exclude()
  @OneToMany(() => Pause, (pause) => pause.bookSession, {
    eager: true,
  })
  pauses: Pause[];

  constructor(payload: { readingPlace: ReadingPlace }) {
    if (!payload) return;

    this.readingPlace = payload.readingPlace;
  }
}
