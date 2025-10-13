import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayloadUser } from '../../auth/types/jwt-payload-user.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayloadUser | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtPayloadUser | undefined;
  },
);
