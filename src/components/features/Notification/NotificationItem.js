/**
 * NotificationItem.js - Individual notification item component
 * Displays single notification with actions and formatting
 */

"use client";

import React, { useState } from "react";
import {
  CheckIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow, format } from "date-fns";
import {
  useMarkAsRead,
  useDeleteNotification,
} from "../../hooks/useNotifications";

const NotificationItem = ({
  notification,
  variant = "default", // default, compact, detailed
  showActions = true,
  showAvatar = true,
  showTimestamp = true,
  onClick,
  onMarkAsRead,
  onDelete,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Handle actions
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    try {
      if (onMarkAsRead) {
        onMarkAsRead();
      } else {
        await markAsReadMutation.mutateAsync(notification.id);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Delete this notification?")) {
      try {
        if (onDelete) {
          onDelete();
        } else {
          await deleteNotificationMutation.mutateAsync(notification.id);
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    }
  };

  // Get notification type styling
  const getTypeConfig = () => {
    const type = notification.type || "info";

    const configs = {
      success: {
        icon: CheckCircleIcon,
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      error: {
        icon: XCircleIcon,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      warning: {
        icon: ExclamationTriangleIcon,
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      info: {
        icon: InformationCircleIcon,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      alert: {
        icon: BellIcon,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      },
      price_alert: {
        icon: ChartBarIcon,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      },
      trading: {
        icon: CurrencyDollarIcon,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      system: {
        icon: ShieldCheckIcon,
        iconColor: "text-gray-500",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      },
      user: {
        icon: UserIcon,
        iconColor: "text-indigo-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
      },
    };

    return configs[type] || configs.info;
  };

  // Get priority styling
  const getPriorityConfig = () => {
    const priority = notification.priority || "medium";

    const configs = {
      high: {
        indicator: "bg-red-500",
        text: "text-red-700",
        bg: "bg-red-50",
      },
      medium: {
        indicator: "bg-yellow-500",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
      },
      low: {
        indicator: "bg-green-500",
        text: "text-green-700",
        bg: "bg-green-50",
      },
    };

    return configs[priority] || configs.medium;
  };

  const typeConfig = getTypeConfig();
  const priorityConfig = getPriorityConfig();
  const IconComponent = typeConfig.icon;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  // Compact variant
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
          !notification.isRead ? "bg-blue-50 border-l-2 border-blue-500" : ""
        } ${className}`}
      >
        <div className={`flex-shrink-0 p-1 rounded-full ${typeConfig.bgColor}`}>
          <IconComponent className={`h-4 w-4 ${typeConfig.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate ${
              !notification.isRead
                ? "font-medium text-gray-900"
                : "text-gray-700"
            }`}
          >
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>

        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
        )}
      </div>
    );
  }

  // Default and detailed variants
  return (
    <div
      className={`relative group transition-all duration-200 ${
        !notification.isRead
          ? `${typeConfig.bgColor} border-l-4 ${typeConfig.borderColor}`
          : "bg-white hover:bg-gray-50"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Priority indicator */}
      {notification.priority === "high" && (
        <div
          className={`absolute top-2 left-2 w-1 h-8 ${priorityConfig.indicator} rounded-full`}
        ></div>
      )}

      <div className={`p-4 ${notification.priority === "high" ? "ml-3" : ""}`}>
        <div className="flex items-start space-x-3">
          {/* Icon/Avatar */}
          {showAvatar && (
            <div
              className={`flex-shrink-0 p-2 rounded-full ${typeConfig.bgColor} ${typeConfig.borderColor} border`}
            >
              <IconComponent className={`h-5 w-5 ${typeConfig.iconColor}`} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title */}
                <h4
                  className={`text-sm ${
                    !notification.isRead
                      ? "font-semibold text-gray-900"
                      : "font-medium text-gray-800"
                  }`}
                >
                  {notification.title}

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </h4>

                {/* Message */}
                {notification.message && (
                  <div className="mt-1">
                    <p
                      className={`text-sm text-gray-600 ${
                        variant === "detailed" || isExpanded
                          ? ""
                          : "line-clamp-2"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {/* Expand/Collapse for long messages */}
                    {notification.message.length > 100 &&
                      variant !== "detailed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center space-x-4 mt-2">
                  {/* Timestamp */}
                  {showTimestamp && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  )}

                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.iconColor}`}
                  >
                    {notification.type || "info"}
                  </span>

                  {/* Priority badge */}
                  {notification.priority &&
                    notification.priority !== "medium" && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}
                      >
                        {notification.priority}
                      </span>
                    )}
                </div>

                {/* Action data */}
                {notification.actionData && variant === "detailed" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {typeof notification.actionData === "object"
                        ? JSON.stringify(notification.actionData, null, 2)
                        : notification.actionData}
                    </pre>
                  </div>
                )}

                {/* Action buttons */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick?.(notification);
                        }}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                          action.variant === "primary"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions menu */}
              {showActions && (
                <div className="flex-shrink-0 ml-4">
                  <div className="flex items-center space-x-1">
                    {/* Quick actions (always visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      {!notification.isRead && (
                        <button
                          onClick={handleMarkAsRead}
                          disabled={markAsReadMutation.isLoading}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={handleDelete}
                        disabled={deleteNotificationMutation.isLoading}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* More actions menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>

                      {showMenu && (
                        <>
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                            {!notification.isRead ? (
                              <button
                                onClick={handleMarkAsRead}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as read
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Mark as unread logic would go here
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Mark as unread
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Archive logic would go here
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Archive
                            </button>

                            <button
                              onClick={handleDelete}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(false);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {(markAsReadMutation.isLoading ||
          deleteNotificationMutation.isLoading) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification List Component
export const NotificationList = ({
  notifications = [],
  variant = "default",
  showActions = true,
  onNotificationClick,
  maxHeight = "400px",
  className = "",
}) => {
  if (notifications.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No notifications to display</p>
      </div>
    );
  }

  return (
    <div
      className={`divide-y divide-gray-200 overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          variant={variant}
          showActions={showActions}
          onClick={() => onNotificationClick?.(notification)}
        />
      ))}
    </div>
  );
};

// Notification Preview Component (for testing/development)
export const NotificationPreview = ({ notification, className = "" }) => {
  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900">
          Notification Preview
        </h4>
      </div>

      <NotificationItem
        notification={notification}
        variant="detailed"
        showActions={false}
        onClick={() =>
          console.log("Preview notification clicked:", notification)
        }
      />
    </div>
  );
};

export default NotificationItem;
