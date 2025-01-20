import { AtLeastOneFieldValidator } from '@/common/validators/not-empty-object.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: Express.Multer.File;

  @Validate(AtLeastOneFieldValidator)
  atLeastOneField: boolean;
}
