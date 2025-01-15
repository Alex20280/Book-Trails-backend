import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { noSpaces } from '@/common/validators/email.validator';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { emailRegex } from '@/common/regexp';

export class VerifyEmailDto {
  @ApiProperty({ example: 'example@ex.com' })
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Transform(lowerCaseTransformer)
  @Matches(emailRegex, { message: 'Incorrect email format' })
  readonly email: string;

  @ApiProperty({ example: '2344' })
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
