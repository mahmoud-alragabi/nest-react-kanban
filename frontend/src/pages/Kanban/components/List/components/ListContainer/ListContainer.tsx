import React, { PropsWithChildren } from "react";

interface ListContainerProps extends PropsWithChildren {
  className?: string;
}

const ListContainer: React.FC<ListContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`w-80 flex-shrink-0 bg-gray-100 rounded-2xl p-3 shadow flex flex-col h-full ${className}`}
    >
      {children}
    </div>
  );
};

export default ListContainer;
