import { Injectable } from '@nestjs/common';
import { Bestseller } from './entities/bestseller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BestCategory } from '@/best-category/entities/best-category.entity';

@Injectable()
export class BestsellersService {
  constructor(
    @InjectRepository(Bestseller)
    private bestRepository: Repository<Bestseller>,
    @InjectRepository(BestCategory)
    private bestCatRepository: Repository<BestCategory>,
    readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    const [data, categories] = await Promise.all([
      this.bestRepository
        .createQueryBuilder('best')
        .select(['best.id AS id', 'best.image AS image', 'best.title AS title'])
        .getRawMany(),
      this.bestCatRepository.find(),
    ]);
    return { data, categories: categories.map((c) => c.category) };
  }

  async findOne(id: number) {
    return await this.bestRepository.findOneByOrFail({ id });
  }
}
