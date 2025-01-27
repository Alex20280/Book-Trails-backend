import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBookSessionDto {
  @ApiProperty()
  @IsNumber()
  currentPage: number;
}
