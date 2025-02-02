import { axiosInstance } from "../../../../api/axiosInstance";
import { List, Task } from "../../types";

export const fetchListTasks = async (list: List): Promise<Task[]> => {
  const endpoint = `/tasks?listId=${list.id}`;
  const { data: tasks } = await axiosInstance.get(endpoint);

  return tasks;
};
