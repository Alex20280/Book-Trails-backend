import { passwordRegex } from '@/common/regexp';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';

export class SetNewPasswordDto extends VerifyEmailDto {
  @ApiProperty({ example: '182j2nsdk' })
  @IsString()
  @Matches(passwordRegex, {
    message:
      'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  readonly newPassword: string;
}
