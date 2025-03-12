import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { dataSourceOptions } from '@/db/dbconfig';
import { AdminSeedService } from './admin.seed.service';
import { User } from '@/user/entities/user.entity';
import { Genre } from '@/genre/entities/genre.entity';
import { GenreSeedService } from './genre/genre.seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Genre]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return dataSourceOptions(configService);
      },
      inject: [ConfigService],
    }),
    CloudinaryModule,
  ],
  providers: [AdminSeedService, GenreSeedService],
})
export class SeedModule {}
