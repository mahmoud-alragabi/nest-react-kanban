import React from "react";

interface CustomMessageProps {
  status: string;
  children: React.ReactNode;
}

const ErrorMessage: React.FC<CustomMessageProps> = ({ status, children }) => {
  if (!children) return null;

  let textColor = "";

  if (status === "error") textColor = "text-red-500";

  if (status === "success") textColor = "text-green-500";

  return <div className={`mb-4 ${textColor} text-sm`}>{children}</div>;
};

export default ErrorMessage;
