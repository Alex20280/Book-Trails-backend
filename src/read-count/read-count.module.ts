import { Module } from '@nestjs/common';
import { ReadCountService } from './read-count.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadCount } from './entities/read-count.entity';
import { Book } from '@/book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReadCount, Book])],
  controllers: [],
  providers: [ReadCountService],
})
export class ReadCountModule {}
