import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { KyselyModule } from 'src/kysely/kysely.module';

@Module({
  imports: [KyselyModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
