export type WithId = {
  id: string | number;
};

export const removeById = <T extends WithId>(array: T[], id: T["id"]): T[] => {
  return array.filter((item) => item.id !== id);
};
