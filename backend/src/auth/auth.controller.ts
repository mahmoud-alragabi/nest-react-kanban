import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Authentication failed',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
