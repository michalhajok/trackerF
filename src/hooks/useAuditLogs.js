/**
 * useAuditLogs.js - Dedicated hook for audit logs and security monitoring
 * Handles security analytics, compliance, and activity tracking
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const QUERY_KEYS = {
  auditLogs: "audit-logs",
  userActivity: "audit-user-activity",
  systemActivity: "audit-system-activity",
  suspicious: "audit-suspicious",
  failedLogins: "audit-failed-logins",
  byIP: "audit-by-ip",
  unusual: "audit-unusual",
};

export const useAuditLogs = (params = {}) => {
  const [filters, setFilters] = useState({
    action: "all",
    level: "all", // info, warning, error, critical
    userId: null,
    ipAddress: "",
    dateRange: { start: null, end: null },
    search: "",
    sortBy: "timestamp",
    sortOrder: "desc",
    ...params,
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.auditLogs, filters],
    queryFn: () => apiEndpoints.auditLogs.getAll(filters),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      action: "all",
      level: "all",
      userId: null,
      ipAddress: "",
      dateRange: { start: null, end: null },
      search: "",
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  }, []);

  return {
    ...query,
    filters,
    updateFilters,
    clearFilters,
    logs: query.data?.data || [],
    totalCount: query.data?.pagination?.totalCount || 0,
  };
};

export const useUserActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.userActivity, userId, params],
    queryFn: () => apiEndpoints.auditLogs.getUserActivity(userId, params),
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  });
};

export const useSystemActivity = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.systemActivity, params],
    queryFn: () => apiEndpoints.auditLogs.getSystemActivity(params),
    staleTime: 180000, // 3 minutes
    refetchInterval: 300000, // 5 minutes
  });
};

export const useSuspiciousActivities = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.suspicious, params],
    queryFn: () => apiEndpoints.auditLogs.getSuspicious(params),
    staleTime: 120000, // 2 minutes
    refetchInterval: 180000, // 3 minutes
  });
};

export const useFailedLogins = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.failedLogins, params],
    queryFn: () => apiEndpoints.auditLogs.getFailedLogins(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useLogsByIP = (ipAddress, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.byIP, ipAddress, params],
    queryFn: () => apiEndpoints.auditLogs.getByIP(ipAddress, params),
    enabled: !!ipAddress,
    staleTime: 300000, // 5 minutes
  });
};

export const useUnusualActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.unusual, userId, params],
    queryFn: () => apiEndpoints.auditLogs.detectUnusual(userId, params),
    enabled: !!userId,
    staleTime: 600000, // 10 minutes
  });
};

export const useExportComplianceLogs = () => {
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);

  const exportLogs = useCallback(async (exportParams) => {
    setExporting(true);

    try {
      const result = await apiEndpoints.auditLogs.exportCompliance(
        exportParams
      );

      if (result.success) {
        // Add to export history
        setExportHistory((prev) => [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            params: exportParams,
            status: "completed",
            downloadUrl: result.data?.downloadUrl,
          },
          ...prev,
        ]);

        // If download URL is provided, trigger download
        if (result.data?.downloadUrl) {
          const a = document.createElement("a");
          a.href = result.data.downloadUrl;
          a.download = `compliance-export-${
            new Date().toISOString().split("T")[0]
          }.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);

      setExportHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          params: exportParams,
          status: "failed",
          error: error.message,
        },
        ...prev,
      ]);

      return { success: false, error: error.message };
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportLogs,
    exporting,
    exportHistory,
  };
};

export const useSecurityAnalytics = (timeRange = "24h") => {
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    criticalAlerts: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    uniqueUsers: 0,
    uniqueIPs: 0,
    topActions: [],
    alertsByLevel: {},
    activityByHour: [],
    topCountries: [],
    riskScore: 0,
  });

  // Fetch various audit data
  const { data: logsData } = useAuditLogs({
    dateRange: getTimeRange(timeRange),
  });
  const { data: suspiciousData } = useSuspiciousActivities({
    timeRange,
  });
  const { data: failedLoginsData } = useFailedLogins({
    timeRange,
  });
  const { data: systemData } = useSystemActivity({
    timeRange,
  });

  useEffect(() => {
    if (logsData?.data) {
      const logs = logsData.data;
      const totalEvents = logs.length;

      // Count critical alerts
      const criticalAlerts = logs.filter(
        (log) => log.level === "critical" || log.level === "error"
      ).length;

      // Count failed logins
      const failedLogins = failedLoginsData?.data?.length || 0;

      // Count suspicious activities
      const suspiciousActivities = suspiciousData?.data?.length || 0;

      // Count unique users and IPs
      const uniqueUsers = new Set(logs.map((log) => log.userId).filter(Boolean))
        .size;
      const uniqueIPs = new Set(
        logs.map((log) => log.ipAddress).filter(Boolean)
      ).size;

      // Top actions
      const actionCounts = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});
      const topActions = Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      // Alerts by level
      const alertsByLevel = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {});

      // Activity by hour (last 24 hours)
      const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);
        const hourKey = hour.getHours();
        const count = logs.filter((log) => {
          const logHour = new Date(log.timestamp).getHours();
          return logHour === hourKey;
        }).length;
        return { hour: hourKey, count };
      }).reverse();

      // Calculate risk score (0-100)
      const riskFactors = {
        criticalAlerts: criticalAlerts * 10,
        failedLogins: failedLogins * 5,
        suspiciousActivities: suspiciousActivities * 15,
        unusualIPs: Math.max(0, uniqueIPs - 5) * 2, // Risk if more than 5 IPs
      };
      const riskScore = Math.min(
        100,
        Object.values(riskFactors).reduce((sum, factor) => sum + factor, 0)
      );

      setAnalytics({
        totalEvents,
        criticalAlerts,
        failedLogins,
        suspiciousActivities,
        uniqueUsers,
        uniqueIPs,
        topActions,
        alertsByLevel,
        activityByHour: hourlyActivity,
        topCountries: [], // Would be calculated from IP geolocation
        riskScore,
      });
    }
  }, [logsData, suspiciousData, failedLoginsData, systemData]);

  return analytics;
};

export const useSecurityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    failedLoginThreshold: 5,
    unusualIPAlert: true,
    multipleLocationAlert: true,
    afterHoursAlert: true,
    suspiciousActionAlert: true,
    criticalEventAlert: true,
  });

  const { data: recentLogs } = useAuditLogs({
    limit: 100,
    sortBy: "timestamp",
    sortOrder: "desc",
  });
  const { data: suspiciousData } = useSuspiciousActivities({
    limit: 50,
  });
  const { data: failedLoginsData } = useFailedLogins({
    limit: 50,
  });

  // Process alerts based on recent activity
  useEffect(() => {
    const newAlerts = [];

    // Check for critical events
    if (alertConfig.criticalEventAlert && recentLogs?.data) {
      const criticalEvents = recentLogs.data
        .filter((log) => log.level === "critical")
        .slice(0, 5);

      criticalEvents.forEach((event) => {
        newAlerts.push({
          id: `critical-${event._id}`,
          type: "critical",
          title: "Critical Security Event",
          message: `Critical action: ${event.action} by user ${event.userId}`,
          timestamp: event.timestamp,
          severity: "high",
          data: event,
        });
      });
    }

    // Check for failed login threshold
    if (alertConfig.failedLoginThreshold && failedLoginsData?.data) {
      const recentFailures = failedLoginsData.data.filter((failure) => {
        const failureTime = new Date(failure.timestamp);
        const hourAgo = new Date(Date.now() - 3600000);
        return failureTime > hourAgo;
      });

      if (recentFailures.length >= alertConfig.failedLoginThreshold) {
        newAlerts.push({
          id: "failed-logins-threshold",
          type: "authentication",
          title: "Multiple Failed Logins",
          message: `${recentFailures.length} failed login attempts in the last hour`,
          timestamp: new Date().toISOString(),
          severity: "medium",
          data: recentFailures,
        });
      }
    }

    // Check for suspicious activities
    if (alertConfig.suspiciousActionAlert && suspiciousData?.data) {
      const recentSuspicious = suspiciousData.data
        .filter((activity) => {
          const activityTime = new Date(activity.timestamp);
          const hourAgo = new Date(Date.now() - 3600000);
          return activityTime > hourAgo;
        })
        .slice(0, 3);

      recentSuspicious.forEach((activity) => {
        newAlerts.push({
          id: `suspicious-${activity._id}`,
          type: "suspicious",
          title: "Suspicious Activity Detected",
          message: `Unusual pattern detected for user ${activity.userId}`,
          timestamp: activity.timestamp,
          severity: "high",
          data: activity,
        });
      });
    }

    // Sort alerts by timestamp (newest first)
    newAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setAlerts(newAlerts);
  }, [recentLogs, suspiciousData, failedLoginsData, alertConfig]);

  const updateAlertConfig = useCallback((config) => {
    setAlertConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const markAsRead = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? { ...alert, read: true, readAt: new Date().toISOString() }
          : alert
      )
    );
  }, []);

  return {
    alerts,
    alertConfig,
    updateAlertConfig,
    dismissAlert,
    markAsRead,
    unreadCount: alerts.filter((alert) => !alert.read).length,
    criticalCount: alerts.filter((alert) => alert.severity === "high").length,
  };
};

export const useComplianceReporting = () => {
  const [reportConfig, setReportConfig] = useState({
    timeRange: "1M",
    includeUserActivity: true,
    includeSystemEvents: true,
    includeSecurityEvents: true,
    includeFailedLogins: true,
    format: "pdf", // pdf, csv, json
    groupBy: "user", // user, action, date
  });

  const generateComplianceReport = useCallback(async () => {
    const params = {
      ...reportConfig,
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await apiEndpoints.auditLogs.exportCompliance(params);
      return result;
    } catch (error) {
      console.error("Compliance report generation failed:", error);
      throw error;
    }
  }, [reportConfig]);

  const updateConfig = useCallback((updates) => {
    setReportConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    reportConfig,
    updateConfig,
    generateComplianceReport,
  };
};

export const useActivityMonitoring = (userId = null) => {
  const [monitoringConfig, setMonitoringConfig] = useState({
    realTimeUpdates: true,
    alertOnSuspicious: true,
    trackLocationChanges: true,
    trackDeviceChanges: true,
    sessionTimeout: 30, // minutes
  });

  const { data: userActivity } = useUserActivity(userId, {
    limit: 50,
    realTime: monitoringConfig.realTimeUpdates,
  });

  const { data: unusualActivity } = useUnusualActivity(userId);

  const activitySummary = useMemo(() => {
    if (!userActivity?.data) return null;

    const activities = userActivity.data;
    const sessions = groupActivitiesBySession(activities);
    const locations = getUniqueLocations(activities);
    const devices = getUniqueDevices(activities);

    return {
      totalActivities: activities.length,
      sessionsCount: sessions.length,
      uniqueLocations: locations.length,
      uniqueDevices: devices.length,
      lastActivity: activities[0]?.timestamp,
      mostCommonAction: getMostCommonAction(activities),
      riskLevel: calculateRiskLevel(activities, unusualActivity?.data),
    };
  }, [userActivity, unusualActivity]);

  const updateConfig = useCallback((config) => {
    setMonitoringConfig((prev) => ({ ...prev, ...config }));
  }, []);

  return {
    activitySummary,
    userActivity: userActivity?.data || [],
    unusualActivity: unusualActivity?.data || [],
    monitoringConfig,
    updateConfig,
  };
};

// Helper functions
function getTimeRange(timeRange) {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case "1h":
      start.setHours(end.getHours() - 1);
      break;
    case "24h":
      start.setDate(end.getDate() - 1);
      break;
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    default:
      start.setDate(end.getDate() - 1);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function groupActivitiesBySession(activities) {
  // Group activities by session (simplified)
  const sessions = {};
  activities.forEach((activity) => {
    const sessionId = activity.sessionId || "unknown";
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push(activity);
  });
  return Object.values(sessions);
}

function getUniqueLocations(activities) {
  return [
    ...new Set(
      activities.map((a) => a.location || a.ipAddress).filter(Boolean)
    ),
  ];
}

function getUniqueDevices(activities) {
  return [...new Set(activities.map((a) => a.userAgent).filter(Boolean))];
}

function getMostCommonAction(activities) {
  const actionCounts = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {});

  return (
    Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "unknown"
  );
}

function calculateRiskLevel(activities, unusualActivities) {
  let risk = 0;

  // High frequency of activities
  if (activities.length > 100) risk += 20;

  // Multiple locations
  const locations = getUniqueLocations(activities);
  if (locations.length > 3) risk += 30;

  // Unusual activities detected
  if (unusualActivities && unusualActivities.length > 0) risk += 50;

  // Recent failed attempts
  const recentFailures = activities.filter(
    (a) =>
      a.action.includes("failed") &&
      new Date(a.timestamp) > new Date(Date.now() - 3600000)
  );
  if (recentFailures.length > 3) risk += 40;

  if (risk >= 80) return "high";
  if (risk >= 40) return "medium";
  return "low";
}

export default useAuditLogs;
