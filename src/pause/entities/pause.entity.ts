import { BookSession } from '@/book-session/entities/book-session.entity';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
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

  @Exclude()
  @ManyToOne(() => BookSession, (bookSession) => bookSession.pauses, {
    onDelete: 'CASCADE',
  })
  bookSession: BookSession;
}
