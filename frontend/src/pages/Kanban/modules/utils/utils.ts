export const removeById = <T extends { id: string | number }>(
  array: T[],
  id: T["id"],
): T[] => {
  return array.filter((item) => item.id !== id);
};
