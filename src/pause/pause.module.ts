import { Module } from '@nestjs/common';
import { PauseService } from './pause.service';
import { PauseController } from './pause.controller';
import { Pause } from './entities/pause.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSession } from '@/book-session/entities/book-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pause, BookSession])],
  controllers: [PauseController],
  providers: [PauseService],
})
export class PauseModule {}
