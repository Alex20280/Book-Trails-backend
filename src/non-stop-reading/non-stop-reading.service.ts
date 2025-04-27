import { Injectable } from '@nestjs/common';
import { CreateNonStopReadingDto } from './dto/create-non-stop-reading.dto';
import { UpdateNonStopReadingDto } from './dto/update-non-stop-reading.dto';
import { NonStopReading } from './entities/non-stop-reading.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { differenceInDays } from 'date-fns';
import { calculateDaysDifference } from '@/common/helpers/calc.diff.days';

@Injectable()
export class NonStopReadingService {
  constructor(
    @InjectRepository(NonStopReading)
    readonly nonStopRepository: Repository<NonStopReading>,
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
  ) {}

  async nonStopManipulation(user: User, sessionStartDate: string) {
    let nonStopThirtyDays = false;

    const nonStopReading = await this.nonStopRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!nonStopReading) {
      await this.nonStopRepository.save({
        user,
        nonStopDays: 1,
        lastReadDate: sessionStartDate,
      });
      return;
    }

    const daysDifference = calculateDaysDifference(
      sessionStartDate.split('T')[0],
      nonStopReading.lastReadDate.split('T')[0],
    );

    if (daysDifference > 1) {
      nonStopReading.lastReadDate = sessionStartDate;
      nonStopReading.nonStopDays = 1;
    } else if (daysDifference === 1) {
      nonStopReading.lastReadDate = sessionStartDate;
      nonStopReading.nonStopDays += 1;

      if (nonStopReading.nonStopDays === 30) {
        nonStopThirtyDays = true;
      }
    } else {
      return nonStopThirtyDays;
    }

    await this.nonStopRepository.save(nonStopReading);
    return nonStopThirtyDays;
  }
}
