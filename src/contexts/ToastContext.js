/**
 * Toast Context
 * Simple toast notifications using Context API
 */

"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods
  const toast = useCallback(
    (message, options = {}) => {
      return addToast({ message, ...options });
    },
    [addToast]
  );

  const success = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "success", ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "error", duration: 7000, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "warning", ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "info", ...options });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  console.log("Rendering ToastContainer with toasts:", toasts);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

// Individual Toast Component
function ToastItem({ toast }) {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    const baseStyles =
      "p-4 rounded-lg shadow-lg border flex items-center gap-3 min-w-80 max-w-md animate-slide-up";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-success-50 border-success-200 text-success-800`;
      case "error":
        return `${baseStyles} bg-error-50 border-error-200 text-error-800`;
      case "warning":
        return `${baseStyles} bg-warning-50 border-warning-200 text-warning-800`;
      default:
        return `${baseStyles} bg-white border-slate-200 text-slate-800`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={getToastStyles()}>
      <span className="text-lg">{getIcon()}</span>
      <div className="flex-1">
        {toast.title && (
          <div className="font-semibold mb-1">{toast.message.title}</div>
        )}
        <div className="text-sm">{toast.message.description}</div>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-600 ml-2"
      >
        ✕
      </button>
    </div>
  );
}

// Custom hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export default ToastContext;
