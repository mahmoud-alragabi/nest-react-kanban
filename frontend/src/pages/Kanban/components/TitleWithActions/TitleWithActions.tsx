import React from "react";
import IconButton from "../IconicButton/IconicButton";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

interface TitleWithActionsProps {
  title: string;
  titleSize?: string;
  onClick: () => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onRemove: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const TitleWithActions: React.FC<TitleWithActionsProps> = ({
  title,
  titleSize = "text-xl",
  onClick,
  onEdit,
  onRemove,
}) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left p-2 rounded hover:bg-gray-100 focus:outline-none flex items-center justify-between"
    >
      <span className={`${titleSize} font-bold`}>{title}</span>
      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <IconButton
          icon={faEdit}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
          aria-label="Edit"
          className="text-blue-500 hover:text-blue-600"
        />
        <IconButton
          icon={faTrashAlt}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          aria-label="Remove"
          className="text-red-500 hover:text-red-600"
        />
      </div>
    </button>
  );
};

export default TitleWithActions;
