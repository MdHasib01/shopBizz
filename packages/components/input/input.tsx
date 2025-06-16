import React, { forwardRef } from "react";

type BaseProps = {
  label?: string;
  type: "text" | "textarea" | "password" | "email";
  className?: string;
};

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-600 dark:text-gray-300 font-semibold mb-1">
            {label}
          </label>
        )}

        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-gray-300 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400  ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            {...(props as InputProps)}
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={`w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-gray-300 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 ${className}`}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
