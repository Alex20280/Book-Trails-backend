import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyGoogleMobileIdTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
