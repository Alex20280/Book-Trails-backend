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

  @Column({ default: false })
  isVerifyEmail: boolean;

  @Exclude()
  @Column({ nullable: true })
  emailVerificationToken: string;

  @Exclude()
  @Column({ nullable: true })
  resetPasswordCode: string;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  constructor(payload?: CreateUserDto) {
    if (!payload) return;
    this.email = payload.email;
    this.name = payload.name;
  }
}
