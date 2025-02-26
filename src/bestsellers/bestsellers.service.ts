import { Injectable } from '@nestjs/common';
import { Bestseller } from './entities/bestseller.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFileDto } from './dto/update-bestseller.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BestsellersService {
  constructor(
    @InjectRepository(Bestseller)
    private bestRepository: Repository<Bestseller>,
    readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    return await this.bestRepository.find();
  }

  async findOne(id: number) {
    return `This action returns a #${id} bestseller`;
  }

  async updateMany(body: UploadFileDto, images: Express.Multer.File[]) {
    const { keywords } = body;

    if (images.length !== keywords.length) {
      throw new Error('The number of images and keywords must be the same');
    }

    const updateResults = await Promise.all(
      images.map(async (image, index) => {
        const { secure_url } = await this.cloudinaryService.uploadFile(image);
        const keyword = keywords[index];

        const result = await this.bestRepository
          .createQueryBuilder()
          .update(Bestseller)
          .set({
            image: secure_url,
          })
          .where('LOWER(title) LIKE LOWER(:keyword)', {
            keyword: `%${keyword.toLowerCase()}%`,
          })
          .execute();

        return result;
      }),
    );

    return { message: 'Books successfully updated', updateResults };
  }
}
