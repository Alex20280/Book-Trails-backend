import { Module } from '@nestjs/common';
import { BestsellersService } from './bestsellers.service';
import { BestsellersController } from './bestsellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bestseller } from './entities/bestseller.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { BestCategory } from '@/best-category/entities/best-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bestseller, BestCategory])],
  controllers: [BestsellersController],
  providers: [BestsellersService, CloudinaryService],
})
export class BestsellersModule {}
