import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request as req, Response } from 'express';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { UserService } from '@/user/user.service';
// import { User } from '@/user/entities/user.entity';
import { LocalAuthGuard } from './quards/local.auth.guard';
import { LoginUserDto } from '@/user/dto/login-user.dto';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/user/entities/user.entity';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'user registration',
  })
  // @ApiCustomResponse(HttpStatus.CREATED, responses.userRegisterResponse)
  async register(@Body() payload: CreateUserDto) {
    return await this.userService.create(payload);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @ApiBody({ type: LoginUserDto })
  @ApiOperation({
    summary: 'user login',
  })
  @Post('login')
  async login(
    @UserDecorator() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { existingUser, accessToken, refreshToken } =
      await this.authService.login(user);

    setRefreshTokenCookie(response, refreshToken);

    return { existingUser, accessToken };
  }
}
