import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KyselyService } from '../../kysely/kysely.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly db: KyselyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const model = this.reflector.get<string>(
      'resourceModel',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id;
    const user = request.user;

    if (!model || !resourceId || !user) return false;

    const resource = await this.db
      .selectFrom(model as any)
      .select('ownerId')
      .where('id', '=', resourceId)
      .executeTakeFirst();

    return resource?.ownerId === user.id;
  }
}
