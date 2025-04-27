import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NonStopReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  nonStopDays: number;

  @Column({ default: null })
  lastReadDate: string;

  @OneToOne(() => User, (user) => user.nonStopReading, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
