import { emailRegex } from '@/common/regexp';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { noSpaces } from '@/common/validators/email.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'example@ex.com' })
  @Transform(lowerCaseTransformer)
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Matches(emailRegex, { message: 'Incorrect email format' })
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}
