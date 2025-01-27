import { ReadingPlace } from '@/common/enums/book-session.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateBookSessionDto {
  @ApiProperty({
    enum: ReadingPlace,
  })
  @IsEnum(ReadingPlace)
  readingPlace: ReadingPlace;
}
