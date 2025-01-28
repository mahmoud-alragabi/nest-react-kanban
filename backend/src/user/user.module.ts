import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KyselyModule } from '../kysely/kysely.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserGuard } from './guards/user.guard';

@Module({
  imports: [KyselyModule],
  controllers: [UserController],
  providers: [UserService, RolesGuard, UserGuard],
})
export class UserModule {}
