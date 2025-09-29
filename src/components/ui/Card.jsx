/**
 * Card Component - Modern Portfolio Manager Design
 * Clean, professional cards with proper shadows and spacing
 */

import React from "react";
import { cn } from "@/lib/utils";

const Card = ({
  children,
  className,
  variant = "default",
  padding = "default",
  hover = false,
  ...props
}) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-card",
    elevated: "bg-white border border-gray-200 shadow-lg",
    flat: "bg-white border border-gray-200",
    ghost: "bg-background-secondary border border-gray-100",
    success: "bg-success-50 border border-success-200",
    error: "bg-error-50 border border-error-200",
    warning: "bg-warning-50 border border-warning-200",
    info: "bg-info-50 border border-info-200",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variants[variant],
        paddings[padding],
        hover && "hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card sub-components for better organization
const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn("mb-6 pb-4 border-b border-gray-200", className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn("text-lg font-semibold text-text-primary", className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-text-secondary mt-1", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn(
      "mt-6 pt-4 border-t border-gray-200 flex items-center gap-3",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
export default Card;
