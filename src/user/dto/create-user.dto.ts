import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LoginUserDto } from '../../auth/dto/login-user.dto';

export class CreateUserDto extends LoginUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
