/**
 * usePriceAlerts.js - Dedicated hook for price alerts management
 * Handles price monitoring, alert triggers, and notifications
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";
import { useMarketData, useBatchMarketData } from "./useMarketData";

const QUERY_KEYS = {
  priceAlerts: "price-alerts",
  activeAlerts: "active-price-alerts",
  alertHistory: "price-alert-history",
};

export const usePriceAlerts = (params = {}) => {
  const [filters, setFilters] = useState({
    status: "all", // all, active, triggered, expired
    type: "all", // all, above, below, change_percent
    symbol: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    ...params,
  });

  // Get all watchlists to extract alerts
  const { data: watchlistsData } = useQuery({
    queryKey: ["watchlists"],
    queryFn: () => apiEndpoints.watchlists.getAll(),
  });

  // Extract all alerts from watchlists
  const allAlerts = useMemo(() => {
    if (!watchlistsData?.data) return [];

    const alerts = [];
    watchlistsData.data.forEach((watchlist) => {
      watchlist.symbols?.forEach((symbol) => {
        symbol.priceAlerts?.forEach((alert) => {
          alerts.push({
            ...alert,
            watchlistId: watchlist._id,
            watchlistName: watchlist.name,
            symbol: symbol.symbol,
            currentPrice: symbol.currentPrice,
          });
        });
      });
    });

    return alerts;
  }, [watchlistsData]);

  // Apply filters
  const filteredAlerts = useMemo(() => {
    let filtered = [...allAlerts];

    if (filters.status !== "all") {
      filtered = filtered.filter((alert) => {
        if (filters.status === "active")
          return alert.isActive && !alert.isTriggered;
        if (filters.status === "triggered") return alert.isTriggered;
        if (filters.status === "expired") return !alert.isActive;
        return true;
      });
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((alert) => alert.type === filters.type);
    }

    if (filters.symbol) {
      filtered = filtered.filter((alert) =>
        alert.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];

      if (filters.sortOrder === "asc") {
        return new Date(aValue) - new Date(bValue);
      } else {
        return new Date(bValue) - new Date(aValue);
      }
    });

    return filtered;
  }, [allAlerts, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    alerts: filteredAlerts,
    totalAlerts: allAlerts.length,
    activeAlerts: allAlerts.filter((a) => a.isActive && !a.isTriggered).length,
    triggeredAlerts: allAlerts.filter((a) => a.isTriggered).length,
    filters,
    updateFilters,
  };
};

export const useCreatePriceAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, symbol, alertData }) =>
      apiEndpoints.watchlists.addPriceAlert(watchlistId, symbol, alertData),
    onSuccess: (_, { watchlistId }) => {
      queryClient.invalidateQueries(["watchlists"]);
      queryClient.invalidateQueries(["watchlist", watchlistId]);
      queryClient.invalidateQueries([QUERY_KEYS.priceAlerts]);
    },
  });
};

export const useDeletePriceAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, symbol, alertId }) =>
      apiEndpoints.watchlists.removePriceAlert(watchlistId, symbol, alertId),
    onSuccess: (_, { watchlistId }) => {
      queryClient.invalidateQueries(["watchlists"]);
      queryClient.invalidateQueries(["watchlist", watchlistId]);
      queryClient.invalidateQueries([QUERY_KEYS.priceAlerts]);
    },
  });
};

export const usePriceAlertMonitoring = (alerts = []) => {
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const checkIntervalRef = useRef(null);
  const queryClient = useQueryClient();

  // Get symbols for market data monitoring
  const symbols = useMemo(
    () => [...new Set(alerts.map((alert) => alert.symbol))],
    [alerts]
  );

  // Get batch market data for alert symbols
  const { data: marketData } = useBatchMarketData(symbols);

  // Check alerts against current prices
  const checkAlerts = useCallback(() => {
    if (!marketData || !alerts || alerts.length === 0) return;

    const newTriggeredAlerts = [];
    const now = new Date();

    alerts.forEach((alert) => {
      if (!alert.isActive || alert.isTriggered) return;

      const symbolData = marketData.find(
        (data) => data.symbol === alert.symbol
      );
      if (!symbolData) return;

      const currentPrice = symbolData.currentPrice || symbolData.price;
      if (!currentPrice) return;

      let isTriggered = false;
      let triggerMessage = "";

      switch (alert.type) {
        case "above":
          if (currentPrice >= alert.targetPrice) {
            isTriggered = true;
            triggerMessage = `${alert.symbol} reached ${currentPrice}, above your target of ${alert.targetPrice}`;
          }
          break;

        case "below":
          if (currentPrice <= alert.targetPrice) {
            isTriggered = true;
            triggerMessage = `${alert.symbol} dropped to ${currentPrice}, below your target of ${alert.targetPrice}`;
          }
          break;

        case "change_percent":
          const changePercent = Math.abs(symbolData.changePercent || 0);
          if (changePercent >= Math.abs(alert.changePercent)) {
            isTriggered = true;
            triggerMessage = `${alert.symbol} changed by ${symbolData.changePercent}%, exceeding your ${alert.changePercent}% threshold`;
          }
          break;
      }

      if (isTriggered) {
        const triggeredAlert = {
          ...alert,
          triggeredAt: now.toISOString(),
          triggeredPrice: currentPrice,
          message: triggerMessage,
        };

        newTriggeredAlerts.push(triggeredAlert);

        // Add to history
        setAlertHistory((prev) => [triggeredAlert, ...prev.slice(0, 99)]); // Keep last 100
      }
    });

    if (newTriggeredAlerts.length > 0) {
      setTriggeredAlerts((prev) => [...newTriggeredAlerts, ...prev]);

      // Show browser notifications if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        newTriggeredAlerts.forEach((alert) => {
          new Notification(`Price Alert: ${alert.symbol}`, {
            body: alert.message,
            icon: "/favicon.ico",
            tag: `price-alert-${alert._id}`,
          });
        });
      }

      // Invalidate watchlist queries to update alert status
      queryClient.invalidateQueries(["watchlists"]);
    }
  }, [alerts, marketData, queryClient]);

  // Start/stop monitoring
  const startMonitoring = useCallback(
    (interval = 30000) => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      checkIntervalRef.current = setInterval(checkAlerts, interval);
      console.log(`Started price alert monitoring with ${interval}ms interval`);
    },
    [checkAlerts]
  );

  const stopMonitoring = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
      console.log("Stopped price alert monitoring");
    }
  }, []);

  // Auto-start monitoring when there are active alerts
  useEffect(() => {
    const activeAlertCount = alerts.filter(
      (a) => a.isActive && !a.isTriggered
    ).length;

    if (activeAlertCount > 0) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return stopMonitoring;
  }, [alerts, startMonitoring, stopMonitoring]);

  const dismissAlert = useCallback((alertId) => {
    setTriggeredAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
  }, []);

  const clearHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "unsupported";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  return {
    triggeredAlerts,
    alertHistory,
    dismissAlert,
    clearHistory,
    startMonitoring,
    stopMonitoring,
    isMonitoring: !!checkIntervalRef.current,
    requestNotificationPermission,
  };
};

export const usePriceAlertBuilder = () => {
  const [alertConfig, setAlertConfig] = useState({
    type: "above", // above, below, change_percent
    targetPrice: "",
    changePercent: "",
    conditions: {
      timeframe: "1d", // 1h, 1d, 1w
      volume: null, // Minimum volume for trigger
      consecutive: false, // Require consecutive periods
      marketHours: true, // Only during market hours
    },
    notifications: {
      browser: true,
      email: false,
      sms: false,
    },
    expiration: {
      enabled: false,
      date: null,
      afterTrigger: true, // Expire after first trigger
    },
    notes: "",
  });

  const updateConfig = useCallback((updates) => {
    setAlertConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateConditions = useCallback((conditions) => {
    setAlertConfig((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, ...conditions },
    }));
  }, []);

  const updateNotifications = useCallback((notifications) => {
    setAlertConfig((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }));
  }, []);

  const updateExpiration = useCallback((expiration) => {
    setAlertConfig((prev) => ({
      ...prev,
      expiration: { ...prev.expiration, ...expiration },
    }));
  }, []);

  const validateAlert = useCallback(
    (symbol) => {
      const errors = [];

      if (!symbol) {
        errors.push("Symbol is required");
      }

      if (alertConfig.type === "above" || alertConfig.type === "below") {
        if (!alertConfig.targetPrice || alertConfig.targetPrice <= 0) {
          errors.push("Target price must be greater than 0");
        }
      }

      if (alertConfig.type === "change_percent") {
        if (
          !alertConfig.changePercent ||
          Math.abs(alertConfig.changePercent) < 0.1
        ) {
          errors.push("Change percent must be at least 0.1%");
        }
      }

      if (alertConfig.expiration.enabled && !alertConfig.expiration.date) {
        errors.push("Expiration date is required when expiration is enabled");
      }

      return errors;
    },
    [alertConfig]
  );

  const resetConfig = useCallback(() => {
    setAlertConfig({
      type: "above",
      targetPrice: "",
      changePercent: "",
      conditions: {
        timeframe: "1d",
        volume: null,
        consecutive: false,
        marketHours: true,
      },
      notifications: {
        browser: true,
        email: false,
        sms: false,
      },
      expiration: {
        enabled: false,
        date: null,
        afterTrigger: true,
      },
      notes: "",
    });
  }, []);

  const buildAlertData = useCallback(
    (symbol) => {
      return {
        type: alertConfig.type,
        targetPrice: parseFloat(alertConfig.targetPrice) || 0,
        changePercent: parseFloat(alertConfig.changePercent) || 0,
        conditions: alertConfig.conditions,
        notifications: alertConfig.notifications,
        expiration: alertConfig.expiration.enabled
          ? {
              date: alertConfig.expiration.date,
              afterTrigger: alertConfig.expiration.afterTrigger,
            }
          : null,
        notes: alertConfig.notes.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    },
    [alertConfig]
  );

  return {
    alertConfig,
    updateConfig,
    updateConditions,
    updateNotifications,
    updateExpiration,
    validateAlert,
    resetConfig,
    buildAlertData,
  };
};

export const useBulkPriceAlerts = () => {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const createBulkAlerts = useCallback(
    async (alertsData) => {
      setProcessing(true);

      try {
        const results = await Promise.allSettled(
          alertsData.map(({ watchlistId, symbol, alertData }) =>
            apiEndpoints.watchlists.addPriceAlert(
              watchlistId,
              symbol,
              alertData
            )
          )
        );

        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        queryClient.invalidateQueries(["watchlists"]);
        queryClient.invalidateQueries([QUERY_KEYS.priceAlerts]);

        return {
          success: true,
          successful,
          failed,
          results,
        };
      } catch (error) {
        console.error("Bulk alert creation failed:", error);
        return {
          success: false,
          error: error.message,
        };
      } finally {
        setProcessing(false);
      }
    },
    [queryClient]
  );

  const deleteBulkAlerts = useCallback(
    async (alertsToDelete) => {
      setProcessing(true);

      try {
        const results = await Promise.allSettled(
          alertsToDelete.map(({ watchlistId, symbol, alertId }) =>
            apiEndpoints.watchlists.removePriceAlert(
              watchlistId,
              symbol,
              alertId
            )
          )
        );

        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        queryClient.invalidateQueries(["watchlists"]);
        queryClient.invalidateQueries([QUERY_KEYS.priceAlerts]);

        return {
          success: true,
          successful,
          failed,
          results,
        };
      } catch (error) {
        console.error("Bulk alert deletion failed:", error);
        return {
          success: false,
          error: error.message,
        };
      } finally {
        setProcessing(false);
      }
    },
    [queryClient]
  );

  return {
    createBulkAlerts,
    deleteBulkAlerts,
    processing,
  };
};

export const usePriceAlertAnalytics = () => {
  const { alerts } = usePriceAlerts();

  const analytics = useMemo(() => {
    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter(
      (a) => a.isActive && !a.isTriggered
    ).length;
    const triggeredAlerts = alerts.filter((a) => a.isTriggered).length;
    const expiredAlerts = alerts.filter((a) => !a.isActive).length;

    // Type breakdown
    const typeBreakdown = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});

    // Symbol breakdown
    const symbolBreakdown = alerts.reduce((acc, alert) => {
      acc[alert.symbol] = (acc[alert.symbol] || 0) + 1;
      return acc;
    }, {});

    // Most watched symbols
    const mostWatched = Object.entries(symbolBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symbol, count]) => ({ symbol, count }));

    // Success rate
    const successRate =
      totalAlerts > 0 ? (triggeredAlerts / totalAlerts) * 100 : 0;

    // Recent activity
    const recentActivity = alerts
      .filter((a) => a.triggeredAt || a.createdAt)
      .sort(
        (a, b) =>
          new Date(b.triggeredAt || b.createdAt) -
          new Date(a.triggeredAt || a.createdAt)
      )
      .slice(0, 5);

    return {
      totalAlerts,
      activeAlerts,
      triggeredAlerts,
      expiredAlerts,
      successRate,
      typeBreakdown,
      symbolBreakdown,
      mostWatched,
      recentActivity,
    };
  }, [alerts]);

  return analytics;
};

export const usePriceAlertNotifications = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    browser: true,
    email: false,
    sound: true,
    vibration: true, // Mobile
    quiet: false, // Don't show notifications during quiet hours
    quietHours: { start: "22:00", end: "08:00" },
  });

  const [permissionStatus, setPermissionStatus] = useState("default");

  // Check current notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "unsupported";
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission;
  }, []);

  const showNotification = useCallback(
    (alert) => {
      if (!notificationSettings.browser || permissionStatus !== "granted") {
        return;
      }

      // Check quiet hours
      if (notificationSettings.quiet) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const quietStart = parseInt(
          notificationSettings.quietHours.start.replace(":", "")
        );
        const quietEnd = parseInt(
          notificationSettings.quietHours.end.replace(":", "")
        );

        if (quietStart > quietEnd) {
          // Quiet hours span midnight
          if (currentTime >= quietStart || currentTime <= quietEnd) {
            return;
          }
        } else {
          // Normal quiet hours
          if (currentTime >= quietStart && currentTime <= quietEnd) {
            return;
          }
        }
      }

      // Show browser notification
      const notification = new Notification(`Price Alert: ${alert.symbol}`, {
        body: alert.message,
        icon: "/favicon.ico",
        tag: `price-alert-${alert._id}`,
        requireInteraction: true,
      });

      // Play sound if enabled
      if (notificationSettings.sound) {
        try {
          const audio = new Audio("/sounds/alert.mp3"); // Add alert sound file
          audio.volume = 0.3;
          audio.play().catch((e) => console.log("Sound play failed:", e));
        } catch (error) {
          console.log("Could not play alert sound:", error);
        }
      }

      // Vibrate if supported and enabled
      if (notificationSettings.vibration && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      return notification;
    },
    [notificationSettings, permissionStatus]
  );

  const updateSettings = useCallback(
    (settings) => {
      setNotificationSettings((prev) => ({ ...prev, ...settings }));

      // Store settings in localStorage
      localStorage.setItem(
        "priceAlertNotifications",
        JSON.stringify({
          ...notificationSettings,
          ...settings,
        })
      );
    },
    [notificationSettings]
  );

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("priceAlertNotifications");
      if (stored) {
        const settings = JSON.parse(stored);
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.log("Could not load notification settings:", error);
    }
  }, []);

  return {
    notificationSettings,
    updateSettings,
    permissionStatus,
    requestPermission,
    showNotification,
  };
};

export default usePriceAlerts;
