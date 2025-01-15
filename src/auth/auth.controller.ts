import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request as req, Response } from 'express';

import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { UserService } from '@/user/user.service';
import { LocalAuthGuard } from './guards/local.auth.guard';

import { UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/user/entities/user.entity';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import * as responses from '../responses.json';
import { LoginCResponse } from '@/common/interfaces';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { LoginUserDto } from '@/auth/dto/login-user.dto';
import { ForgetPasswordDto } from '@/auth/dto/forget-password.dto';
import { SetNewPasswordDto } from './dto/set-new-passwor.dto';
// import { JwtAuthGuard } from './guards/jwt.auth.guard';

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
  @Patch('verify-email')
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
  @ApiCustomResponse(HttpStatus.OK, responses.userLogin)
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

  @Public()
  @ApiOperation({
    summary: 'send code to email for reset password',
  })
  @Patch('forget-password')
  async forgetPassword(@Body() payload: ForgetPasswordDto): Promise<boolean> {
    return await this.authService.forgetPassword(payload.email);
  }

  @Public()
  @ApiOperation({
    summary: 'send code to email for reset password',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userLogin)
  @Patch('set-new-password')
  async setNewPassword(
    @Body() payload: SetNewPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginCResponse> {
    const { existingUser, accessToken, refreshToken } =
      await this.authService.setNewPassword(payload);

    setRefreshTokenCookie(response, refreshToken);

    return { existingUser, accessToken };
  }
}
