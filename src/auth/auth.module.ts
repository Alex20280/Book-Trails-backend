import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { User } from '@/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.startegy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '@/mailer/email.service';
import { JwtStrategy } from './strategies/jwt.startegy';
import { SessionService } from '@/session/session.service';
import { Session } from '@/session/entities/session.entity';
import { RefreshJwtStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '45m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    EmailService,
    JwtStrategy,
    SessionService,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
