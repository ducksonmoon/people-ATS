import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // For Playground
    if (context.getType() !== 'http') return true;

    if (isPublic) {
      return true;
    }

    const request = this.getRequest(context);
    const canActivate = (await super.canActivate(context)) as boolean;

    if (canActivate) {
      const user = request.user;

      if (!user) {
        throw new Error('Invalid token.');
      }

      request.user = user;
    }

    return canActivate;
  }

  public getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
