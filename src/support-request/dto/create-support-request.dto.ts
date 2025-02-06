import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupportRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}
