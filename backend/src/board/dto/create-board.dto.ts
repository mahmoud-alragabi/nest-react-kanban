import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'My First Board' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
