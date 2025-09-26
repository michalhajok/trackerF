/**
 * NotificationBell.js - Notification bell icon with unread badge
 * Main notification trigger with real-time updates and sound
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BellIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useNotifications,
  useMarkAllAsRead,
  useNotificationSettings,
  useRealTimeNotifications,
} from "../../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = ({
  showSettings = true,
  enableSound = true,
  enableBadge = true,
  maxBadgeCount = 99,
  position = "bottom-right", // bottom-right, bottom-left, top-right, top-left
  size = "default", // small, default, large
  variant = "default", // default, filled, minimal
  onNotificationClick,
  onSettingsClick,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  const bellRef = useRef(null);
  const audioRef = useRef(null);

  // Hooks
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useNotifications({
    includeRead: false,
    limit: 50,
  });

  const { data: settings } = useNotificationSettings();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Real-time notifications
  const { isConnected, lastNotification } = useRealTimeNotifications({
    onNewNotification: (notification) => {
      handleNewNotification(notification);
    },
    enabled: true,
  });

  // Calculate unread count
  const unreadCount = notifications?.data?.filter((n) => !n.isRead).length || 0;
  const displayCount =
    unreadCount > maxBadgeCount ? `${maxBadgeCount}+` : unreadCount;

  // Handle new notifications
  const handleNewNotification = (notification) => {
    if (notification.id === lastNotificationId) return;

    setLastNotificationId(notification.id);

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);

    // Play sound if enabled
    if (enableSound && settings?.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.log("Sound play failed:", e));
    }

    // Trigger callback
    onNotificationClick?.(notification);

    // Refetch to update count
    refetch();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          icon: "h-5 w-5",
          button: "p-2",
          badge: "h-4 w-4 text-xs",
          badgeOffset: "-top-1 -right-1",
        };
      case "large":
        return {
          icon: "h-7 w-7",
          button: "p-3",
          badge: "h-6 w-6 text-sm",
          badgeOffset: "-top-2 -right-2",
        };
      default:
        return {
          icon: "h-6 w-6",
          button: "p-2.5",
          badge: "h-5 w-5 text-xs",
          badgeOffset: "-top-1.5 -right-1.5",
        };
    }
  };

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case "filled":
        return unreadCount > 0
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-500 text-white hover:bg-gray-600";
      case "minimal":
        return "text-gray-600 hover:text-gray-900";
      default:
        return unreadCount > 0
          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
          : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100";
    }
  };

  // Dropdown position classes
  const getDropdownPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "top-full left-0 mt-2";
      case "top-right":
        return "bottom-full right-0 mb-2";
      case "top-left":
        return "bottom-full left-0 mb-2";
      default: // bottom-right
        return "top-full right-0 mt-2";
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <>
      {/* Audio element for notification sound */}
      {enableSound && (
        <audio ref={audioRef} preload="auto" className="hidden">
          <source src="/sounds/notification.mp3" type="audio/mpeg" />
          <source src="/sounds/notification.wav" type="audio/wav" />
        </audio>
      )}

      <div className={`relative ${className}`} ref={bellRef}>
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            relative ${
              sizeClasses.button
            } rounded-full transition-all duration-200 
            ${variantClasses}
            ${isAnimating ? "animate-bounce" : ""}
            ${isOpen ? "ring-2 ring-blue-500 ring-offset-2" : ""}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} unread)` : ""
          }`}
          title={`${unreadCount} unread notifications`}
        >
          {/* Bell Icon */}
          {unreadCount > 0 ? (
            <BellAlertIcon
              className={`${sizeClasses.icon} ${
                isAnimating ? "animate-pulse" : ""
              }`}
            />
          ) : (
            <BellIcon className={sizeClasses.icon} />
          )}

          {/* Unread Badge */}
          {enableBadge && unreadCount > 0 && (
            <span
              className={`
                absolute ${sizeClasses.badgeOffset} ${sizeClasses.badge}
                bg-red-500 text-white rounded-full flex items-center justify-center
                font-bold min-w-0 ring-2 ring-white
                ${isAnimating ? "animate-ping" : ""}
                ${unreadCount > maxBadgeCount ? "px-1" : ""}
              `}
              aria-hidden="true"
            >
              {displayCount}
            </span>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className={`absolute ${sizeClasses.badgeOffset}`}>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Real-time connection indicator */}
          {isConnected && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </button>

        {/* Quick Actions Overlay */}
        {isOpen && unreadCount > 0 && (
          <div className={`absolute ${sizeClasses.badgeOffset} z-20`}>
            <div className="flex items-center space-x-1">
              {/* Mark all as read */}
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
                className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-xs disabled:opacity-50"
                title="Mark all as read"
              >
                <CheckIcon className="h-3 w-3" />
              </button>

              {/* Settings */}
              {showSettings && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSettingsClick?.();
                  }}
                  className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors text-xs"
                  title="Notification settings"
                >
                  <Cog6ToothIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notification Dropdown */}
        {isOpen && (
          <div className={`absolute z-10 ${getDropdownPositionClasses()}`}>
            <NotificationDropdown
              notifications={notifications?.data || []}
              isLoading={isLoading}
              onClose={() => setIsOpen(false)}
              onNotificationClick={onNotificationClick}
              onMarkAllAsRead={handleMarkAllAsRead}
              onSettingsClick={showSettings ? onSettingsClick : undefined}
              maxHeight="400px"
            />
          </div>
        )}

        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-0 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
};

// Compact Notification Bell for smaller spaces
export const CompactNotificationBell = ({
  onNotificationClick,
  className = "",
}) => {
  const { data: notifications } = useNotifications({
    includeRead: false,
    limit: 10,
  });
  const unreadCount = notifications?.data?.filter((n) => !n.isRead).length || 0;

  return (
    <button
      onClick={onNotificationClick}
      className={`relative p-2 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      aria-label={`${unreadCount} unread notifications`}
    >
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

// Notification Bell with Custom Badge
export const CustomBadgeNotificationBell = ({
  badgeContent,
  badgeColor = "bg-red-500",
  onBellClick,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (badgeContent) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [badgeContent]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onBellClick}
        className={`p-2.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
          isAnimating ? "animate-bounce" : ""
        }`}
      >
        <BellIcon className="h-6 w-6" />
      </button>

      {badgeContent && (
        <div
          className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 ring-2 ring-white ${
            isAnimating ? "animate-ping" : ""
          }`}
        >
          {badgeContent}
        </div>
      )}
    </div>
  );
};

