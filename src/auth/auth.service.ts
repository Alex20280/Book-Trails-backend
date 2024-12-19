import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByParams({
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

  async login(user: User) {
    const existingUser = await this.userService.login(user);
    const { accessToken, refreshToken } = await this.generateTokens(
      user.email,
      user.role,
      user.id,
      user.name,
    );

    return { existingUser, accessToken, refreshToken };
  }

  private async generateTokens(
    email: string,
    role: string,
    id: number,
    name: string,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync({
        email: email,
        role: role,
        sub: id,
      }),

      await this.jwtService.signAsync(
        {
          email: email,
          role: role,
          sub: id,
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
}
