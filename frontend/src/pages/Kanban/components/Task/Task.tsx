import React from "react";
import IconicButton from "../IconicButton/IconicButton";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

interface TaskProps {
  title: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

const Task: React.FC<TaskProps> = ({
  title,
  onEdit = () => {},
  onRemove = () => {},
}) => {
  return (
    <div className="group bg-white p-2 rounded shadow flex items-center justify-between hover:bg-gray-100">
      <span
        className="flex-1 break-words overflow-hidden whitespace-normal"
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: "unset",
        }}
      >
        {title}
      </span>
      <div className="flex space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <IconicButton
          icon={faEdit}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Edit Task"
          className="text-blue-500 hover:text-blue-600"
        />
        <IconicButton
          icon={faTrashAlt}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove Task"
          className="text-red-500 hover:text-red-600"
        />
      </div>
    </div>
  );
};

export default Task;
