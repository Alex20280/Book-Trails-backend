import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { SessionService } from '@/session/session.service';

import { JwtPayload } from '@/common/interfaces/jwt.payload.intrface';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) throw new UnauthorizedException();

    const nowInSeconds = Date.now() / 1000;
    const payloadExpInSeconds = payload.exp;

    if (nowInSeconds - payloadExpInSeconds >= 4 * 3600) {
      await this.authService.logout(payload.sub);
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    await this.sessionService.findOneForJwt(payload.sub, payload.sessionId);

    return payload;
  }
}
