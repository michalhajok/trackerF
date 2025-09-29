/**
 * useActivity.js - Dedicated hook for user activity tracking and analytics
 * Handles activity monitoring, session management, and behavior analysis
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserActivity, useAuditLogs } from "./useApi";

const ACTIVITY_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
  SEARCH: "search",
  NAVIGATION: "navigation",
};

export const useActivity = (userId = null, options = {}) => {
  const {
    timeRange = "7d",
    includeSystemEvents = false,
    trackRealTime = false,
    autoRefresh = true,
  } = options;

  const [localActivity, setLocalActivity] = useState([]);
  const [sessionData, setSessionData] = useState({
    currentSession: null,
    sessionDuration: 0,
    actionsInSession: 0,
    startTime: null,
  });

  // Fetch user activity from audit logs
  const {
    data: userActivityData,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useUserActivity(userId, {
    timeRange,
    limit: 500,
    includeSystem: includeSystemEvents,
  });

  // Fetch general audit logs if no specific user
  const {
    logs: auditLogs,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useAuditLogs({
    dateRange: getDateRange(timeRange),
    limit: 500,
  });

  const activities = userId ? userActivityData?.data || [] : auditLogs || [];
  const isLoading = userId ? activityLoading : auditLoading;

  // Process activity data
  const processedActivity = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    return activities
      .map((activity) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
        duration: activity.duration || calculateActivityDuration(activity),
        category: categorizeActivity(activity.action),
        risk: assessActivityRisk(activity),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activities]);

  // Activity analytics
  const analytics = useMemo(() => {
    if (processedActivity.length === 0) {
      return {
        totalActivities: 0,
        uniqueSessions: 0,
        averageSessionDuration: 0,
        mostActiveHours: [],
        actionBreakdown: {},
        locationBreakdown: {},
        deviceBreakdown: {},
        riskScore: 0,
      };
    }

    // Group by session
    const sessions = groupActivitiesBySession(processedActivity);
    const sessionDurations = sessions.map((session) =>
      calculateSessionDuration(session)
    );
    const averageSessionDuration =
      sessionDurations.reduce((sum, duration) => sum + duration, 0) /
      sessions.length;

    // Activity by hour
    const hourlyActivity = Array.from({ length: 24 }, () => 0);
    processedActivity.forEach((activity) => {
      const hour = activity.timestamp.getHours();
      hourlyActivity[hour]++;
    });

    const mostActiveHours = hourlyActivity
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Action breakdown
    const actionBreakdown = processedActivity.reduce((acc, activity) => {
      const category = activity.category || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Location breakdown
    const locationBreakdown = processedActivity.reduce((acc, activity) => {
      const location = activity.location || activity.ipAddress || "unknown";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    // Device breakdown
    const deviceBreakdown = processedActivity.reduce((acc, activity) => {
      const device = parseUserAgent(activity.userAgent);
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // Calculate risk score
    const riskFactors = {
      multipleLocations: Object.keys(locationBreakdown).length > 3 ? 20 : 0,
      multipleDevices: Object.keys(deviceBreakdown).length > 3 ? 15 : 0,
      offHoursActivity:
        (hourlyActivity
          .slice(0, 8)
          .concat(hourlyActivity.slice(20))
          .reduce((sum, count) => sum + count, 0) /
          processedActivity.length) *
        30,
      suspiciousActions:
        processedActivity.filter((a) => a.risk === "high").length * 10,
    };

    const riskScore = Object.values(riskFactors).reduce(
      (sum, factor) => sum + factor,
      0
    );

    return {
      totalActivities: processedActivity.length,
      uniqueSessions: sessions.length,
      averageSessionDuration,
      mostActiveHours,
      actionBreakdown,
      locationBreakdown,
      deviceBreakdown,
      riskScore: Math.min(100, riskScore),
    };
  }, [processedActivity]);

  // Track current session
  useEffect(() => {
    if (trackRealTime && typeof window !== "undefined") {
      const sessionStart = Date.now();
      let actionsCount = 0;

      setSessionData({
        currentSession: sessionStart,
        startTime: new Date().toISOString(),
        sessionDuration: 0,
        actionsInSession: 0,
      });

      // Track page visibility
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setSessionData((prev) => ({
            ...prev,
            lastActivity: new Date().toISOString(),
          }));
        }
      };

      // Track user interactions
      const trackAction = (actionType, details = {}) => {
        actionsCount++;
        const activity = {
          action: actionType,
          timestamp: new Date().toISOString(),
          details,
          sessionId: sessionStart,
        };

        setLocalActivity((prev) => [activity, ...prev.slice(0, 99)]); // Keep last 100
        setSessionData((prev) => ({
          ...prev,
          actionsInSession: actionsCount,
          sessionDuration: Date.now() - sessionStart,
        }));
      };

      // Update session duration periodically
      const durationInterval = setInterval(() => {
        setSessionData((prev) => ({
          ...prev,
          sessionDuration: Date.now() - sessionStart,
        }));
      }, 1000);

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Global activity tracking
      if (window.trackUserActivity) {
        window.trackUserActivity = trackAction;
      } else {
        window.trackUserActivity = trackAction;
      }

      return () => {
        clearInterval(durationInterval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [trackRealTime]);

  // Manual activity tracking
  const trackActivity = useCallback((action, details = {}) => {
    if (typeof window !== "undefined" && window.trackUserActivity) {
      window.trackUserActivity(action, details);
    }
  }, []);

  // Get activity summary for date range
  const getActivitySummary = useCallback(
    (days = 7) => {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const recentActivities = processedActivity.filter(
        (activity) => activity.timestamp > cutoff
      );

      return {
        totalActivities: recentActivities.length,
        dailyAverage: recentActivities.length / days,
        mostCommonAction: getMostCommonAction(recentActivities),
        mostActiveDay: getMostActiveDay(recentActivities),
        activityTrend: calculateActivityTrend(recentActivities, days),
      };
    },
    [processedActivity]
  );

  // Get activity by date
  const getActivityByDate = useCallback(
    (date) => {
      const targetDate = new Date(date);
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      return processedActivity.filter(
        (activity) =>
          activity.timestamp >= startOfDay && activity.timestamp < endOfDay
      );
    },
    [processedActivity]
  );

  return {
    // Data
    activities: processedActivity,
    localActivity,
    sessionData,
    analytics,

    // State
    isLoading,

    // Actions
    trackActivity,
    refetchActivity: userId ? refetchActivity : refetchAudit,
    getActivitySummary,
    getActivityByDate,

    // Utilities
    totalActivities: processedActivity.length,
    recentActivity: processedActivity.slice(0, 10),
    isTrackingSession: trackRealTime && sessionData.currentSession !== null,
  };
};

export const useActivityHeatmap = (activities = [], options = {}) => {
  const { timeZone = "UTC", weekStartsOnMonday = true } = options;

  const heatmapData = useMemo(() => {
    const data = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const hour = date.getHours();

      if (!data[dateKey]) {
        data[dateKey] = Array.from({ length: 24 }, () => 0);
      }

      data[dateKey][hour]++;
    });

    return data;
  }, [activities]);

  const maxActivity = useMemo(() => {
    return Math.max(...Object.values(heatmapData).flat());
  }, [heatmapData]);

  const getIntensity = useCallback(
    (date, hour) => {
      const dateKey = date.toISOString().split("T")[0];
      const activity = heatmapData[dateKey]?.[hour] || 0;
      return maxActivity > 0 ? activity / maxActivity : 0;
    },
    [heatmapData, maxActivity]
  );

  return {
    heatmapData,
    maxActivity,
    getIntensity,
  };
};

export const useSessionTracking = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const startSession = useCallback((sessionInfo = {}) => {
    const session = {
      id: generateSessionId(),
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      activities: [],
      location: sessionInfo.location,
      userAgent: sessionInfo.userAgent || navigator.userAgent,
      ipAddress: sessionInfo.ipAddress,
      isActive: true,
    };

    setCurrentSession(session);
    setSessions((prev) => [session, ...prev.slice(0, 19)]); // Keep last 20 sessions

    return session.id;
  }, []);

  const endSession = useCallback(
    (sessionId) => {
      const endTime = new Date().toISOString();

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                endTime,
                duration: new Date(endTime) - new Date(session.startTime),
                isActive: false,
              }
            : session
        )
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    },
    [currentSession]
  );

  const addActivityToSession = useCallback((sessionId, activity) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              activities: [...session.activities, activity],
            }
          : session
      )
    );
  }, []);

  return {
    sessions,
    currentSession,
    startSession,
    endSession,
    addActivityToSession,
    hasActiveSession: currentSession !== null,
  };
};

// Helper functions
function getDateRange(timeRange) {
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
      start.setDate(end.getDate() - 7);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function calculateActivityDuration(activity) {
  // Estimate duration based on activity type
  const durationMap = {
    login: 10000, // 10 seconds
    view: 30000, // 30 seconds
    create: 120000, // 2 minutes
    update: 90000, // 1.5 minutes
    delete: 5000, // 5 seconds
    export: 60000, // 1 minute
  };

  return durationMap[activity.action] || 30000; // Default 30 seconds
}

function categorizeActivity(action) {
  if (action.includes("login") || action.includes("auth"))
    return "authentication";
  if (action.includes("view") || action.includes("get")) return "viewing";
  if (action.includes("create") || action.includes("add")) return "creation";
  if (action.includes("update") || action.includes("edit"))
    return "modification";
  if (action.includes("delete") || action.includes("remove")) return "deletion";
  if (action.includes("export") || action.includes("download")) return "export";
  if (action.includes("search") || action.includes("filter")) return "search";
  return "other";
}

function assessActivityRisk(activity) {
  // High risk activities
  if (
    activity.action.includes("delete") ||
    activity.action.includes("export") ||
    activity.level === "critical"
  ) {
    return "high";
  }

  // Medium risk activities
  if (
    activity.action.includes("update") ||
    activity.action.includes("admin") ||
    activity.level === "warning"
  ) {
    return "medium";
  }

  return "low";
}

function groupActivitiesBySession(activities) {
  const sessions = {};

  activities.forEach((activity) => {
    const sessionId = activity.sessionId || estimateSessionId(activity);
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push(activity);
  });

  return Object.values(sessions);
}

function estimateSessionId(activity) {
  // Simple session estimation based on user, IP, and time proximity
  const userId = activity.userId || "anonymous";
  const ip = activity.ipAddress || "unknown";
  const hour = Math.floor(
    new Date(activity.timestamp).getTime() / (1000 * 60 * 60)
  );

  return `${userId}-${ip}-${hour}`;
}

function calculateSessionDuration(sessionActivities) {
  if (sessionActivities.length < 2) return 0;

  const sorted = sessionActivities.sort((a, b) => a.timestamp - b.timestamp);
  const start = sorted[0].timestamp;
  const end = sorted[sorted.length - 1].timestamp;

  return end.getTime() - start.getTime();
}

function getMostCommonAction(activities) {
  const actionCounts = activities.reduce((acc, activity) => {
    const category = activity.category || "other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return (
    Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "unknown"
  );
}

function getMostActiveDay(activities) {
  const dailyActivity = activities.reduce((acc, activity) => {
    const day = activity.timestamp.toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return (
    Object.entries(dailyActivity).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "unknown"
  );
}

function calculateActivityTrend(activities, days) {
  if (days < 2) return "stable";

  const midPoint = Math.floor(days / 2);
  const cutoff = new Date(Date.now() - midPoint * 24 * 60 * 60 * 1000);

  const recentActivities = activities.filter(
    (a) => a.timestamp > cutoff
  ).length;
  const earlierActivities = activities.filter(
    (a) => a.timestamp <= cutoff
  ).length;

  const recentAvg = recentActivities / midPoint;
  const earlierAvg = earlierActivities / (days - midPoint);

  if (recentAvg > earlierAvg * 1.2) return "increasing";
  if (recentAvg < earlierAvg * 0.8) return "decreasing";
  return "stable";
}

function parseUserAgent(userAgent) {
  if (!userAgent) return "Unknown";

  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Mobile")) return "Mobile";

  return "Other";
}

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default useActivity;
