import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { Request as req, Response } from 'express';
import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import { CreateNewPasswordDto } from '@/auth/dto/create-new-password.dto';
import { setRefreshTokenCookie } from '@/common/helpers/cookie.setter';
import { LoginCResponse } from '@/common/interfaces';
import { AuthService } from '@/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomParseFilePipe } from '@/common/pipes/image.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateEmailDto } from './dto/update-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

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
    summary: 'update profile',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiCustomResponse(HttpStatus.OK, responses.register)
  @Patch('update')
  async update(
    @UserDecorator('id') userId: number,
    @Body() payload: UpdateUserDto,
    @UploadedFile(CustomParseFilePipe)
    image: Express.Multer.File,
  ) {
    if (!image && !payload.name) {
      throw new BadRequestException();
    }
    return await this.userService.update(userId, payload, image);
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
    summary: 'change email',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.changeEmail)
  @Patch('change-email')
  async changeEmail(
    @UserDecorator('id') userId: number,
    @Body() payload: UpdateEmailDto,
  ): Promise<{ message: string }> {
    return await this.authService.changeEmail(userId, payload);
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

  @ApiOperation({
    summary: 'delete account',
  })
  // @ApiCustomResponse(HttpStatus.OK, responses.userLogout)
  @Delete('account')
  async deleteAccount(
    @UserDecorator('id') userId: number,
    @Body() payload: DeleteAccountDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refresh_token');
    return await this.userService.delete(userId, payload);
  }
}
