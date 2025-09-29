/**
 * Select Component - React Hook Form Compatible
 * Handles both controlled and uncontrolled usage properly
 */

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Select = forwardRef(
  (
    {
      className,
      children,
      placeholder,
      error,
      label,
      value,
      onChange,
      defaultValue,
      disabled,
      required,
      name,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {error && <p className="text-sm text-red-600 mb-1">{error}</p>}

        <div className="relative">
          <select
            ref={ref}
            id={name}
            name={name}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 appearance-none pr-8",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              className
            )}
            disabled={disabled}
            required={required}
            // FIXED: Only pass value/onChange if both are provided (controlled)
            // Otherwise let React Hook Form handle it (uncontrolled)
            {...(value !== undefined && onChange
              ? {
                  value: value,
                  onChange: onChange,
                }
              : {})}
            // For uncontrolled mode (React Hook Form)
            {...(defaultValue !== undefined
              ? {
                  defaultValue: defaultValue,
                }
              : {})}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export default Select;

// Export option component for convenience
export const SelectOption = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);
