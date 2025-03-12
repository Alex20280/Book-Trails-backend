import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  create(payload: CreateGenreDto) {
    return payload;
  }

  async findAll() {
    return (await this.genreRepository.find()).map((g) => g.name);
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
