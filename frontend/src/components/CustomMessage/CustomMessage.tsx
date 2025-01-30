import React from "react";

interface CustomMessageProps {
  status: string;
  children: React.ReactNode;
}

const ErrorMessage: React.FC<CustomMessageProps> = ({ status, children }) => {
  if (!children) return null;

  const statusColorMap: Record<string, string> = {
    success: "green",
    error: "red",
  };

  return (
    <div className={`mb-4 text-${statusColorMap[status]}-500 text-sm`}>
      {children}
    </div>
  );
};

export default ErrorMessage;
