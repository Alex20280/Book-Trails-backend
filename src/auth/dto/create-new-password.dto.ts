import { emailRegex, passwordRegex } from '@/common/regexp';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { noSpaces } from '@/common/validators/email.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class CreateNewPasswordDto {
  @ApiProperty({ example: '182j2nsdk' })
  @IsString()
  @Matches(passwordRegex, {
    message:
      'the password must contain one capital letter, one digit and one special character',
  })
  @MinLength(8)
  @MaxLength(20)
  readonly newPassword: string;

  @ApiProperty({ example: 'example@ex.com' })
  @Transform(lowerCaseTransformer)
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Matches(emailRegex, { message: 'Incorrect email format' })
  readonly email: string;
}
