import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '@/mailer/email.service';
import { SessionService } from '@/session/session.service';
import { Session } from '@/session/entities/session.entity';
import { AuthService } from '@/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '45m' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    EmailService,
    SessionService,
    AuthService,
    CloudinaryService,
  ],
})
export class UserModule {}
