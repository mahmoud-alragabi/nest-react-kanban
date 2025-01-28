import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { KyselyModule } from '../kysely/kysely.module';

@Module({
  imports: [KyselyModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
