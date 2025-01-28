import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'My First Task' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 1,
    description: 'List ID to which this task belongs',
  })
  @IsInt()
  listId: number;

  @ApiProperty({ example: 1, description: 'Position of the task in the list' })
  @IsInt()
  position: number;
}
