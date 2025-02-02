export type List = {
  id: number;
  title: string;
  position: number;
  createdAt: string;
  boardId: number;
  ownerId: number;
};

export type Task = {
  id: number;
  title: string;
  position: number;
  createdAt: string;
  listId: number;
  ownerId: number;
};

export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};
