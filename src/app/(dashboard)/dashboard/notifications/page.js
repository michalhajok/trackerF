/**
 * Notifications Page - Main notifications management page
 * /dashboard/notifications
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  BellIcon,
  FunnelIcon,
  CheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkMultipleNotificationsAsRead,
  useDeleteNotification,
} from "../../../hooks/useApi";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterType, setFilterType] = useState("all"); // all, unread, read
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, priority

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotifications({
    type: filterCategory !== "all" ? filterCategory : undefined,
    limit: 50,
  });

  const notifications = notificationsData?.data?.notifications || [];
  const totalCount = notificationsData?.data?.totalCount || 0;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markMultipleAsReadMutation = useMarkMultipleNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply type filter
    if (filterType === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filterType === "read") {
      filtered = filtered.filter((n) => n.isRead);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Sort notifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
          );
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [notifications, filterType, filterCategory, searchQuery, sortBy]);

  // Handle selection
  const handleSelectNotification = (id, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredNotifications.map((n) => n._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle actions
  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.size === 0) return;

    try {
      await markMultipleAsReadMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotificationMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.size} notification(s)?`
      )
    ) {
      try {
        await Promise.all(
          Array.from(selectedIds).map((id) =>
            deleteNotificationMutation.mutateAsync(id)
          )
        );
        setSelectedIds(new Set());
        refetch();
      } catch (error) {
        console.error("Failed to delete notifications:", error);
      }
    }
  };

  // Get notification icon and color
  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    switch (type) {
      case "success":
        return <CheckIcon className={`${iconClass} text-green-500`} />;
      case "warning":
        return <FunnelIcon className={`${iconClass} text-yellow-500`} />;
      case "error":
        return <TrashIcon className={`${iconClass} text-red-500`} />;
      case "info":
      default:
        return <BellIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      case "medium":
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatNotificationTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "just now";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-gray-600">
              {totalCount} total notifications ({unreadCount} unread)
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick actions for selected */}
            {selectedIds.size > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleMarkSelectedAsRead}
                  disabled={markMultipleAsReadMutation.isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  Mark as read
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleteNotificationMutation.isLoading}
                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}

            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="system">System</option>
            <option value="trading">Trading</option>
            <option value="account">Account</option>
            <option value="security">Security</option>
            <option value="marketing">Marketing</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-2">
              <BellIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-red-600">Failed to load notifications</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredNotifications.length === 0 && (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterType !== "all" || filterCategory !== "all"
                ? "Try adjusting your filters or search terms"
                : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* Notifications */}
        {!isLoading && !error && filteredNotifications.length > 0 && (
          <>
            {/* Select all header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Select all ({filteredNotifications.length})
                </label>
              </div>
            </div>

            {/* Notification items */}
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification._id)}
                      onChange={(e) =>
                        handleSelectNotification(
                          notification._id,
                          e.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h4>

                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}

                            {/* Priority badge */}
                            {notification.priority &&
                              notification.priority !== "medium" && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                                    notification.priority
                                  )}`}
                                >
                                  {notification.priority}
                                </span>
                              )}
                          </div>

                          <p
                            className={`mt-1 text-sm ${
                              !notification.isRead
                                ? "text-gray-600"
                                : "text-gray-500"
                            }`}
                          >
                            {notification.message}
                          </p>

                          {/* Metadata */}
                          <div className="mt-2 flex items-center text-xs text-gray-400 space-x-4">
                            <span>
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            {notification.category && (
                              <span className="capitalize">
                                {notification.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={markAsReadMutation.isLoading}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            disabled={deleteNotificationMutation.isLoading}
                            className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            title="Delete notification"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
