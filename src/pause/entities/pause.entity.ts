import { BookSession } from '@/book-session/entities/book-session.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('IDX_PAUSE_BOOKSESSION', ['bookSession'])
export class Pause {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column({ nullable: true, default: null })
  endDate: Date;

  @Exclude()
  @ManyToOne(() => BookSession, (bookSession) => bookSession.pauses, {
    onDelete: 'CASCADE',
  })
  bookSession: BookSession;
}
