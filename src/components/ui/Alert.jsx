import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const Alert = ({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  ...props
}) => {
  const variants = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: CheckCircleIcon,
      iconColor: "text-green-400",
      titleColor: "text-green-800",
      textColor: "text-green-700",
      buttonColor: "text-green-500 hover:text-green-600 focus:ring-green-600",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700",
      buttonColor:
        "text-yellow-500 hover:text-yellow-600 focus:ring-yellow-600",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: XCircleIcon,
      iconColor: "text-red-400",
      titleColor: "text-red-800",
      textColor: "text-red-700",
      buttonColor: "text-red-500 hover:text-red-600 focus:ring-red-600",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: InformationCircleIcon,
      iconColor: "text-blue-400",
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
      buttonColor: "text-blue-500 hover:text-blue-600 focus:ring-blue-600",
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn("rounded-lg border p-4", config.container, className)}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn("text-sm font-medium", config.titleColor)}>
              {title}
            </h3>
          )}
          {children && (
            <div className={cn("text-sm", config.textColor, title && "mt-2")}>
              {children}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  config.buttonColor
                )}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
