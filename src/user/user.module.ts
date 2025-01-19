import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '@/mailer/email.service';
import { SessionService } from '@/session/session.service';
import { Session } from '@/session/entities/session.entity';
import { AuthService } from '@/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [UserController],
  providers: [
    UserService,
    EmailService,
    SessionService,
    AuthService,
    JwtService,
  ],
})
export class UserModule {}
