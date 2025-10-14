import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    // If no roles are specified, anyone logged in can access
    if (!requiredRoles) return true;

    // Admins bypass all role checks
    if (user.role === 'ADMIN') return true;

    // Otherwise, check if user's role matches allowed roles
    return requiredRoles.includes(user.role);
  }
}
