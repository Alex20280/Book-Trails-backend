import { BookStatus, BookType, Language, Source } from '@/common/enums/book.enum';
import { User } from '@/user/entities/user.entity';
import {
  Column,
  DeepPartial,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateBookDto } from '../dto/create-book.dto';
import { Exclude } from 'class-transformer';
import { BookSession } from '@/book-session/entities/book-session.entity';
import { Review } from '@/review/entities/review.entity';
import { Genre } from '@/genre/entities/genre.entity';
import { ReadCount } from '@/read-count/entities/read-count.entity';

@Entity()
@Index('IDX_BOOK_USER', ['user'])
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  pages: number;

  @Column({ type: 'enum', enum: Language, nullable: false })
  language: Language;

  @Column({ nullable: true })
  editor: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: BookStatus,
    nullable: false,
    default: BookStatus.ToRead,
  })
  status: BookStatus;

  @Column({
    type: 'enum',
    enum: Source,
    nullable: true,
    default: null,
  })
  source: Source;

  @Column({
    type: 'enum',
    enum: BookType,
    default: BookType.Soft,
  })
  type: BookType;

  @Column({ default: false })
  isLegacy: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, default: null })
  userRating: number;

  @Column({ nullable: true, default: null })
  endDate: string;

  @Exclude()
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  user: User;

  // @Exclude()
  @OneToMany(() => BookSession, (bookSession) => bookSession.book, {
    eager: true,
  })
  bookSessions: BookSession[];

  @ManyToMany(() => Genre, (genre) => genre.books, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'book_to_genre' })
  genres: Genre[];

  @OneToMany(() => Review, (review) => review.book, { eager: true })
  reviews: Review[];

  @Exclude()
  @OneToMany(() => ReadCount, (readCount) => readCount.book, { eager: true })
  readCount: ReadCount[];

  constructor(payload?: DeepPartial<CreateBookDto>) {
    if (!payload) return;
    Object.assign(this, payload);
  }
}
