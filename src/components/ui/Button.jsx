/**
 * Button Component - Professional Design with New Colors
 * Beautiful, accessible, and consistent styling
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
      // Primary - Professional blue
      primary:
        "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 text-white shadow-sm hover:shadow-md",

      // Secondary - Elegant purple
      secondary:
        "bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-500 text-white shadow-sm hover:shadow-md",

      // Success - Fresh green
      success:
        "bg-success-500 hover:bg-success-600 focus:ring-success-500 text-white shadow-sm hover:shadow-md",

      // Error - Clear red
      error:
        "bg-error-500 hover:bg-error-600 focus:ring-error-500 text-white shadow-sm hover:shadow-md",

      // Warning - Vibrant orange
      warning:
        "bg-warning-500 hover:bg-warning-600 focus:ring-warning-500 text-white shadow-sm hover:shadow-md",

      // Outline variants - Modern & clean
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 focus:ring-primary-500 text-gray-700 shadow-sm",
      outlinePrimary:
        "border border-primary-300 bg-white hover:bg-primary-50 focus:ring-primary-500 text-primary-700",

      // Ghost variants - Subtle
      ghost:
        "bg-transparent hover:bg-gray-100 focus:ring-primary-500 text-gray-700",
      ghostPrimary:
        "bg-transparent hover:bg-primary-50 focus:ring-primary-500 text-primary-600",

      // Link variant
      link: "bg-transparent hover:underline focus:ring-primary-500 text-primary-600 hover:text-primary-700 p-0 h-auto shadow-none",
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
