import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';

import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'view your own profile',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.register)
  @Get('me')
  async me(@UserDecorator('id') userId: number) {
    return this.userService.me(userId);
  }
}
