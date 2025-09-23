import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, options = {}) =>
      addToast({ type: "success", message, ...options }),
    error: (message, options = {}) =>
      addToast({ type: "error", message, ...options }),
    warning: (message, options = {}) =>
      addToast({ type: "warning", message, ...options }),
    info: (message, options = {}) =>
      addToast({ type: "info", message, ...options }),
    custom: (toast) => addToast(toast),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

// Toast Item
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 200); // Wait for animation
  };

  const variants = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: CheckCircleIcon,
      iconColor: "text-green-400",
      textColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: XCircleIcon,
      iconColor: "text-red-400",
      textColor: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-400",
      textColor: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: InformationCircleIcon,
      iconColor: "text-blue-400",
      textColor: "text-blue-800",
    },
  };

  const variant = variants[toast.type] || variants.info;
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        "transform transition-all duration-200 ease-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border",
        variant.bg
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-6 w-6", variant.iconColor)} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {toast.title && (
              <p className={cn("text-sm font-medium", variant.textColor)}>
                {toast.title}
              </p>
            )}
            <p
              className={cn(
                "text-sm",
                variant.textColor,
                toast.title && "mt-1"
              )}
            >
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={cn(
                "bg-transparent rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                variant.textColor
              )}
              onClick={handleRemove}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ToastItem };
export default Toast;
