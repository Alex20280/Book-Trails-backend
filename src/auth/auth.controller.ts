import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request as req, Response } from 'express';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { UserService } from '@/user/user.service';
// import { User } from '@/user/entities/user.entity';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { LoginUserDto } from '@/user/dto/login-user.dto';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/user/entities/user.entity';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import * as responses from '../responses.json';
import { LoginCResponse } from '@/common/interfaces';

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
  @ApiCustomResponse(HttpStatus.CREATED, responses.register)
  async register(@Body() payload: CreateUserDto): Promise<User> {
    return await this.userService.create(payload);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({
    summary: 'email verification',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.verifyEmail)
  async verifyEmail(
    @Res({ passthrough: true }) response: Response,
    @Body() payload: VerifyEmailDto,
  ): Promise<{ accessToken: string }> {
    const { email, role, id, name } =
      await this.userService.verifyEmail(payload);

    const { accessToken, refreshToken } = await this.authService.generateTokens(
      email,
      role,
      id,
      name,
    );

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
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
  ): Promise<LoginCResponse> {
    const { existingUser, accessToken, refreshToken } =
      await this.authService.login(user);

    setRefreshTokenCookie(response, refreshToken);

    return { existingUser, accessToken };
  }
}
