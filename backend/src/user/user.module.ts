import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { KyselyModule } from 'src/kysely/kysely.module';

@Module({
  imports: [KyselyModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
