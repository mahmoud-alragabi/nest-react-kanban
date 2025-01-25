import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;

    return rest;
  }
  /**
   * Registers a new user.
   */
  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
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
   */
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
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
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
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
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
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
   */
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully deleted',
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
