import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { noSpaces } from '@/common/validators/email.validator';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { emailRegex, passwordRegex } from '@/common/regexp';

export class CreateUserDto {
  @ApiProperty({ example: 'example@ex.com' })
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Transform(lowerCaseTransformer)
  @Matches(emailRegex, { message: 'Incorrect email format' })
  readonly email: string;

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
