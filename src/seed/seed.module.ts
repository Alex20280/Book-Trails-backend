import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { dataSourceOptions } from '@/db/dbconfig';
import { AdminSeedService } from './admin.seed.service';
import { User } from '@/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [AdminSeedService],
})
export class SeedModule {}
