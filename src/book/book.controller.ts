import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CustomParseFilePipe } from '@/common/pipes/image.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { UserDecorator } from '@/common/decorators/user.decorator';
import { Book } from './entities/book.entity';

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
  @Get()
  async findAll(@UserDecorator('id') userId: number) {
    // : Promise<Book[]>
    return this.bookService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }
}
