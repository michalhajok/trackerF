/**
 * Button Component - Fixed Color Classes
 * Compatible with current Tailwind config
 */

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled,
      loading,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      // ✅ POPRAWIONE - używa DEFAULT i hover z opacity
      primary:
        "bg-primary hover:bg-primary/90 focus:ring-primary text-white shadow-sm hover:shadow-md",

      secondary:
        "bg-secondary hover:bg-secondary/90 focus:ring-secondary text-white shadow-sm hover:shadow-md",

      success:
        "bg-success hover:bg-success/90 focus:ring-success text-white shadow-sm hover:shadow-md",

      error:
        "bg-error hover:bg-error/90 focus:ring-error text-white shadow-sm hover:shadow-md",

      warning:
        "bg-warning hover:bg-warning/90 focus:ring-warning text-white shadow-sm hover:shadow-md",

      // Outline variants
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 focus:ring-primary text-gray-700 shadow-sm",

      outlinePrimary:
        "border border-primary/30 bg-white hover:bg-primary/5 focus:ring-primary text-primary",

      // Ghost variants
      ghost:
        "bg-transparent hover:bg-gray-100 focus:ring-primary text-gray-700",

      ghostPrimary:
        "bg-transparent hover:bg-primary/10 focus:ring-primary text-primary",

      // Link variant
      link: "bg-transparent hover:underline focus:ring-primary text-primary hover:text-primary/80 p-0 h-auto shadow-none",
    };

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-lg",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 mr-2 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { Button };
