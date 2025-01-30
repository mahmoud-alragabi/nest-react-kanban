import React from "react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = "Loading...",
  type = "submit",
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "w-full py-2 rounded focus:outline-none disabled:bg-gray-400 transition-colors";

  const colorClass = "bg-blue-500 hover:bg-blue-600 text-white";

  return (
    <button
      type={type}
      disabled={loading}
      className={`${baseClasses} ${colorClass} ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;
