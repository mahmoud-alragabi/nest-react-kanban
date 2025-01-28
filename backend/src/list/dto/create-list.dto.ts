import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'To Do' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 1,
    description: 'Board ID to which this list belongs',
  })
  @IsInt()
  boardId: number;

  @ApiProperty({ example: 1, description: 'Position of the list in the board' })
  @IsInt()
  position: number;
}
