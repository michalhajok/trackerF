/**
 * NotificationDropdown.js - Dropdown list of notifications
 * Advanced notification list with filtering, actions, and real-time updates
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useBulkNotificationActions,
} from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({
  notifications = [],
  isLoading = false,
  maxHeight = "400px",
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  onClose,
  onNotificationClick,
  onMarkAllAsRead,
  onSettingsClick,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, unread, alerts, system, trading
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, priority
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const bulkActionsMutation = useBulkNotificationActions();

  // Filter and sort notifications
  const processedNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.title?.toLowerCase().includes(query) ||
          notification.message?.toLowerCase().includes(query) ||
          notification.type?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((notification) => {
        switch (filterType) {
          case "unread":
            return !notification.isRead;
          case "alerts":
            return (
              notification.type === "alert" ||
              notification.type === "price_alert"
            );
          case "system":
            return (
              notification.type === "system" || notification.type === "security"
            );
          case "trading":
            return (
              notification.type === "trading" ||
              notification.type === "order" ||
              notification.type === "portfolio"
            );
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
          );
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [notifications, searchQuery, filterType, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const alerts = notifications.filter(
      (n) => n.type === "alert" || n.type === "price_alert"
    ).length;
    const system = notifications.filter((n) => n.type === "system").length;

    return { total, unread, alerts, system };
  }, [notifications]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === processedNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedNotifications.map((n) => n.id)));
    }
  };

  const handleSelectNotification = (id, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Action handlers
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;

    try {
      const notificationIds = Array.from(selectedIds);

      switch (action) {
        case "mark_read":
          await bulkActionsMutation.mutateAsync({
            action: "mark_read",
            notificationIds,
          });
          break;
        case "mark_unread":
          await bulkActionsMutation.mutateAsync({
            action: "mark_unread",
            notificationIds,
          });
          break;
        case "delete":
          if (confirm(`Delete ${notificationIds.length} notifications?`)) {
            await bulkActionsMutation.mutateAsync({
              action: "delete",
              notificationIds,
            });
          }
          break;
        case "archive":
          await bulkActionsMutation.mutateAsync({
            action: "archive",
            notificationIds,
          });
          break;
      }

      setSelectedIds(new Set());
      setShowBulkMenu(false);
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const getFilterTypeCount = (type) => {
    switch (type) {
      case "unread":
        return stats.unread;
      case "alerts":
        return stats.alerts;
      case "system":
        return stats.system;
      case "trading":
        return notifications.filter(
          (n) =>
            n.type === "trading" || n.type === "order" || n.type === "portfolio"
        ).length;
      default:
        return stats.total;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-w-full ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {stats.unread > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.unread} new
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onSettingsClick && (
              <button
                onClick={() => {
                  onClose?.();
                  onSettingsClick();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Notification settings"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <span>{stats.total} total</span>
          <span>{stats.unread} unread</span>
          <span>{stats.alerts} alerts</span>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="px-4 py-3 border-b border-gray-200 space-y-3">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search notifications..."
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All ({getFilterTypeCount("all")})</option>
                  <option value="unread">
                    Unread ({getFilterTypeCount("unread")})
                  </option>
                  <option value="alerts">
                    Alerts ({getFilterTypeCount("alerts")})
                  </option>
                  <option value="system">
                    System ({getFilterTypeCount("system")})
                  </option>
                  <option value="trading">
                    Trading ({getFilterTypeCount("trading")})
                  </option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedIds.size > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedIds.size} selected
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("mark_read")}
                disabled={bulkActionsMutation.isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Mark Read
              </button>

              <button
                onClick={() => handleBulkAction("delete")}
                disabled={bulkActionsMutation.isLoading}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Delete
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>

                {showBulkMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => handleBulkAction("mark_unread")}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark Unread
                    </button>
                    <button
                      onClick={() => handleBulkAction("archive")}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : processedNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== "all"
                ? "No matching notifications"
                : "No notifications"}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "You're all caught up! New notifications will appear here."}
            </p>

            {(searchQuery || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Select All */}
            {showBulkActions && processedNotifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size > 0 &&
                      selectedIds.size === processedNotifications.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Select all ({processedNotifications.length})
                  </span>
                </label>
              </div>
            )}

            {/* Notification Items */}
            {processedNotifications.map((notification) => (
              <div key={notification.id} className="relative">
                {showBulkActions && (
                  <div className="absolute left-4 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={(e) =>
                        handleSelectNotification(
                          notification.id,
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <NotificationItem
                  notification={notification}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                    onNotificationClick?.(notification);
                  }}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDeleteNotification(notification.id)}
                  showActions={true}
                  className={`${showBulkActions ? "pl-12" : ""} ${
                    selectedIds.has(notification.id) ? "bg-blue-50" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {processedNotifications.length} of {notifications.length} shown
          </div>

          <div className="flex items-center space-x-3">
            {stats.unread > 0 && onMarkAllAsRead && (
              <button
                onClick={() => {
                  onMarkAllAsRead();
                  setSelectedIds(new Set());
                }}
                disabled={markAllAsReadMutation.isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {markAllAsReadMutation.isLoading
                  ? "Marking..."
                  : "Mark All Read"}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Last updated */}
        {notifications.length > 0 && (
          <div className="text-xs text-gray-500 text-center mt-2">
            Last updated {formatDistanceToNow(new Date(), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Notification Dropdown for smaller spaces
export const CompactNotificationDropdown = ({
  notifications = [],
  onClose,
  onNotificationClick,
  className = "",
}) => {
  const unreadNotifications = notifications
    .filter((n) => !n.isRead)
    .slice(0, 5);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 w-80 ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Recent Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick?.(notification)}
                variant="compact"
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              /* Open full notifications */
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all {notifications.length} notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
