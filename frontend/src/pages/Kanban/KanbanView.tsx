import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../api/axiosInstance";
import { fetchListTasks } from "./modules/api";
import TitleWithActions from "./components/TitleWithActions/TitleWithActions";
import { HttpStatusCode } from "axios";
import { last, removeById, sortByPosition, updateById } from "./modules/utils";
import { Board, List as ListType, Task as TaskType } from "./types";
import List from "./components/List/List";
import ListContainer from "./components/List/components/ListContainer/ListContainer";
import UpdatePopup from "./components/UpdatePopup/UpdatePopup";
import Task from "./components/Task/Task";

interface PopupProps {
  show: boolean;
  title: string;
  value: string;
  onSave: (title: string) => Promise<unknown>;
}

const KanbanView: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<ListType[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<ListType["id"], TaskType[]>>(
    {},
  );
  const [currentBoard, setCurrentBoard] = useState<Board>();
  const [popup, setPopup] = useState<PopupProps>({
    show: false,
    title: "",
    value: "",
    onSave: async () => {},
  });

  useEffect(() => {
    (async () => {
      const { data: fetchedBoards } = await axiosInstance.get("/boards/mine");

      if (fetchedBoards.length) setBoards(fetchedBoards);
    })();
  }, []);

  useEffect(() => {
    if (!currentBoard && boards.length) setCurrentBoard(boards[0]);
  }, [boards, currentBoard]);

  useEffect(() => {
    (async () => {
      if (!currentBoard) return;

      const endpoint = `/lists?boardId=${currentBoard.id}`;

      const { data: fetchedLists } = await axiosInstance.get(endpoint);

      const tasksPromises = fetchedLists.map(async (list: ListType) => {
        const tasks = await fetchListTasks(list);

        return setTasksMap((map) => {
          map[list.id] = tasks;

          return map;
        });
      });

      await Promise.all(tasksPromises);

      const sortedList: ListType[] = sortByPosition(fetchedLists);

      setLists(sortedList);
    })();
  }, [currentBoard]);

  // BOARD
  const handleRemoveBoard = async (boardId: Board["id"]) => {
    const response = await axiosInstance.delete(`/boards/${boardId}`);

    if (response.status !== HttpStatusCode.NoContent) return;

    setBoards((boards) => removeById(boards, boardId));

    if (currentBoard?.id !== boardId) return;

    setCurrentBoard(undefined);
  };

  const createBoard = async (title: Board["title"]): Promise<void> => {
    const response = await axiosInstance.post(`/boards`, { title });

    if (response.status !== HttpStatusCode.Created) return;

    setBoards((boards) => [...boards, response.data]);
  };

  const handleCreateBoardClicked: React.MouseEventHandler = () => {
    setPopup({
      onSave: createBoard,
      title: "Create Board",
      value: "",
      show: true,
    });
  };

  const updateBoard = async (
    boardId: Board["id"],
    title: Board["title"],
  ): Promise<void> => {
    const response = await axiosInstance.patch(`/boards/${boardId}`, { title });

    if (response.status !== HttpStatusCode.Ok) return;

    setBoards((boards) => updateById(boards, response.data, boardId));
  };

  const handleEditBoardClicked = (
    boardId: Board["id"],
    title: Board["title"],
  ) => {
    setPopup({
      onSave: (title: string) => updateBoard(boardId, title),
      title: "Update Board",
      value: title,
      show: true,
    });
  };

  const handleBoardClicked = async (boardId: Board["id"]) => {
    const { data: board } = await axiosInstance.get(`/boards/${boardId}`);

    if (board) setCurrentBoard(board);
  };

  // LIST
  const updateList = async (
    listId: ListType["id"],
    title: ListType["title"],
  ): Promise<void> => {
    const response = await axiosInstance.patch(`/lists/${listId}`, { title });

    if (response.status !== HttpStatusCode.Ok) return;

    setLists((lists) => updateById(lists, response.data, listId));
  };

  const handleEditListClicked = (
    listId: ListType["id"],
    title: ListType["title"],
  ) => {
    setPopup({
      onSave: (title: string) => updateList(listId, title),
      title: "Update List",
      value: title,
      show: true,
    });
  };

  const handleRemoveList = async (listId: ListType["id"]) => {
    const response = await axiosInstance.delete(`/lists/${listId}`);

    if (response.status !== HttpStatusCode.NoContent) return;

    setLists((lists) => removeById(lists, listId));
  };

  const createList = async (
    boardId: Board["id"],
    title: ListType["title"],
    position: ListType["position"],
  ): Promise<void> => {
    const response = await axiosInstance.post(`/lists`, {
      boardId,
      title,
      position,
    });

    if (response.status !== HttpStatusCode.Created) return;

    setLists((lists) => [...lists, response.data]);
  };

  const handleCreateListClicked = (boardId: Board["id"]) => {
    const newPositin = last(lists)?.position ?? 1;

    setPopup({
      onSave: (title: string) => createList(boardId, title, newPositin),
      title: "Create List",
      value: "",
      show: true,
    });
  };

  // Task
  const createTask = async (
    listId: ListType["id"],
    title: TaskType["title"],
    position: TaskType["position"],
  ) => {
    const data = { title, position, listId };
    const response = await axiosInstance.post(`/tasks`, data);

    if (response.status !== HttpStatusCode.Created) return;

    setTasksMap((tasksMap) => {
      const listTasks = tasksMap[listId] ?? [];

      tasksMap[listId] = [...listTasks, response.data];

      return tasksMap;
    });
  };

  const handleCreateTaskClicked = (listId: ListType["id"]) => {
    const listTasks = tasksMap?.[listId];
    const newPositin = last(listTasks)?.position ?? 1;

    setPopup({
      onSave: (title: string) => createTask(listId, title, newPositin),
      title: "Create Task",
      value: "",
      show: true,
    });
  };

  const handleRemoveTask = async (
    taskId: TaskType["id"],
    listId: ListType["id"],
  ) => {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);

    if (response.status !== HttpStatusCode.NoContent) return;

    setTasksMap((tasksMap) => {
      const tasksMapCopy = { ...tasksMap };

      tasksMapCopy[listId] = removeById(tasksMapCopy[listId], taskId);

      return tasksMapCopy;
    });
  };

  const handleEditTaskClicked = (
    listId: ListType["id"],
    taskId: TaskType["id"],
    title: TaskType["title"],
  ) => {
    setPopup({
      onSave: (title: string) => updateTask(listId, taskId, title),
      title: "Update Task",
      value: title,
      show: true,
    });
  };

  const updateTask = async (
    listId: ListType["id"],
    taskId: TaskType["id"],
    title: TaskType["title"],
  ): Promise<void> => {
    const response = await axiosInstance.patch(`/tasks/${taskId}`, { title });

    if (response.status !== HttpStatusCode.Ok) return;

    setTasksMap((tasksMap) => {
      const tasksMapCopy = { ...tasksMap };
      tasksMapCopy[listId] = updateById(
        tasksMapCopy[listId],
        response.data,
        taskId,
      );

      return tasksMapCopy;
    });
  };

  return (
    <div className="flex h-screen">
      <div className="min-w-[400px] w-1/5 bg-gray-200 p-4 border-r border-gray-300 flex flex-col h-screen">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Boards</h2>
          <button
            onClick={handleCreateBoardClicked}
            className="w-full py-2 mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            + Create New Board
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {boards.map((board) => (
              <TitleWithActions
                key={board.id}
                title={board.title}
                titleClassName="text-2xl cursor-pointer"
                onClick={() => handleBoardClicked(board.id)}
                onEdit={() => handleEditBoardClicked(board.id, board.title)}
                onRemove={() => handleRemoveBoard(board.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">
          {currentBoard?.title || "Select a board"}
        </h2>
        <div className="flex-1 flex space-x-4 overflow-x-auto">
          {lists.map((list) => (
            <List
              key={list.id}
              {...{
                title: list.title,
                onEdit: () => handleEditListClicked(list.id, list.title),
                onRemove: () => handleRemoveList(list.id),
              }}
              tasksSlot={tasksMap?.[list.id]?.map((task) => (
                <Task
                  key={task.id}
                  {...{
                    title: task.title,
                    onRemove: () => handleRemoveTask(task.id, list.id),
                    onEdit: () =>
                      handleEditTaskClicked(list.id, task.id, task.title),
                  }}
                />
              ))}
              buttonSlot={
                <button
                  onClick={() => handleCreateTaskClicked(list.id)}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  + Add New Task
                </button>
              }
            />
          ))}
          <ListContainer className="items-center justify-center">
            <button
              onClick={() =>
                currentBoard && handleCreateListClicked(currentBoard.id)
              }
              className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              + New List
            </button>
          </ListContainer>
        </div>
      </div>
      {popup.show && (
        <UpdatePopup
          popupTitle={popup.title}
          initialValue={popup.value}
          onSave={async (title) => {
            await popup.onSave(title);

            return setPopup((popup) => ({ ...popup, show: false }));
          }}
          onCancel={() => setPopup((popup) => ({ ...popup, show: false }))}
        />
      )}
    </div>
  );
};

export default KanbanView;
