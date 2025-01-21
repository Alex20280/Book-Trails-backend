import { ForgetPasswordDto } from '@/auth/dto/forget-password.dto';
import { emailRegex } from '@/common/regexp';
import { lowerCaseTransformer } from '@/common/transformers/to-lower-case';
import { noSpaces } from '@/common/validators/email.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

export class UpdateEmailDto extends ForgetPasswordDto {
  @ApiProperty({ example: 'example@ex.com' })
  @Transform(lowerCaseTransformer)
  @noSpaces({ message: 'The email address cannot contain spaces' })
  @Matches(emailRegex, { message: 'Incorrect email format' })
  readonly newEmail: string;
}
