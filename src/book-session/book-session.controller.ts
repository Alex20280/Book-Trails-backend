import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { CreateBookSessionDto } from './dto/create-book-session.dto';
import { UpdateBookSessionDto } from './dto/update-book-session.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { BookSession } from './entities/book-session.entity';

import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';

@ApiTags('BookSession')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('book-session')
export class BookSessionController {
  constructor(private readonly bookSessionService: BookSessionService) {}

  @Post(':bookId')
  @ApiOperation({
    summary: 'start reading session',
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.bookSession)
  async create(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Body() createDto: CreateBookSessionDto,
  ): Promise<BookSession> {
    return this.bookSessionService.create({ userId, bookId, createDto });
  }

  @Patch(':bookId/:bookSessionId')
  @ApiOperation({
    summary: 'end reading session',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.updatedBookSession)
  async update(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Param('bookSessionId') bookSessionId: number,
    @Body() updateDto: UpdateBookSessionDto,
  ): Promise<{ message: string }> {
    return await this.bookSessionService.update({
      userId,
      bookId,
      bookSessionId,
      updateDto,
    });
  }
}
