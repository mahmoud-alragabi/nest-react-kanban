import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsOptional()
  role?: Role;
}
