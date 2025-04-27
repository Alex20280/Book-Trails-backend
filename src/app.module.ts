import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/dbconfig';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NotFoundInterceptor } from './common/interceptors';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SessionModule } from './session/session.module';
import { CronModule } from './cron/cron.module';
import { AppLoggerMiddleware } from './common/middlewares/app-logger';
import { BookModule } from './book/book.module';
import { BookSessionModule } from './book-session/book-session.module';
import { PauseModule } from './pause/pause.module';
import { ReviewModule } from './review/review.module';
import { SupportRequestModule } from './support-request/support-request.module';
import { BestsellersModule } from './bestsellers/bestsellers.module';
import { BestCategoryModule } from './best-category/best-category.module';
import { GenreModule } from './genre/genre.module';
import { ReadCountModule } from './read-count/read-count.module';
import { NotificationModule } from './notification/notification.module';
import { AchievementModule } from './achievement/achievement.module';
import { CacheModule } from '@nestjs/cache-manager';
import { NonStopReadingModule } from './non-stop-reading/non-stop-reading.module';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: configService.get<number>('REDIS_TTL') || 15,
        password: configService.get<string>('REDIS_PASSWORD'),
      }),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return dataSourceOptions(configService);
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CloudinaryModule,
    SessionModule,
    CronModule,
    BookModule,
    BookSessionModule,
    PauseModule,
    ReviewModule,
    SupportRequestModule,
    BestsellersModule,
    BestCategoryModule,
    GenreModule,
    ReadCountModule,
    NotificationModule,
    AchievementModule,
    NonStopReadingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_INTERCEPTOR,
      useClass: NotFoundInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
