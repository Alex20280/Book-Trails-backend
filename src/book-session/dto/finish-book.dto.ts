import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateBookSessionDto } from './update-book-session.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FinishBookDto extends PartialType(UpdateBookSessionDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stars?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  review?: string;
}
