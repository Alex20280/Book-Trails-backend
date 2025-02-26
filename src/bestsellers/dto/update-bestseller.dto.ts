import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'List of image files to upload',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  images: Express.Multer.File[];

  @ApiProperty({
    example: ['Harry Potter', 'The Hobbit'],
    description: 'List of keywords',
  })
  @IsNotEmpty()
  keywords: string[];
}
