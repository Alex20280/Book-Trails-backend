import { BookStatus, BookType, Source } from '@/common/enums/book.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({ example: 234 })
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  pages?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional()
  @IsString()
  editor?: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BookStatus, example: BookStatus.ToRead })
  @IsNotEmpty()
  @IsEnum(BookStatus)
  status: BookStatus;

  @ApiProperty({ enum: BookType, example: BookType.Soft })
  @IsNotEmpty()
  @IsEnum(BookType)
  type: BookType;

  @ApiPropertyOptional({ enum: Source, example: Source.Purchased })
  @IsEnum(Source)
  @IsOptional()
  source?: Source | null | undefined;

  @ApiPropertyOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isLegacy?: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;
}
