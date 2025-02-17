import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BookSessionService } from './book-session.service';
import { UpdateBookSessionDto } from './dto/update-book-session.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { BookSession } from './entities/book-session.entity';

import * as responses from '../responses.json';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';
import { FinishBookDto } from './dto/finish-book.dto';
import { ReadingPlace } from '@/common/enums/book.enum';

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
  @ApiQuery({
    name: 'readingPlace',
    required: true,
    enum: ReadingPlace,
  })
  @ApiCustomResponse(HttpStatus.CREATED, responses.bookSession)
  async create(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Query('readingPlace') readingPlace: ReadingPlace,
  ): Promise<BookSession> {
    return this.bookSessionService.create({ userId, bookId, readingPlace });
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
  @Patch('finish-the-book/:bookId/:bookSessionId')
  @ApiOperation({
    summary: 'finished the book',
  })
  // @ApiCustomResponse(HttpStatus.OK, responses.updatedBookSession)
  async finishTheBook(
    @UserDecorator('id') userId: number,
    @Param('bookId') bookId: number,
    @Param('bookSessionId') bookSessionId: number,
    @Body() finishDto: FinishBookDto,
  ) {
    return await this.bookSessionService.finishTheBook({
      userId,
      bookId,
      bookSessionId,
      finishDto,
    });
  }
}
