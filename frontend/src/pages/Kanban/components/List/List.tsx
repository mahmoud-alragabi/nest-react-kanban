import React, { ReactNode } from "react";
import TitleWithActions from "../TitleWithActions/TitleWithActions";
import ListContainer from "./components/ListContainer/ListContainer";

interface ListProps {
  title: string;
  tasksSlot: ReactNode[];
  buttonSlot: ReactNode;
  onEdit?: () => void;
  onRemove?: () => void;
}

const List: React.FC<ListProps> = ({
  title,
  tasksSlot,
  buttonSlot,
  onEdit,
  onRemove,
}) => {
  return (
    <ListContainer>
      <TitleWithActions
        title={title}
        onClick={() => {}}
        onEdit={onEdit || (() => {})}
        onRemove={onRemove || (() => {})}
      ></TitleWithActions>
      <div className="mt-2 flex-1 overflow-y-auto space-y-4">{tasksSlot}</div>
      <div className="mt-2">{buttonSlot} </div>
    </ListContainer>
  );
};

export default List;
