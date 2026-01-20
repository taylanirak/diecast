import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_ROUTE_KEY } from '../decorators/admin-route.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check if route is marked as admin route (will be handled by AdminJwtAuthGuard)
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAdminRoute) {
      return true; // Skip global guard, let AdminJwtAuthGuard handle it
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Oturum açmanız gerekiyor');
    }
    return user;
  }
}
