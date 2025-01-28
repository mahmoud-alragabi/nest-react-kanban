import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { KyselyService } from 'src/kysely/kysely.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, KyselyService],
})
export class TaskModule {}
