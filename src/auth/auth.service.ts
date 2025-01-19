import { LoginSResponse, Tokens } from '@/common/interfaces';
import { User } from '@/user/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SetNewPasswordDto } from './dto/set-new-passwor.dto';
import { CreateNewPasswordDto } from './dto/create-new-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Session } from '@/session/entities/session.entity';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { randomBytes } from 'crypto';
import { EmailService } from '@/mailer/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async createUser(payload: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({
      email: payload.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new User(payload);
    const token = randomBytes(2).toString('hex');

    newUser.password = await bcrypt.hash(payload.password, 10);
    newUser.emailVerificationToken = token;

    await this.emailService.sendEmail(payload.email, token, false);

    return await this.userRepository.save(newUser);
  }

  async verifyUserEmail(payload: VerifyEmailDto): Promise<LoginSResponse> {
    const { email, code } = payload;
    try {
      const user = await this.userRepository.findOneBy({
        email,
        emailVerificationToken: code,
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      user.isVerifyEmail = true;
      user.emailVerificationToken = null;

      return await this.login(user);
    } catch (error) {
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByParams({
      email,
    });

    if (!user.password) {
      throw new BadRequestException('You must set a password for your account');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async findOneByParams(
    params: Record<string, string | number | boolean>,
    relations?: string[],
  ): Promise<User> {
    const queryOptions: FindOneOptions<User> = {
      where: params,
      relations: relations,
    };

    const user = await this.userRepository.findOneOrFail(queryOptions);

    return user;
  }

  async login(user: User): Promise<LoginSResponse> {
    user.isLoggedIn = true;
    const loggedInUser = await this.userRepository.save(user);

    const newSession = new Session();
    newSession.user = loggedInUser;
    const createdSession = await this.sessionRepository.save(newSession);

    const { accessToken, refreshToken } = await this.generateTokens(
      loggedInUser.email,
      loggedInUser.role,
      loggedInUser.id,
      loggedInUser.name,
      createdSession.id,
    );

    return { loggedInUser, accessToken, refreshToken };
  }

  async forgetPassword(email: string) {
    const user = await this.findOneByParams({ email });
    const code = randomBytes(2).toString('hex');

    user.resetPasswordCode = code;

    await this.userRepository.save(user);
    await this.emailService.sendEmail(email, code, true);
    return true;
  }

  async setNewPassword(
    payload: SetNewPasswordDto | CreateNewPasswordDto,
  ): Promise<LoginSResponse> {
    try {
      let user: User;
      let password: string;

      if ('code' in payload) {
        const { email, newPassword, code } = payload as SetNewPasswordDto;

        user = await this.userRepository.findOneBy({
          email,
          resetPasswordCode: code,
        });

        if (!user) {
          throw new BadRequestException('Invalid reset code');
        }

        user.resetPasswordCode = null;
        password = newPassword;
      } else {
        const { email, newPassword } = payload as CreateNewPasswordDto;

        user = await this.userRepository.findOneBy({ email });
        if (!user) {
          throw new BadRequestException('User not found');
        }
        password = newPassword;
      }

      user.password = await bcrypt.hash(password, 10);
      const savedUser = await this.userRepository.save(user);
      return await this.login(savedUser);
    } catch (error) {
      throw error;
    }
  }

  async generateTokens(
    email: string,
    role: string,
    id: number,
    name: string,
    sessionId?: number,
  ): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync({
        email: email,
        role: role,
        sub: id,
        sessionId,
      }),

      await this.jwtService.signAsync(
        {
          email: email,
          role: role,
          sub: id,
          name: name,
          sessionId,
        },
        {
          expiresIn: '7d',
          secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
