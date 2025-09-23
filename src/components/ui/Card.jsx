import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef(
  (
    { className, children, padding = "default", hover = false, ...props },
    ref
  ) => {
    const paddings = {
      none: "",
      sm: "p-3",
      default: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gray-200 bg-white shadow-sm",
          hover && "hover:shadow-md transition-shadow duration-200",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn("text-lg font-semibold text-slate-900", className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-slate-600", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={cn("pt-0", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("flex items-center pt-6", className)} {...props}>
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
