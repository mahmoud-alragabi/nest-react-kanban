import { Injectable } from '@nestjs/common';
import { KyselyService } from 'src/kysely/kysely.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List, User } from '@prisma/client';

@Injectable()
export class ListService {
  constructor(private readonly db: KyselyService) {}

  private async isBoardValid(
    boardId: CreateListDto['boardId'],
    ownerId: User['id'],
  ): Promise<void> {
    const foundBoard = await this.db
      .selectFrom('Board')
      .selectAll()
      .where('id', '=', boardId)
      .executeTakeFirst();

    if (!foundBoard) throw new Error('BOARD_NOT_FOUND');

    if (foundBoard.ownerId !== ownerId) throw new Error('USER_NOT_BOARD_OWNER');
  }
  /**
   * Creates a new list.
   */
  async create(dto: CreateListDto, ownerId: User['id']): Promise<List> {
    await this.isBoardValid(dto.boardId, ownerId);

    try {
      const [createdList] = await this.db
        .insertInto('List')
        .values({
          title: dto.title,
          position: dto.position,
          boardId: dto.boardId,
          ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returningAll()
        .execute();

      return createdList;
    } catch (error) {
      const boardErrorMessages = ['BOARD_NOT_FOUND', 'USER_NOT_BOARD_OWNER'];

      if (boardErrorMessages.includes(error.message)) throw error;

      throw new Error('CREATE_LIST_FAILED');
    }
  }

  /**
   * Retrieves all lists belonging to a specific board.
   */
  async findAllByBoardId(
    boardId: number,
    ownerId: User['id'],
  ): Promise<List[]> {
    await this.isBoardValid(boardId, ownerId);

    try {
      return await this.db
        .selectFrom('List')
        .selectAll()
        .where('boardId', '=', boardId)
        .execute();
    } catch (error) {
      throw new Error('FETCH_LISTS_FAILED');
    }
  }

  /**
   * Finds a list by its ID.
   */
  async findById(id: number): Promise<List> {
    const foundList = await this.db
      .selectFrom('List')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!foundList) throw new Error('LIST_NOT_FOUND');

    return foundList;
  }

  /**
   * Updates a list by its ID.
   */
  async update(id: number, dto: UpdateListDto): Promise<List> {
    await this.findById(id);

    try {
      const [updatedList] = await this.db
        .updateTable('List')
        .set({
          ...dto,
          updatedAt: new Date(),
        })
        .where('id', '=', id)
        .returningAll()
        .execute();

      return updatedList;
    } catch (error) {
      throw new Error('UPDATE_LIST_FAILED');
    }
  }

  /**
   * Deletes a list by ID.
   */
  async remove(id: number): Promise<{ deletedCount: number }> {
    try {
      const { numDeletedRows } = await this.db
        .deleteFrom('List')
        .where('id', '=', id)
        .executeTakeFirst();

      if (Number(numDeletedRows) === 0) {
        throw new Error('LIST_NOT_FOUND');
      }

      return { deletedCount: Number(numDeletedRows) };
    } catch (error) {
      if (error.message === 'LIST_NOT_FOUND') throw error;

      throw new Error('DELETE_LIST_FAILED');
    }
  }
}
