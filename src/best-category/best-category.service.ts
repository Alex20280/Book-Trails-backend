import { Injectable } from '@nestjs/common';
import { CreateBestCategoryDto } from './dto/create-best-category.dto';

@Injectable()
export class BestCategoryService {
  create(payload: CreateBestCategoryDto) {
    return payload;
  }
}
