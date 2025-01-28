import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Task, User } from '@prisma/client';
import { GetCurrentUser } from '../common/decorators/get-user.decorator';
import { OwnerGuard } from '../common/guards/owner.guard';
import { OwnerOf } from '../common/decorators/owner.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create a new task for a specific list.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({
    type: CreateTaskDto,
    description: 'Data required for creating a new task.',
    examples: {
      example1: {
        value: {
          title: 'My First Task',
          listId: 1,
          position: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully.',
    schema: {
      example: {
        id: 100,
        title: 'My First Task',
        position: 1,
        listId: 1,
        ownerId: 10,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not the owner of the list.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create task.',
  })
  async create(
    @Body() dto: CreateTaskDto,
    @GetCurrentUser() user: User,
  ): Promise<Task> {
    try {
      return await this.taskService.create(dto, user.id);
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') {
        throw new NotFoundException('List not found');
      }
      if (error.message === 'USER_NOT_LIST_OWNER') {
        throw new UnauthorizedException('User is not the owner of the list');
      }
      if (error.message === 'CREATE_TASK_FAILED') {
        throw new InternalServerErrorException('Failed to create task');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieve all tasks for a specific list.
   * Only accessible if the user is the owner of that list.
   */
  @Get()
  @ApiOperation({ summary: 'Get all tasks for a specific list' })
  @ApiQuery({
    name: 'listId',
    type: Number,
    description: 'List ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks retrieved successfully.',
    schema: {
      example: [
        {
          id: 100,
          title: 'My First Task',
          position: 1,
          listId: 1,
          createdAt: '2025-01-27T12:00:00.000Z',
          updatedAt: '2025-01-27T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not the owner of the list or token is invalid.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve tasks.',
  })
  async findAllByListId(
    @Query('listId', ParseIntPipe) listId: number,
    @GetCurrentUser() user: User,
  ): Promise<Task[]> {
    try {
      return await this.taskService.findAllByListId(listId, user.id);
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') {
        throw new NotFoundException();
      }
      if (error.message === 'USER_NOT_LIST_OWNER') {
        throw new UnauthorizedException();
      }
      if (error.message === 'FETCH_TASKS_FAILED') {
        throw new InternalServerErrorException('Failed to retrieve tasks');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieve a specific task by its ID.
   */
  @Get(':id')
  @OwnerOf('Task')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task retrieved successfully.',
    schema: {
      example: {
        id: 100,
        title: 'My First Task',
        position: 1,
        listId: 1,
        ownerId: 10,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - not the owner of the task or invalid token.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch task.',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    try {
      return await this.taskService.findById(id);
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to fetch task');
    }
  }

  /**
   * Updates a task by its ID.
   */
  @Patch(':id')
  @OwnerOf('Task')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
  @ApiBody({
    type: UpdateTaskDto,
    description: 'Data to update the task',
    examples: {
      example1: {
        value: {
          title: 'Updated Task Title',
          position: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task updated successfully.',
    schema: {
      example: {
        id: 100,
        title: 'Updated Task Title',
        position: 2,
        listId: 1,
        ownerId: 10,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - not the owner of the task.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update task.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      return await this.taskService.update(id, dto);
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      if (error.message === 'UPDATE_TASK_FAILED') {
        throw new InternalServerErrorException('Failed to update task');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Deletes a task by its ID.
   */
  @Delete(':id')
  @OwnerOf('Task')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: Number, description: 'Task ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Task deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete task.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.taskService.remove(id);
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
