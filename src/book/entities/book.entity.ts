import { BookStatus, BookType, Source } from '@/common/enums/book.enum';
import { User } from '@/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateBookDto } from '../dto/create-book.dto';
import { Exclude } from 'class-transformer';
import { BookSession } from '@/book-session/entities/book-session.entity';

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

  @Column()
  genre: string;

  @Column()
  language: string;

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
  type: Source;

  @Column({ default: false })
  isLegacy: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, default: null })
  userRating: number;

  @Exclude()
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  user: User;

  // @Exclude()
  @OneToMany(() => BookSession, (bookSession) => bookSession.book, {
    eager: true,
  })
  bookSessions: BookSession[];

  constructor(payload?: CreateBookDto) {
    if (!payload) return;
    Object.assign(this, payload);
  }
}
