import { InTokensGenerate, SLoginResponse, Tokens } from '@/common/interfaces';
import { User } from '@/user/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SetNewPasswordDto } from './dto/set-new-passwor.dto';
import { CreateNewPasswordDto } from './dto/create-new-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { Session } from '@/session/entities/session.entity';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { randomBytes } from 'crypto';
import { EmailService } from '@/mailer/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleLoginDto } from './dto';
import { UpdateEmailDto } from '@/user/dto/update-email.dto';
import { SessionService } from '@/session/session.service';

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    readonly jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    readonly sessionService: SessionService,
    private readonly dataSource: DataSource,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

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

  async verifyUserEmail(payload: VerifyEmailDto): Promise<Tokens> {
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
      const { accessToken, refreshToken } = await this.login(user);
      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async login(user: User): Promise<SLoginResponse> {
    user.isLoggedIn = true;

    const newSession = new Session();
    const createdSession = await this.sessionRepository.save(newSession);

    user.sessions.push(createdSession);
    const loggedInUser = await this.userRepository.save(user);

    const payload: InTokensGenerate = {
      email: loggedInUser.email,
      role: loggedInUser.role,
      id: loggedInUser.id,
      name: loggedInUser.name,
      sessionId: createdSession.id,
    };
    const { accessToken, refreshToken } = await this.generateTokens(payload);

    return { loggedInUser, accessToken, refreshToken };
  }

  async logout(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });
    user.isLoggedIn = false;

    const loggedOutUser = await this.userRepository.save(user);
    await this.sessionService.closeSession(id);

    return { message: 'Logout successful', userId: loggedOutUser.id };
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

  public async verifyGoogleMobileIdToken(token: string) {
    const client = new OAuth2Client();
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_MOBILE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      const { email, name, picture } = payload;
      const { savedUser: user } = await this.findOrCreateFromGoogle({
        email,
        username: name,
        picture,
      });

      return { googleToken: user.googleToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error('Error verifying Google ID token: ', error);
        throw new InternalServerErrorException('An unexpected error occurred.');
      }
    }
  }

  async googleLogin(payload: GoogleLoginDto) {
    try {
      const { googleToken } = payload;
      const user = await this.findOneByParams({ googleToken });

      user.googleToken = null;
      user.isLoggedIn = true;

      const loggedInUser = await this.userRepository.save(user);

      const newSession = new Session();
      newSession.user = loggedInUser;
      const createdSession = await this.sessionRepository.save(newSession);

      const { email, role, id, name } = loggedInUser;

      const tokensPayload: InTokensGenerate = {
        email,
        role,
        id,
        name,
        sessionId: createdSession.id,
      };

      const { accessToken, refreshToken } =
        await this.generateTokens(tokensPayload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async forgetPassword(email: string): Promise<boolean> {
    const user = await this.findOneByParams({ email });
    const code = randomBytes(2).toString('hex');

    user.resetPasswordCode = code;

    await this.userRepository.save(user);
    await this.emailService.sendEmail(email, code, true);
    return true;
  }

  async setNewPassword(
    payload: SetNewPasswordDto | CreateNewPasswordDto,
  ): Promise<SLoginResponse> {
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

      await this.sessionRepository.delete({
        user: { id: user.id },
      });

      return await this.login(savedUser);
    } catch (error) {
      throw error;
    }
  }

  async changeEmail(
    id: number,
    payload: UpdateEmailDto,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneByOrFail(User, {
        id,
        email: payload.email,
      });

      const token = randomBytes(2).toString('hex');
      await this.emailService.sendEmail(payload.newEmail, token, false);

      user.emailVerificationToken = token;
      user.email = payload.newEmail;
      user.isVerifyEmail = false;
      user.isLoggedIn = false;

      await queryRunner.manager.save(user);

      await queryRunner.manager.delete(Session, {
        user: { id: user.id },
      });

      await queryRunner.commitTransaction();

      return {
        message: 'A confirmation code has been sent to your new email address.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generateTokens(payload: InTokensGenerate): Promise<Tokens> {
    const { email, role, id, name, sessionId } = payload;
    const tokenPayload = { email, role, sub: id, sessionId };

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(tokenPayload),

      await this.jwtService.signAsync(
        {
          ...tokenPayload,
          name: name,
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

  async findOrCreateFromGoogle({ email, username, picture }) {
    let user = await this.userRepository.findOneBy({ email });

    if (!user) {
      user = await this.userRepository.save({
        email,
        username,
        image: picture,
        password: null,
        emailVerified: true,
        googleToken: randomBytes(8).toString('hex'),
      });
    } else {
      user.googleToken = randomBytes(8).toString('hex');
      user = await this.userRepository.save(user);
    }

    const savedUser = await this.userRepository.save(user);
    return { savedUser };
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

  async refreshToken(previousRefreshToken: string) {
    const payload = await this.jwtService.verifyAsync(previousRefreshToken, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
    });

    const now = Math.floor(Date.now() / 1000);

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.exp < now) {
      await this.logout(payload.sub);
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.findOneBy({
      id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      throw new BadRequestException('Invalid tiken!');
    }

    await this.sessionService.closeSession(payload.sub);

    const newSessionId = await this.sessionService.create(user);

    const tokensPayload: InTokensGenerate = {
      email: payload.email,
      role: payload.role,
      id: payload.sub,
      name: payload.name,
      sessionId: newSessionId,
    };
    const { accessToken, refreshToken } =
      await this.generateTokens(tokensPayload);

    return { accessToken, refreshToken };
  }
}
