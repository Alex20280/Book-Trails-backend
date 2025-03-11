import { Module } from '@nestjs/common';
import { BestCategoryService } from './best-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BestCategory } from './entities/best-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BestCategory])],
  controllers: [],
  providers: [BestCategoryService],
})
export class BestCategoryModule {}
