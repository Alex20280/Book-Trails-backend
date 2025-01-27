import {
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { PauseService } from './pause.service';
import * as responses from '../responses.json';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import { Pause } from './entities/pause.entity';

@ApiTags('Pause')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('pause')
export class PauseController {
  constructor(private readonly pauseService: PauseService) {}

  @Post(':bookId/:bookSessionId')
  @ApiOperation({
    summary: 'pause the reading session',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.sessionPause)
  async create(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Param('bookSessionId') bookSessionId: number,
  ): Promise<Pause> {
    return this.pauseService.create({
      userId,
      bookId,
      bookSessionId,
    });
  }

  @Patch(':bookId/:bookSessionId/:pauseId')
  @ApiOperation({
    summary: 'continue the reading session',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.updatedSessionPause)
  async update(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Param('bookSessionId') bookSessionId: number,
    @Param('pauseId') pauseId: number,
  ): Promise<{ message: string }> {
    return this.pauseService.update({ userId, bookId, bookSessionId, pauseId });
  }
}
