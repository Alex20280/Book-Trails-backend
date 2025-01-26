import { Injectable } from '@nestjs/common';
import { CreateBookSessionDto } from './dto/create-book-session.dto';
import { UpdateBookSessionDto } from './dto/update-book-session.dto';

@Injectable()
export class BookSessionService {
  async create(payload: CreateBookSessionDto) {
    return 'This action adds a new bookSession';
  }

  async findAll() {
    return `This action returns all bookSession`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} bookSession`;
  }

  async update(id: number, payload: UpdateBookSessionDto) {
    return `This action updates a #${id} bookSession`;
  }

  async remove(id: number) {
    return `This action removes a #${id} bookSession`;
  }
}
