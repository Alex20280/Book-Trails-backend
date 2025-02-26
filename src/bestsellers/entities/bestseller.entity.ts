import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bestseller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  image: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  author: string;

  @Column()
  genre: string;
}
