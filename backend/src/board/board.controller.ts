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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Board, User } from '@prisma/client';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { GetCurrentUser } from 'src/common/decorators/get-user.decorator';
import { OwnerOf } from 'src/common/decorators/owner.decorator';

@ApiTags('Boards')
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  /**
   * Creates a new board and associates it with the currently authenticated user.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiBody({
    type: CreateBoardDto,
    description: 'Data for creating a new board',
    examples: {
      example1: {
        value: {
          title: 'My Awesome Board',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Board created successfully.',
    schema: {
      example: {
        id: 123,
        title: 'My Awesome Board',
        ownerId: 1,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create board.',
  })
  async create(
    @Body() dto: CreateBoardDto,
    @GetCurrentUser() user: User,
  ): Promise<Board> {
    try {
      const board = await this.boardService.create(dto, user.id);

      return board;
    } catch (error) {
      if (error.message === 'CREATE_BOARD_FAILED') {
        throw new InternalServerErrorException('Failed to create board');
      }

      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieves all boards belonging to the currently authenticated user.
   */
  @Get('/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve all current user boards' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Boards retrieved successfully.',
    schema: {
      example: [
        {
          id: 123,
          title: 'My Awesome Board',
          ownerId: 1,
          createdAt: '2025-01-27T12:00:00.000Z',
          updatedAt: '2025-01-27T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  async findAll(@GetCurrentUser() user: User): Promise<Board[]> {
    try {
      return await this.boardService.findAllByOwnerId(user.id);
    } catch (error) {
      if (error.message === 'FETCH_BOARDS_FAILED') {
        throw new InternalServerErrorException('Failed to retrieve boards');
      }

      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieves a board by its ID. Only accessible if the user is the board owner.
   */
  @Get(':id')
  @OwnerOf('Board')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a board by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board retrieved successfully.',
    schema: {
      example: {
        id: 123,
        title: 'My Awesome Board',
        ownerId: 1,
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
    description: 'Unauthorized.',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Board> {
    try {
      return await this.boardService.findById(id);
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to fetch board');
    }
  }

  /**
   * Updates a board by its ID. Only accessible if the user is the board owner.
   */
  @Patch(':id')
  @OwnerOf('Board')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a board by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiBody({
    type: UpdateBoardDto,
    description: 'Data for updating a board',
    examples: {
      example1: {
        value: {
          title: 'Updated Board Title',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board updated successfully.',
    schema: {
      example: {
        id: 123,
        title: 'Updated Board Title',
        ownerId: 1,
        createdAt: '2025-01-27T12:00:00.000Z',
        updatedAt: '2025-01-27T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Board not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update board.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    try {
      const board = await this.boardService.update(id, updateBoardDto);

      return board;
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      if (error.message === 'UPDATE_BOARD_FAILED') {
        throw new InternalServerErrorException('Failed to update board');
      }

      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Deletes a board by its ID. Only accessible if the user is the board owner.
   */
  @Delete(':id')
  @OwnerOf('Board')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a board' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Board deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Board not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete board.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.boardService.remove(id);
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') {
        throw new NotFoundException(`Board with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to delete board');
    }
  }
}
