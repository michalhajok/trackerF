import { forwardRef, useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const DatePicker = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      value,
      onChange,
      placeholder = "Wybierz datę...",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDateChange = (event) => {
      const newValue = event.target.value;
      if (onChange) {
        onChange(newValue ? new Date(newValue) : null);
      }
    };

    const formattedValue = value
      ? value instanceof Date
        ? value.toISOString().split("T")[0]
        : value
      : "";

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            value={formattedValue}
            onChange={handleDateChange}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 pr-8",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              className
            )}
            disabled={disabled}
            placeholder={placeholder}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  error,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="block text-sm font-medium text-slate-700">{label}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Data od"
          value={startDate}
          onChange={onStartDateChange}
          error={error}
        />
        <DatePicker
          label="Data do"
          value={endDate}
          onChange={onEndDateChange}
          error={error}
        />
      </div>
    </div>
  );
};

export { DatePicker, DateRangePicker };
export default DatePicker;
