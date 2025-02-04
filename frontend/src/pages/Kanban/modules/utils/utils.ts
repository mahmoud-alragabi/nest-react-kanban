export type WithId = {
  id: string | number;
};

export type WithPosition = { position: number };

export const removeById = <T extends WithId>(array: T[], id: T["id"]): T[] => {
  return array.filter((item) => item.id !== id);
};

export const updateById = <T extends WithId>(
  array: T[],
  newData: T,
  id: T["id"],
) => {
  const arrayCopy = [...array];
  const index = arrayCopy.findIndex((item) => item.id === id);

  if (index < 0) throw new Error("item to update not found");

  arrayCopy.splice(index, 1, newData);

  return arrayCopy;
};

export const sortByPosition = <T extends WithPosition>(array: T[]): T[] => {
  return array.sort((a, b) => a.position - b.position);
};
