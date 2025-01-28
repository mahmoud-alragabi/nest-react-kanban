import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Param,
  ParseIntPipe,
  HttpStatus,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UserGuard } from './guards/user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrGuard } from '@nest-lab/or-guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }

  /**
   * Registers a new user.
   * Accessible without authentication.
   */
  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
          role: Role.USER,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully.',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: Role.USER,
        createdAt: '2023-10-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Registration failed due to server error.',
  })
  async register(@Body() dto: CreateUserDto) {
    try {
      const result = await this.userService.create(dto);

      return this.sanitizeUser(result);
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        throw new ConflictException('Email already registered');
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Retrieves all users.
   * Accessible only by ADMIN.
   */
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved successfully.',
    schema: {
      example: [
        {
          id: 1,
          email: 'admin@example.com',
          role: Role.ADMIN,
          createdAt: '2023-10-01T12:00:00.000Z',
        },
        {
          id: 2,
          email: 'user@example.com',
          role: Role.USER,
          createdAt: '2023-10-01T12:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. Admin role required.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve users due to server error.',
  })
  async findAll() {
    try {
      const users = await this.userService.findAll();

      return users.map((user) => this.sanitizeUser(user));
    } catch (error) {
      if (error.message === 'FETCH_USERS_FAILED') {
        throw new InternalServerErrorException('Failed to retrieve users');
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }

  /**
   * Retrieves a single user by ID.
   * Accessible only by the user or any ADMIN.
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, OrGuard([UserGuard, RolesGuard]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully.',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: Role.USER,
        createdAt: '2023-10-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. User or Admin role required.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch user due to server error.',
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.userService.findById(id);

      return this.sanitizeUser(user);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        throw new NotFoundException(`User ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Updates a user by ID.
   * Accessible only by the user or any ADMIN.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, OrGuard([UserGuard, RolesGuard]))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    examples: {
      example1: {
        value: {
          email: 'updated@example.com',
          password: 'newSecurePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.',
    schema: {
      example: {
        id: 1,
        email: 'updated@example.com',
        role: Role.USER,
        createdAt: '2023-10-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use by another user.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. User or Admin role required.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update user due to server error.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.userService.update(id, updateUserDto);

      return updatedUser;
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND')
        throw new NotFoundException(`User ${id} not found`);

      if (error.message === 'EMAIL_IN_USE')
        throw new ConflictException('Email already in use by another user');

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Deletes a user by ID.
   * Accessible only by the user or any ADMIN.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, OrGuard([UserGuard, RolesGuard]))
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized. Admin role required.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete user due to server error.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.userService.remove(id);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND')
        throw new NotFoundException(`User with ID ${id} not found`);

      if (error.message === 'DELETE_FAILED')
        throw new InternalServerErrorException('Failed to delete user');

      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }
}
