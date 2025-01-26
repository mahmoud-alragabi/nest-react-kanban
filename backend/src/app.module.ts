import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { KyselyModule } from './kysely/kysely.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, KyselyModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
