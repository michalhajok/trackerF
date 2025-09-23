import { cn } from "@/lib/utils";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 text-gray-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

const StatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    open: { variant: "success", text: "Otwarta" },
    closed: { variant: "default", text: "Zamknięta" },
    pending: { variant: "warning", text: "Oczekująca" },
    executed: { variant: "success", text: "Zrealizowana" },
    cancelled: { variant: "error", text: "Anulowana" },
    profit: { variant: "success", text: "Zysk" },
    loss: { variant: "error", text: "Strata" },
    breakeven: { variant: "default", text: "Bez zmian" },
  };

  const config = statusConfig[status] || { variant: "default", text: status };

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  );
};

export { Badge, StatusBadge };
export default Badge;
