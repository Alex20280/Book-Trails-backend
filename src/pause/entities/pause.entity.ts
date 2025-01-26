import { BookSession } from '@/book-session/entities/book-session.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pause {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Exclude()
  @ManyToOne(() => BookSession, (bookSession) => bookSession.pauses, {
    onDelete: 'CASCADE',
  })
  bookSession: BookSession;
}
