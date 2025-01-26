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

@Module({
  imports: [
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
    UserModule,
    AuthModule,
    CloudinaryModule,
    SessionModule,
    CronModule,
    BookModule,
    BookSessionModule,
    PauseModule,
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
