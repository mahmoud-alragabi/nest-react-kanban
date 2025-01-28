import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { KyselyModule } from '../kysely/kysely.module';

@Module({
  imports: [KyselyModule],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
