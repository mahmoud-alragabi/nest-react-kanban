import type { ColumnType } from 'kysely';
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export type Board = {
  id: Generated<number>;
  title: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  ownerId: number;
};
export type List = {
  id: Generated<number>;
  title: string;
  position: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  boardId: number;
};
export type Task = {
  id: Generated<number>;
  title: string;
  position: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  listId: number;
  ownerId: number;
};
export type User = {
  id: Generated<number>;
  email: string;
  password: string;
  name: string;
  role: Generated<Role>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type DB = {
  Board: Board;
  List: List;
  Task: Task;
  User: User;
};
