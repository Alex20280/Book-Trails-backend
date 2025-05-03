import { emailRegex, passwordRegex } from '@/common/regexp';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { noSpaces } from '@/common/validators/email.validator';

export class SetNewPasswordDto {
  @ApiProperty({ example: 'example@ex.com' })
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Transform(lowerCaseTransformer)
  @Matches(emailRegex, { message: 'Incorrect email format' })
  readonly email: string;

  @ApiProperty({ example: '2344' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty({ example: '182j2nsdk' })
  @IsString()
  @Matches(passwordRegex, {
    message: 'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  readonly newPassword: string;
}