// Notification Bell with Status Indicator
export const StatusNotificationBell = ({
  status = "online", // online, offline, away, busy
  notifications = [],
  onBellClick,
  className = "",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onBellClick}
        className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="h-6 w-6" />

        {/* Status indicator */}
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-white`}
        ></div>

        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

// Notification Bell with Animation Types
export const AnimatedNotificationBell = ({
  animationType = "bounce", // bounce, shake, pulse, spin
  notifications = [],
  onBellClick,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  const getAnimationClass = () => {
    if (!isAnimating) return "";

    switch (animationType) {
      case "shake":
        return "animate-bounce";
      case "pulse":
        return "animate-pulse";
      case "spin":
        return "animate-spin";
      default:
        return "animate-bounce";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onBellClick}
        className={`p-2.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors ${getAnimationClass()}`}
      >
        <BellIcon className="h-6 w-6" />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-ping">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

// Notification Bell with Progress Ring
export const ProgressNotificationBell = ({
  progress = 0, // 0-100
  notifications = [],
  onBellClick,
  className = "",
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const circumference = 2 * Math.PI * 10; // radius = 10
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Progress ring */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          width="44"
          height="44"
        >
          <circle
            cx="22"
            cy="22"
            r="10"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <circle
            cx="22"
            cy="22"
            r="10"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>

        <button
          onClick={onBellClick}
          className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <BellIcon className="h-6 w-6" />
        </button>
      </div>

      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
