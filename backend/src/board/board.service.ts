import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { KyselyService } from '../kysely/kysely.service';
import { Board, User } from '@prisma/client';

@Injectable()
export class BoardService {
  constructor(private readonly db: KyselyService) {}

  async create(dto: CreateBoardDto, ownerId: User['id']): Promise<Board> {
    try {
      const [createdBoard] = await this.db
        .insertInto('Board')
        .values({
          ...dto,
          ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .execute();

      return createdBoard;
    } catch (error) {
      throw new Error('CREATE_BOARD_FAILED');
    }
  }

  async findAllByOwnerId(ownerId: User['id']): Promise<Board[]> {
    try {
      return await this.db
        .selectFrom('Board')
        .selectAll()
        .where('ownerId', '=', ownerId)
        .execute();
    } catch (error) {
      throw new Error('FETCH_BOARDS_FAILED');
    }
  }

  async findById(id: number): Promise<Board> {
    const foundBoard = await this.db
      .selectFrom('Board')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!foundBoard) throw new Error('BOARD_NOT_FOUND');

    return foundBoard;
  }

  async update(id: number, dto: UpdateBoardDto): Promise<Board> {
    // if not found exit early
    await this.findById(id);

    try {
      const [updatedBoard] = await this.db
        .updateTable('Board')
        .set({
          title: dto.title,
          updatedAt: new Date(),
        })
        .where('id', '=', id)
        .returningAll()
        .execute();

      return updatedBoard;
    } catch (error) {
      throw new Error('UPDATE_BOARD_FAILED');
    }
  }

  async remove(id: number): Promise<{ deletedCount: number }> {
    try {
      const { numDeletedRows } = await this.db
        .deleteFrom('Board')
        .where('id', '=', id)
        .executeTakeFirst();

      if (Number(numDeletedRows) === 0) {
        throw new Error('BOARD_NOT_FOUND');
      }

      return { deletedCount: Number(numDeletedRows) };
    } catch (error) {
      if (error.message === 'BOARD_NOT_FOUND') throw error;

      throw new Error('DELETE_BOARD_FAILED');
    }
  }
}
