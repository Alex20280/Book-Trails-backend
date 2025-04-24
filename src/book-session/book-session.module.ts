import { Module } from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { BookSessionController } from './book-session.controller';
import { BookSession } from './entities/book-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '@/book/entities/book.entity';
import { ReviewService } from '@/review/review.service';
import { Review } from '@/review/entities/review.entity';
import { User } from '@/user/entities/user.entity';
import { NotificationService } from '@/notification/notification.service';
import { ReadCount } from '@/read-count/entities/read-count.entity';
import { Achievement } from '@/achievement/entities/achievement.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([BookSession, Book, Review, User, ReadCount, Achievement])],
  controllers: [BookSessionController],
  providers: [BookSessionService, ReviewService, NotificationService],
})
export class BookSessionModule {}
