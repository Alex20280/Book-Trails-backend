import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Exclude } from 'class-transformer';
import { Role } from '@/common/enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false, default: Role.User })
  role: Role;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isLoggedIn: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  constructor(payload?: CreateUserDto) {
    if (!payload) return;

    this.email = payload.email;

    this.name = payload.email
      .split('@')[0]
      .replace(/^\w/, (c) => c.toUpperCase());
  }
}
