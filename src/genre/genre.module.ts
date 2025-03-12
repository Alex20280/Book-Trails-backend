import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Book } from '@/book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Book])],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}
