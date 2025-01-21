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

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { LocalAuthGuard } from './guards/local.auth.guard';

import { UserDecorator } from '@/common/decorators/user.decorator';
import { User } from '@/user/entities/user.entity';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import * as responses from '../responses.json';
import { LoginCResponse, Tokens } from '@/common/interfaces';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { LoginUserDto } from '@/user/dto/login-user.dto';
import { ForgetPasswordDto } from '@/auth/dto/forget-password.dto';
import { SetNewPasswordDto } from './dto/set-new-passwor.dto';
import {
  GoogleLoginDto,
  VerifyEmailDto,
  VerifyGoogleMobileIdTokenDto,
} from './dto';
import { DeepPartial } from 'typeorm';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'user registration',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.register)
  async register(@Body() payload: CreateUserDto): Promise<User> {
    return await this.authService.createUser(payload);
  }

  @Public()
  @Patch('verify-email')
  @ApiOperation({
    summary: 'email verification',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.accessToken)
  async verifyEmail(
    @Res({ passthrough: true }) response: Response,
    @Body() payload: VerifyEmailDto,
  ): Promise<DeepPartial<Tokens>> {
    const { accessToken, refreshToken } =
      await this.authService.verifyUserEmail(payload);

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
    const { loggedInUser, accessToken, refreshToken } =
      await this.authService.login(user);

    setRefreshTokenCookie(response, refreshToken);

    return { loggedInUser, accessToken };
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
    summary: 'set new password',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.userLogin)
  @Patch('set-new-password')
  async setNewPassword(
    @Body() payload: SetNewPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginCResponse> {
    const { loggedInUser, accessToken, refreshToken } =
      await this.authService.setNewPassword(payload);

    setRefreshTokenCookie(response, refreshToken);

    return { loggedInUser, accessToken };
  }

  @Post('verify-google-mobile-id-token')
  @ApiOperation({
    summary: 'verify google user id token and if token validate authorize user',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.googleToken)
  @ApiCustomResponse(HttpStatus.OK, responses.googleToken)
  async verifyGoogleMobileIdToken(
    @Body() payload: VerifyGoogleMobileIdTokenDto,
  ) {
    return await this.authService.verifyGoogleMobileIdToken(payload.token);
  }

  @Public()
  @Post('google/login')
  @ApiOperation({
    summary: 'login after choosing google account',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.accessToken)
  async googleLogin(
    @Body() payload: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } =
      await this.authService.googleLogin(payload);

    setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }
}
