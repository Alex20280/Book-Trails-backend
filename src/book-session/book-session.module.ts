import { Module } from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { BookSessionController } from './book-session.controller';
import { BookSession } from './entities/book-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BookSession])],
  controllers: [BookSessionController],
  providers: [BookSessionService],
})
export class BookSessionModule {}
