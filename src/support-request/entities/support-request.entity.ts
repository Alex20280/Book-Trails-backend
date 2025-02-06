import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SupportRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userEmail: string;

  @Column()
  message: string;

  @Exclude()
  @Column()
  createdAt: string;

  @BeforeInsert()
  setCreatedAt(): void {
    this.createdAt = new Date().toISOString();
  }

  constructor(payload?: any) {
    if (!payload) return;
    this.userId = payload.userId;
    this.userEmail = payload.userEmail;
    this.message = payload.message;
  }
}
