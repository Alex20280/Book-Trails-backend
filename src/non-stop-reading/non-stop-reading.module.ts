import { Module } from '@nestjs/common';
import { NonStopReadingService } from './non-stop-reading.service';
import { NonStopReading } from './entities/non-stop-reading.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NonStopReading, User])],
  controllers: [],
  providers: [NonStopReadingService],
})
export class NonStopReadingModule {}
