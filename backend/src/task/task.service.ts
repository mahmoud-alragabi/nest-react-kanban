import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, User } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly db: KyselyService) {}

  private async isListValid(
    listId: number,
    ownerId: User['id'],
  ): Promise<boolean> {
    const foundList = await this.db
      .selectFrom('List')
      .selectAll()
      .where('id', '=', listId)
      .executeTakeFirst();

    if (!foundList) {
      throw new Error('LIST_NOT_FOUND');
    }

    if (foundList.ownerId !== ownerId) {
      throw new Error('USER_NOT_LIST_OWNER');
    }

    return true;
  }

  /**
   * Creates a new task for the specified list, ensuring the user is the list owner.
   */
  async create(dto: CreateTaskDto, ownerId: User['id']): Promise<Task> {
    await this.isListValid(dto.listId, ownerId);

    try {
      const [createdTask] = await this.db
        .insertInto('Task')
        .values({
          ...dto,
          ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .execute();

      return createdTask;
    } catch (error) {
      if (['LIST_NOT_FOUND', 'USER_NOT_LIST_OWNER'].includes(error.message)) {
        throw error;
      }

      throw new Error('CREATE_TASK_FAILED');
    }
  }

  /**
   * Retrieves all tasks for a specific list, ensuring the user is the list owner.
   */
  async findAllByListId(listId: number, ownerId: User['id']): Promise<Task[]> {
    await this.isListValid(listId, ownerId);

    try {
      return await this.db
        .selectFrom('Task')
        .selectAll()
        .where('listId', '=', listId)
        .execute();
    } catch (error) {
      throw new Error('FETCH_TASKS_FAILED');
    }
  }

  /**
   * Finds a task by its ID (only used if needed).
   */
  async findById(id: number): Promise<Task> {
    const foundTask = await this.db
      .selectFrom('Task')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!foundTask) {
      throw new Error('TASK_NOT_FOUND');
    }

    return foundTask;
  }

  /**
   * Updates a task by its ID.
   */
  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.findById(id);

    await this.isListValid(existingTask.listId, existingTask.ownerId);

    try {
      const [updatedTask] = await this.db
        .updateTable('Task')
        .set({
          ...dto,
          updatedAt: new Date(),
        })
        .where('id', '=', id)
        .returningAll()
        .execute();

      return updatedTask;
    } catch (error) {
      throw new Error('UPDATE_TASK_FAILED');
    }
  }

  /**
   * Deletes a task by its ID.
   */
  async remove(id: number): Promise<void> {
    const existingTask = await this.findById(id);

    await this.isListValid(existingTask.listId, existingTask.ownerId);

    try {
      const { numDeletedRows } = await this.db
        .deleteFrom('Task')
        .where('id', '=', id)
        .executeTakeFirst();

      if (!numDeletedRows || Number(numDeletedRows) === 0) {
        throw new Error('TASK_NOT_FOUND');
      }
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      throw new Error('DELETE_TASK_FAILED');
    }
  }
}
