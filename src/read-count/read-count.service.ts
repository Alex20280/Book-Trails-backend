import { Injectable } from '@nestjs/common';
import { CreateReadCountDto } from './dto/create-read-count.dto';
import { ReadCount } from './entities/read-count.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReadCountService {
  constructor(
    @InjectRepository(ReadCount)
    private readCountRepository: Repository<ReadCount>,
  ) {}

  async create(payload: CreateReadCountDto) {
    return payload;
  }
}
