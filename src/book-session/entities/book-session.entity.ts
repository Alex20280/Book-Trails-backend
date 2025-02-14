import { Book } from '@/book/entities/book.entity';
import { Pause } from '@/pause/entities/pause.entity';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
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

  @BeforeUpdate()
  setUpdatedAt(): void {
    this.endDate = new Date().toISOString();
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

  constructor(payload: CreateBookSessionDto) {
    if (!payload) return;

    if (payload instanceof CreateBookSessionDto) {
      this.readingPlace = payload.readingPlace;
    }
  }
}
