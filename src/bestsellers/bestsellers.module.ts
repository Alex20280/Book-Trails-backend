import { Module } from '@nestjs/common';
import { BestsellersService } from './bestsellers.service';
import { BestsellersController } from './bestsellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bestseller } from './entities/bestseller.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bestseller])],
  controllers: [BestsellersController],
  providers: [BestsellersService, CloudinaryService],
})
export class BestsellersModule {}
