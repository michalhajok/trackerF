/**
 * NotificationToast.js - Toast notification system
 * Displays temporary notifications with animations and auto-dismiss
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  BellIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useToastNotifications,
  useNotificationSettings,
  useDismissToast,
} from "../../hooks/useNotifications";

const NotificationToast = ({
  toast,
  position = "top-right", // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  onDismiss,
  enableSound = true,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const audioRef = useRef(null);

  const { data: settings } = useNotificationSettings();
  const dismissToastMutation = useDismissToast();

  // Animation and auto-dismiss setup
  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Play sound if enabled
    if (enableSound && settings?.soundEnabled && audioRef.current) {
      const volume = (settings.soundVolume || 50) / 100;
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.log("Sound play failed:", e));
    }

    // Auto-dismiss timer
    if (toast.autoDismiss !== false) {
      const duration = toast.duration || 5000; // 5 seconds default

      // Progress bar animation
      let startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(progressIntervalRef.current);
        }
      }, 16); // ~60fps

      // Auto dismiss
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [toast, enableSound, settings]);

  const handleDismiss = async () => {
    setIsLeaving(true);

    // Clear timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    try {
      // Mark as dismissed in backend
      await dismissToastMutation.mutateAsync(toast.id);
    } catch (error) {
      console.error("Failed to dismiss toast:", error);
    }

    // Wait for exit animation
    setTimeout(() => {
      onDismiss?.(toast.id);
    }, 300);
  };

  const handleAction = (action) => {
    action.onClick?.(toast);
    if (action.dismissOnClick !== false) {
      handleDismiss();
    }
  };

  // Get type configuration
  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: CheckCircleIcon,
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        accentColor: "bg-green-500",
      },
      error: {
        icon: XCircleIcon,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        accentColor: "bg-red-500",
      },
      warning: {
        icon: ExclamationTriangleIcon,
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        accentColor: "bg-yellow-500",
      },
      info: {
        icon: InformationCircleIcon,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        accentColor: "bg-blue-500",
      },
      notification: {
        icon: BellIcon,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        accentColor: "bg-purple-500",
      },
    };

    return configs[toast.type] || configs.info;
  };

  // Get position classes
  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 max-w-sm w-full";

    switch (position) {
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`;
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`;
      case "top-center":
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case "bottom-center":
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default: // top-right
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out";

    if (isLeaving) {
      switch (position) {
        case "top-left":
        case "bottom-left":
          return `${baseClasses} transform -translate-x-full opacity-0`;
        case "top-center":
        case "bottom-center":
          return `${baseClasses} transform -translate-y-full opacity-0 scale-95`;
        default: // top-right, bottom-right
          return `${baseClasses} transform translate-x-full opacity-0`;
      }
    }

    if (isVisible) {
      return `${baseClasses} transform translate-x-0 translate-y-0 opacity-100 scale-100`;
    }

    // Initial state
    switch (position) {
      case "top-left":
      case "bottom-left":
        return `${baseClasses} transform -translate-x-full opacity-0`;
      case "top-center":
      case "bottom-center":
        return `${baseClasses} transform -translate-y-8 opacity-0 scale-95`;
      default: // top-right, bottom-right
        return `${baseClasses} transform translate-x-full opacity-0`;
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  return (
    <>
      {/* Audio element for notification sound */}
      {enableSound && (
        <audio ref={audioRef} preload="auto" className="hidden">
          <source src="/sounds/toast.mp3" type="audio/mpeg" />
          <source src="/sounds/toast.wav" type="audio/wav" />
        </audio>
      )}

      <div
        className={`${getPositionClasses()} ${getAnimationClasses()} ${className}`}
      >
        <div
          className={`
          bg-white rounded-lg border shadow-lg overflow-hidden
          ${typeConfig.borderColor} ${typeConfig.bgColor}
        `}
        >
          {/* Progress bar */}
          {toast.autoDismiss !== false && (
            <div className="h-1 bg-gray-200">
              <div
                className={`h-full transition-all duration-75 linear ${typeConfig.accentColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                <IconComponent className={`h-6 w-6 ${typeConfig.iconColor}`} />
              </div>

              {/* Content */}
              <div className="ml-3 flex-1">
                {/* Title */}
                {toast.title && (
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {toast.title}
                  </h4>
                )}

                {/* Message */}
                <p className="text-sm text-gray-600">{toast.message}</p>

                {/* Actions */}
                {toast.actions && toast.actions.length > 0 && (
                  <div className="flex items-center space-x-3 mt-3">
                    {toast.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleAction(action)}
                        className={`text-sm font-medium transition-colors ${
                          action.variant === "primary"
                            ? `${typeConfig.iconColor} hover:opacity-80`
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sound toggle (if settings allow) */}
          {enableSound && settings?.allowSoundToggle && (
            <div className="absolute top-2 right-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle sound for this toast
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={
                  settings.soundEnabled ? "Sound enabled" : "Sound disabled"
                }
              >
                {settings.soundEnabled ? (
                  <SpeakerWaveIcon className="h-3 w-3" />
                ) : (
                  <SpeakerXMarkIcon className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Toast Container Component
export const ToastContainer = ({
  position = "top-right",
  maxToasts = 5,
  enableSound = true,
  className = "",
}) => {
  const { data: toasts = [], isLoading } = useToastNotifications({
    limit: maxToasts,
    autoRefresh: true,
  });

  const [displayedToasts, setDisplayedToasts] = useState([]);

  // Update displayed toasts when data changes
  useEffect(() => {
    setDisplayedToasts(toasts.slice(0, maxToasts));
  }, [toasts, maxToasts]);

  const handleDismissToast = (toastId) => {
    setDisplayedToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Stack positioning for multiple toasts
  const getStackOffset = (index) => {
    const offset = index * 8; // 8px offset per toast

    switch (position) {
      case "top-right":
      case "top-left":
      case "top-center":
        return { transform: `translateY(${index * 76 + offset}px)` };
      case "bottom-right":
      case "bottom-left":
      case "bottom-center":
        return { transform: `translateY(-${index * 76 + offset}px)` };
      default:
        return {};
    }
  };

  if (isLoading || displayedToasts.length === 0) {
    return null;
  }

  return (
    <div className={`pointer-events-none ${className}`}>
      {displayedToasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={getStackOffset(index)}
        >
          <NotificationToast
            toast={toast}
            position={position}
            onDismiss={handleDismissToast}
            enableSound={enableSound && index === 0} // Only first toast plays sound
          />
        </div>
      ))}
    </div>
  );
};

// Custom Toast Hook (for manual toast creation)
export const useToast = () => {
  const createToast = (toast) => {
    // This would integrate with your toast system
    console.log("Create toast:", toast);

    // Example implementation:
    // return toastManager.create(toast);
  };

  return {
    success: (message, options = {}) =>
      createToast({
        type: "success",
        message,
        ...options,
      }),
    error: (message, options = {}) =>
      createToast({
        type: "error",
        message,
        duration: options.duration || 8000, // Longer for errors
        ...options,
      }),
    warning: (message, options = {}) =>
      createToast({
        type: "warning",
        message,
        ...options,
      }),
    info: (message, options = {}) =>
      createToast({
        type: "info",
        message,
        ...options,
      }),
    notification: (message, options = {}) =>
      createToast({
        type: "notification",
        message,
        ...options,
      }),
    custom: (toast) => createToast(toast),
  };
};

// Toast variants for specific use cases
export const PriceAlertToast = ({ alert, onDismiss }) => {
  return (
    <NotificationToast
      toast={{
        id: `alert-${alert.id}`,
        type: "warning",
        title: "Price Alert Triggered",
        message: `${alert.symbol} has ${alert.condition} ${alert.targetPrice}`,
        actions: [
          {
            label: "View Chart",
            variant: "primary",
            onClick: () => {
              // Navigate to chart
              console.log("Navigate to chart for", alert.symbol);
            },
          },
          {
            label: "Manage Alerts",
            onClick: () => {
              // Open alerts management
              console.log("Open alerts management");
            },
          },
        ],
        duration: 10000, // 10 seconds for important alerts
      }}
      onDismiss={onDismiss}
    />
  );
};

export const TradingToast = ({ trade, onDismiss }) => {
  const isProfit = trade.pnl > 0;

  return (
    <NotificationToast
      toast={{
        id: `trade-${trade.id}`,
        type: isProfit ? "success" : "error",
        title: `Trade ${trade.status}`,
        message: `${trade.symbol}: ${isProfit ? "+" : ""}$${trade.pnl.toFixed(
          2
        )} P&L`,
        actions: [
          {
            label: "View Details",
            variant: "primary",
            onClick: () => {
              console.log("View trade details for", trade.id);
            },
          },
        ],
        duration: 8000,
      }}
      onDismiss={onDismiss}
    />
  );
};

export const SystemToast = ({ message, type = "info", onDismiss }) => {
  return (
    <NotificationToast
      toast={{
        id: `system-${Date.now()}`,
        type,
        title: "System Notification",
        message,
        duration: 6000,
      }}
      onDismiss={onDismiss}
    />
  );
};

export default NotificationToast;
