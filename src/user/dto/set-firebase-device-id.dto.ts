import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetFirebaseDeviceIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly fireBaseDeviceId: string;
}
