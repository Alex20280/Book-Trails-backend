import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Genre } from '@/genre/entities/genre.entity';
import { genres } from './genres';

@Injectable()
export class GenreSeedService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  async run() {
    const count = await this.genreRepository.count();
    if (count === 0) {
      await Promise.all(
        genres.map(async (genre) => {
          const newGenre = this.genreRepository.create({
            name: genre.toLowerCase().trim(),
          });
          await this.genreRepository.save(newGenre);
        }),
      );
    }
  }
}
