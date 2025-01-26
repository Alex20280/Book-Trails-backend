import { Injectable } from '@nestjs/common';
import { CreatePauseDto } from './dto/create-pause.dto';
import { UpdatePauseDto } from './dto/update-pause.dto';

@Injectable()
export class PauseService {
  create(createPauseDto: CreatePauseDto) {
    return 'This action adds a new pause';
  }

  findAll() {
    return `This action returns all pause`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pause`;
  }

  update(id: number, updatePauseDto: UpdatePauseDto) {
    return `This action updates a #${id} pause`;
  }

  remove(id: number) {
    return `This action removes a #${id} pause`;
  }
}
