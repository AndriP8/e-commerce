"use client";

import type React from "react";
import type {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";
import type { z } from "zod";
import { isFieldRequired } from "@/app/utils/zod-utils";

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  // biome-ignore lint/suspicious/noExplicitAny: React Hook Form types are complex
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
  registration: UseFormRegisterReturn;
  className?: string; // Class for the input itself
  containerClassName?: string; // Class for the wrapper div
  autoComplete?: string;
  required?: boolean;
  schema?: z.ZodTypeAny;
  hideLabel?: boolean;
  children?: React.ReactNode;
}

export const FormField = ({
  label,
  type = "text",
  placeholder,
  error,
  registration,
  className = "",
  containerClassName = "",
  autoComplete,
  required: manualRequired = false,
  schema,
  hideLabel = false,
  children,
}: FormFieldProps) => {
  const isRequired =
    manualRequired || isFieldRequired(schema, registration.name);

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      <label
        htmlFor={registration.name}
        className={`text-sm font-semibold text-gray-700 ${hideLabel ? "sr-only" : ""}`}
      >
        {label}
        {isRequired && (
          <span
            className="text-red-500 ml-1"
            aria-hidden="true"
            title="Required"
          >
            *
          </span>
        )}
      </label>
      <div className="relative group">
        <input
          id={registration.name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${registration.name}-error` : undefined}
          required={isRequired}
          className={`
            relative block w-full rounded-lg border-0 py-2 px-3 
            text-gray-900 ring-1 ring-inset ring-gray-300 
            placeholder:text-gray-400 
            transition-all duration-200
            hover:ring-gray-400
            focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:outline-none focus:ring-offset-0
            sm:text-sm sm:leading-6
            ${
              error
                ? "ring-red-500 text-red-900 placeholder:text-red-300 focus:ring-red-500 hover:ring-red-500"
                : "ring-gray-300"
            } 
            ${className}
          `}
          {...registration}
        />
        {children}
      </div>
      {error && typeof error.message === "string" && (
        <p
          className="text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1"
          id={`${registration.name}-error`}
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
};
