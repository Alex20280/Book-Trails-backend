import { passwordRegex } from '@/common/regexp';

import { ApiProperty } from '@nestjs/swagger';

import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ForgetPasswordDto } from '../../auth/dto/forget-password.dto';

export class LoginUserDto extends ForgetPasswordDto {
  @ApiProperty({ example: '182j2nsdk' })
  @IsString()
  @Matches(passwordRegex, {
    message:
      'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  readonly password: string;
}
