import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  async findAll() {
    return this.genreService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.genreService.remove(+id);
  }
}
