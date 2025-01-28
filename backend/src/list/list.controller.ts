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

import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { List, User } from '@prisma/client';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { OwnerOf } from 'src/common/decorators/owner.decorator';
import { GetCurrentUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Lists')
@Controller('lists')
@ApiBearerAuth()
export class ListController {
  constructor(private readonly listService: ListService) {}

  /**
   * Create a new list.
   *
   * The user must own the board to which the list is being added, otherwise
   * an Unauthorized or Not Found error will be thrown.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new list' })
  @ApiBody({
    type: CreateListDto,
    description: 'Data required for creating a new list.',
    examples: {
      example1: {
        value: {
          title: 'To Do',
          boardId: 1,
          position: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'List created successfully.',
    schema: {
      example: {
        id: 10,
        title: 'To Do',
        position: 1,
        boardId: 1,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Board not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not the owner of the board.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create list.',
  })
  async create(
    @Body() dto: CreateListDto,
    @GetCurrentUser() user: User,
  ): Promise<List> {
    try {
      return await this.listService.create(dto, user.id);
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') {
        throw new NotFoundException('Board not found');
      }

      if (error.message === 'USER_NOT_BOARD_OWNER') {
        throw new UnauthorizedException('User is not the owner of the board');
      }

      if (error.message === 'CREATE_LIST_FAILED') {
        throw new InternalServerErrorException('Failed to create list');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieve all lists for a specific board.
   *
   * Only accessible if the user is the owner of that board.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all lists for a specific board' })
  @ApiQuery({
    name: 'boardId',
    type: Number,
    description: 'Board ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lists retrieved successfully.',
    schema: {
      example: [
        {
          id: 10,
          title: 'To Do',
          position: 1,
          boardId: 1,
          createdAt: '2025-01-27T12:00:00.000Z',
          updatedAt: '2025-01-27T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Board not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not the owner of the board or token is invalid.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve lists.',
  })
  async findAllByBoardId(
    @Query('boardId', ParseIntPipe) boardId: number,
    @GetCurrentUser() user: User,
  ) {
    try {
      return await this.listService.findAllByBoardId(boardId, user.id);
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') {
        throw new NotFoundException('Board not found');
      }

      if (error.message === 'USER_NOT_BOARD_OWNER') {
        throw new UnauthorizedException('User is not the owner of the board');
      }

      if (error.message === 'FETCH_LISTS_FAILED') {
        throw new InternalServerErrorException('Failed to retrieve lists');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieve a specific list by its ID.
   *
   * Only accessible if the user is the owner of the list.
   */
  @Get(':id')
  @OwnerOf('List')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Get a list by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'List ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List retrieved successfully.',
    schema: {
      example: {
        id: 10,
        title: 'To Do',
        position: 1,
        boardId: 1,
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
    description: 'Unauthorized - not the owner of the list or invalid token.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch list.',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<List> {
    try {
      return await this.listService.findById(id);
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') {
        throw new NotFoundException(`List with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to fetch list');
    }
  }

  /**
   * Updates a list by its ID.
   *
   * Only accessible if the user is the owner of the list.
   */
  @Patch(':id')
  @OwnerOf('List')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Update a list by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'List ID' })
  @ApiBody({
    type: UpdateListDto,
    description: 'Data to update the list',
    examples: {
      example1: {
        value: {
          title: 'In Progress',
          position: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List updated successfully.',
    schema: {
      example: {
        id: 10,
        title: 'In Progress',
        position: 2,
        boardId: 1,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - not the owner of the list.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update list.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListDto,
  ): Promise<List> {
    try {
      return await this.listService.update(id, dto);
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') {
        throw new NotFoundException(`List with ID ${id} not found`);
      }
      if (error.message === 'UPDATE_LIST_FAILED') {
        throw new InternalServerErrorException('Failed to update list');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Deletes a list by its ID.
   *
   * Only accessible if the user is the owner of the list.
   */
  @Delete(':id')
  @OwnerOf('List')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a list' })
  @ApiParam({ name: 'id', type: Number, description: 'List ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'List deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - not the owner of the list.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete list.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.listService.remove(id);
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') {
        throw new NotFoundException(`List with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete list');
    }
  }
}
