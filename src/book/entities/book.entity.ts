import { BookStatus, Source } from '@/common/enums/book.enum';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CreateBookDto } from '../dto/create-book.dto';
import { Exclude } from 'class-transformer';

@Entity()
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

  @Column({ default: false })
  isLegacy: boolean;

  @Column({ nullable: true })
  image: string;

  @Exclude()
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  user: User;

  constructor(payload?: CreateBookDto) {
    if (!payload) return;
    Object.assign(this, payload);
  }
}
