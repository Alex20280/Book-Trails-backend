import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { CreateBookSessionDto } from './dto/create-book-session.dto';
import { UpdateBookSessionDto } from './dto/update-book-session.dto';

@Controller('book-session')
export class BookSessionController {
  constructor(private readonly bookSessionService: BookSessionService) {}

  @Post()
  create(@Body() createBookSessionDto: CreateBookSessionDto) {
    return this.bookSessionService.create(createBookSessionDto);
  }

  @Get()
  findAll() {
    return this.bookSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookSessionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookSessionDto: UpdateBookSessionDto,
  ) {
    return this.bookSessionService.update(+id, updateBookSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookSessionService.remove(+id);
  }
}
