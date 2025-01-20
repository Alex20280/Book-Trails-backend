import { Injectable } from '@nestjs/common';
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

@Injectable()
export class CustomParseFilePipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 10 * 1024 * 1024,
          message: 'max size of image is 10mb',
        }),
        new FileTypeValidator({ fileType: /image\// }),
      ],
      fileIsRequired: false,
    });
  }
}
