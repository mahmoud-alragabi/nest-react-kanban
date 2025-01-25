import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { KyselyService } from 'src/kysely/kysely.service';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly db: KyselyService) {}

  async create(dto: CreateUserDto) {
    const foundUser = await this.db
      .selectFrom('User')
      .where('email', '=', dto.email)
      .executeTakeFirst();

    if (foundUser) throw new Error('EMAIL_EXISTS');

    const hashedPassword: string = await hash(dto.password, 10);

    return this.db
      .insertInto('User')
      .values({
        ...dto,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findAll() {
    try {
      const users = await this.db.selectFrom('User').selectAll().execute();

      return users;
    } catch (error) {
      throw new Error('FETCH_USERS_FAILED');
    }
  }

  async findById(id: number) {
    const user = await this.db
      .selectFrom('User')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) throw new Error('USER_NOT_FOUND');

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const foundUser = await this.db
      .selectFrom('User')
      .where('id', '=', id)
      .select('id')
      .executeTakeFirst();

    if (!foundUser) throw new Error('USER_NOT_FOUND');

    if (dto.email) {
      const emailUser = await this.db
        .selectFrom('User')
        .where('email', '=', dto.email)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (emailUser) throw new Error('EMAIL_IN_USE');
    }

    const updateData = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.password) {
      updateData.password = await hash(dto.password, 10);
    }

    const user = await this.db
      .updateTable('User')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return user;
  }

  async remove(id: number) {
    try {
      const { numDeletedRows } = await this.db
        .deleteFrom('User')
        .where('id', '=', id)
        .executeTakeFirst();

      if (Number(numDeletedRows) === 0) throw new Error('USER_NOT_FOUND');

      return { deletedCount: Number(numDeletedRows) };
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') throw error;

      throw new Error('DELETE_FAILED');
    }
  }
}
