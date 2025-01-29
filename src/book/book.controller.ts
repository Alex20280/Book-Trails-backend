import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CustomParseFilePipe } from '@/common/pipes/image.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { Book } from './entities/book.entity';
import { BookResponse } from '@/common/interfaces/book.interfces';
import { ApiCustomResponse } from '@/common/helpers/api-custom-response';

import * as responses from '../responses.json';
import { BookStatus } from '@/common/enums/book.enum';

@ApiTags('Book')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({
    summary: 'add new book',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiCustomResponse(HttpStatus.CREATED, responses.createBook)
  @Post()
  async create(
    @UserDecorator('id') userId: number,
    @Body() createBookDto: CreateBookDto,
    @UploadedFile(CustomParseFilePipe)
    image: Express.Multer.File,
  ): Promise<Book> {
    return this.bookService.create(userId, createBookDto, image);
  }

  @ApiOperation({
    summary: 'return user`s books',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookStatus,
    example: BookStatus.Reading,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiCustomResponse(HttpStatus.OK, responses.bookList)
  @Get()
  async findAll(
    @UserDecorator('id') userId: number,
    @Query('page', new ParseIntPipe()) page = 1,
    @Query('limit', new ParseIntPipe()) limit = 10,

    @Query('status') status: BookStatus,
  ): Promise<BookResponse[]> {
    return this.bookService.findAll(userId, page, limit, status);
  }

  @ApiOperation({
    summary: 'view one user`s book',
  })
  @ApiCustomResponse(HttpStatus.OK, responses.getOneBook)
  @Get(':id')
  async findOne(
    @UserDecorator('id') userId: number,
    @Param('id') id: number,
    @Query('offset') offset: number,
  ) {
    return await this.bookService.findOne(userId, id, offset);
  }
}
