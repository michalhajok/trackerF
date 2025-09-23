import { forwardRef } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const Checkbox = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      disabled = false,
      checked,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              ref={ref}
              checked={checked}
              disabled={disabled}
              className={cn(
                "h-4 w-4 rounded border-2 border-gray-300 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "appearance-none bg-white checked:bg-primary-500 checked:border-primary-500",
                error && "border-red-500",
                className
              )}
              {...props}
            />
            {checked && (
              <CheckIcon className="absolute h-3 w-3 text-white left-0.5 top-0.5 pointer-events-none" />
            )}
          </div>
          {label && (
            <label
              className={cn(
                "ml-2 text-sm text-slate-700 cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600 ml-6">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 ml-6">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

const CheckboxGroup = ({
  label,
  error,
  helperText,
  required,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-2">{children}</div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export { Checkbox, CheckboxGroup };
export default Checkbox;
