import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Exclude } from 'class-transformer';
import { Role, SubscriptionType } from '@/common/enums/user.enum';
import { Session } from '@/session/entities/session.entity';
import { Book } from '@/book/entities/book.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Role, nullable: false, default: Role.User })
  role: Role;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    nullable: false,
    default: SubscriptionType.Basic,
  })
  subscriptionType: SubscriptionType;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  googleToken: string;

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
  @Column()
  createdAt: string;

  @Exclude()
  @Column()
  updatedAt: string;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  @BeforeUpdate()
  setUpdatedAt(): void {
    this.updatedAt = new Date().toISOString();
  }

  @OneToMany(() => Session, (session) => session.user, { eager: true })
  @JoinColumn({ name: 'userId' })
  sessions: Session[];

  @OneToMany(() => Book, (book) => book.user)
  books: Book[];

  constructor(payload?: CreateUserDto) {
    if (!payload) return;
    this.email = payload.email;
    this.name = payload.name;
  }
}
