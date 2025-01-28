import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { KyselyModule } from './kysely/kysely.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [UserModule, KyselyModule, AuthModule, BoardModule, ListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
