import React from "react";

const ErrorMessage: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!children) return null;

  return <div className={`mb-4 text-red-500 text-sm`}>{children}</div>;
};

export default ErrorMessage;
