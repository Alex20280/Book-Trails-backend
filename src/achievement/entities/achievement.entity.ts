import { AchievementName } from '@/common/enums/ach.enum';
import { User } from '@/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AchievementName, nullable: false })
  name: AchievementName;

  @Column()
  title: string;

  @Column()
  image: string;

  @ManyToMany(() => User, (user) => user.achievements)
  users: User[];

  constructor(payload?: Partial<Achievement>) {
    if (!payload) return;
    Object.assign(this, payload);
  }
}
