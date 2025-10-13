import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import type { JwtPayloadUser } from './types/jwt-payload-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev_secret_key',
    });
  }

  async validate(payload: any): Promise<JwtPayloadUser | null> {
    const user = await this.authService.validateUserById(payload.sub);
    return user ? { id: user.id, userName: user.userName, email: user.email } : null;
  }
}
