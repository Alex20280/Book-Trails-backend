import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BestsellersService } from './bestsellers.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadFileDto } from './dto/update-bestseller.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/user.enum';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('bestsellers')
export class BestsellersController {
  constructor(private readonly bestsellersService: BestsellersService) {}

  @Get()
  findAll() {
    return this.bestsellersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bestsellersService.findOne(+id);
  }

  @Patch('files')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(
    @Body() body: UploadFileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Received files:', files);
    console.log('Received keywords:', body);

    // return await this.bestsellersService.updateMany(body, files);
  }
}
