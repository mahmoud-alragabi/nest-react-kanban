import React from "react";

interface TextFieldProps {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  name?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  type = "text",
  id,
  value,
  onChange,
  required = false,
  autoComplete,
  wrapperClassName = "mb-4",
  inputClassName = "",
  name = "",
  ...props
}) => {
  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={id}
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        {label}
      </label>
      <input
        {...{
          ...props,
          name,
          type,
          id,
          value,
          onChange,
          required,
          autoComplete,
        }}
        className={`w-full px-3 py-2 border rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClassName}`}
      />
    </div>
  );
};

export default TextField;
