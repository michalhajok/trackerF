/**
 * useNotifications.js - Dedicated hook for notifications management
 * Handles all notification-related operations with optimistic updates
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const QUERY_KEYS = {
  notifications: "notifications",
  notification: "notification",
  unread: "notifications-unread",
  byType: "notifications-by-type",
};

export const useNotifications = (params = {}) => {
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    priority: "all",
    isRead: null,
    ...params,
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.notifications, filters],
    queryFn: () => apiEndpoints.notifications.getAll(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      category: "all",
      priority: "all",
      isRead: null,
    });
  }, []);

  return {
    ...query,
    filters,
    updateFilters,
    clearFilters,
    notifications: query.data?.data?.notifications || [],
    totalCount: query.data?.data?.totalCount || 0,
    unreadCount: query.data?.data?.unreadCount || 0,
  };
};

export const useNotification = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.notification, id],
    queryFn: () => apiEndpoints.notifications.getById(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

export const useUnreadNotifications = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.unread, params],
    queryFn: () => apiEndpoints.notifications.getUnread(params),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 15000, // 15 seconds
  });
};

export const useNotificationsByType = (type, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.byType, type, params],
    queryFn: () => apiEndpoints.notifications.getByType(type, params),
    enabled: !!type && type !== "all",
    staleTime: 60000, // 1 minute
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.create,
    onSuccess: (newNotification) => {
      // Optimistic update - add to cache
      queryClient.setQueryData([QUERY_KEYS.notifications], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications: [
              newNotification.data,
              ...(oldData.data?.notifications || []),
            ],
            totalCount: (oldData.data?.totalCount || 0) + 1,
            unreadCount: (oldData.data?.unreadCount || 0) + 1,
          },
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries([QUERY_KEYS.notifications]);
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.markAsRead,
    onMutate: async (notificationId) => {
      // Optimistic update
      const queryKey = [QUERY_KEYS.notifications];
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications:
              oldData.data?.notifications?.map((notification) =>
                notification._id === notificationId
                  ? {
                      ...notification,
                      isRead: true,
                      readAt: new Date().toISOString(),
                    }
                  : notification
              ) || [],
            unreadCount: Math.max((oldData.data?.unreadCount || 1) - 1, 0),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.notifications],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.notifications]);
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    },
  });
};

export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.markMultipleAsRead,
    onMutate: async (notificationIds) => {
      const queryKey = [QUERY_KEYS.notifications];
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        const readCount = notificationIds.length;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications:
              oldData.data?.notifications?.map((notification) =>
                notificationIds.includes(notification._id)
                  ? {
                      ...notification,
                      isRead: true,
                      readAt: new Date().toISOString(),
                    }
                  : notification
              ) || [],
            unreadCount: Math.max(
              (oldData.data?.unreadCount || readCount) - readCount,
              0
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.notifications],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.notifications]);
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.delete,
    onMutate: async (notificationId) => {
      const queryKey = [QUERY_KEYS.notifications];
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        const notificationToDelete = oldData.data?.notifications?.find(
          (n) => n._id === notificationId
        );
        const wasUnread = notificationToDelete && !notificationToDelete.isRead;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            notifications:
              oldData.data?.notifications?.filter(
                (n) => n._id !== notificationId
              ) || [],
            totalCount: Math.max((oldData.data?.totalCount || 1) - 1, 0),
            unreadCount: wasUnread
              ? Math.max((oldData.data?.unreadCount || 1) - 1, 0)
              : oldData.data?.unreadCount || 0,
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [QUERY_KEYS.notifications],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.notifications]);
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    },
  });
};

export const useRecordNotificationClick = () => {
  return useMutation({
    mutationFn: apiEndpoints.notifications.recordClick,
    // No need to update UI for analytics tracking
  });
};

export const useCreateSystemNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.createSystem,
    onSuccess: () => {
      // Invalidate all notification queries since system notifications affect all users
      queryClient.invalidateQueries([QUERY_KEYS.notifications]);
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    },
  });
};

export const useNotificationAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    readRate: 0,
    clickRate: 0,
    typeBreakdown: {},
    priorityBreakdown: {},
    categoryBreakdown: {},
  });

  const { data: notificationsData } = useNotifications();

  useEffect(() => {
    if (notificationsData?.data) {
      const notifications = notificationsData.data.notifications || [];
      const totalNotifications = notifications.length;
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      const readCount = totalNotifications - unreadCount;
      const clickedCount = notifications.filter((n) => n.clickCount > 0).length;

      // Calculate breakdowns
      const typeBreakdown = {};
      const priorityBreakdown = {};
      const categoryBreakdown = {};

      notifications.forEach((notification) => {
        // Type breakdown
        typeBreakdown[notification.type] =
          (typeBreakdown[notification.type] || 0) + 1;

        // Priority breakdown
        priorityBreakdown[notification.priority] =
          (priorityBreakdown[notification.priority] || 0) + 1;

        // Category breakdown
        categoryBreakdown[notification.category] =
          (categoryBreakdown[notification.category] || 0) + 1;
      });

      setAnalytics({
        totalNotifications,
        unreadCount,
        readRate:
          totalNotifications > 0 ? (readCount / totalNotifications) * 100 : 0,
        clickRate:
          totalNotifications > 0
            ? (clickedCount / totalNotifications) * 100
            : 0,
        typeBreakdown,
        priorityBreakdown,
        categoryBreakdown,
      });
    }
  }, [notificationsData]);

  return analytics;
};

// Real-time notification hook (can be extended with WebSocket)
export const useRealTimeNotifications = (enabled = true) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // For now, use polling. Can be replaced with WebSocket later
    const interval = setInterval(() => {
      queryClient.invalidateQueries([QUERY_KEYS.unread]);
    }, 30000); // 30 seconds

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [enabled, queryClient]);

  // Mock WebSocket connection methods (for future implementation)
  const connect = useCallback(() => {
    setIsConnected(true);
    // TODO: Implement WebSocket connection
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    // TODO: Implement WebSocket disconnection
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
  };
};

export default useNotifications;
