import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requestedUserId = parseInt(request.params.id);
    const currentUser: User = request.user;

    if (!currentUser) throw new ForbiddenException('Not authenticated');

    if (currentUser.id !== requestedUserId) {
      throw new ForbiddenException('You do not have sufficient permissions');
    }

    return true;
  }
}
