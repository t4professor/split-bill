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

  async validate(payload: any): Promise<any> {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) return null;
    // Return with 'sub' field for compatibility with req.user.sub
    return {
      sub: user.id,
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };
  }
}
