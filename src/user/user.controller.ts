import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { Request as req, Response } from 'express';
import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import { CreateNewPasswordDto } from '@/auth/dto/create-new-password.dto';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';
import { LoginCResponse } from '@/common/interfaces';
import { AuthService } from '@/auth/auth.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'view your own profile',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.register)
  @Get('me')
  async me(@UserDecorator('id') userId: number) {
    return this.userService.me(userId);
  }

  @ApiOperation({
    summary: 'change password',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userLogin)
  @Patch('change-password')
  async changePassword(
    @Body() payload: CreateNewPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginCResponse> {
    const { loggedInUser, accessToken, refreshToken } =
      await this.authService.setNewPassword(payload);

    setRefreshTokenCookie(response, refreshToken);

    return { loggedInUser, accessToken };
  }

  @ApiOperation({
    summary: 'logout',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userLogout)
  @Patch('logout')
  async logout(
    @UserDecorator('id') userId: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refresh_token');
    return await this.userService.logout(userId);
  }
}
