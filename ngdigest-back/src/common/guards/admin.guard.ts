import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-admin-key'] as string | undefined;
    const expected = this.configService.get<string>('ADMIN_SECRET');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
