import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface IconicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
}

const IconicButton: React.FC<IconicButtonProps> = ({
  icon,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`p-2 rounded hover:pointer focus:outline-none cursor-pointer ${className}`}
      {...props}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export default IconicButton;
