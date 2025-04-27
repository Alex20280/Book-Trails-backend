import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NonStopReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  nonStopDays: number;

  @Column()
  lastReadDate: string;

  @OneToOne(() => User, (user) => user.nonStopReading)
  @JoinColumn()
  user: User;
}
