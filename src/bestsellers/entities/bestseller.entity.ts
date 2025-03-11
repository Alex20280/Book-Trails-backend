import { BestCategory } from 'src/best-category/entities/best-category.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
  language: string;

  @Column()
  pages: number;

  @ManyToMany(() => BestCategory, (bestCategory) => bestCategory.bestsellers)
  @JoinTable({ name: 'best_to_cat' })
  categories: Bestseller[];
}
