import { Bestseller } from 'src/bestsellers/entities/bestseller.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class BestCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @ManyToMany(() => Bestseller, (bestseller) => bestseller.categories)
  @JoinTable({ name: 'best_to_cat' })
  bestsellers: Bestseller[];
}
