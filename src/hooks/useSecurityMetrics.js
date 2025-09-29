/**
 * useSecurityMetrics.js - Dedicated hook for security metrics and monitoring
 * Handles security analytics, threat detection, and compliance metrics
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useAuditLogs,
  useFailedLogins,
  useSuspiciousActivities,
} from "./useAuditLogs";
import { useUserActivity } from "./useApi";

export const useSecurityMetrics = (timeRange = "24h", userId = null) => {
  const [metrics, setMetrics] = useState({
    // Overall security score (0-100)
    securityScore: 0,
    riskLevel: "low", // low, medium, high, critical

    // Event counts
    totalEvents: 0,
    criticalEvents: 0,
    warningEvents: 0,
    infoEvents: 0,

    // Security incidents
    failedLogins: 0,
    suspiciousActivities: 0,
    securityAlerts: 0,
    blockedAttempts: 0,

    // User metrics
    activeUsers: 0,
    uniqueIPs: 0,
    unusualLocations: 0,
    newDevices: 0,

    // Time-based analysis
    peakActivityHour: 0,
    offHoursActivity: 0,
    weekendActivity: 0,

    // Compliance metrics
    complianceScore: 0,
    policyViolations: 0,
    dataAccessEvents: 0,
    exportEvents: 0,
  });

  // Fetch audit data
  const { logs, isLoading: logsLoading } = useAuditLogs({
    dateRange: getDateRange(timeRange),
    limit: 1000,
  });

  const { data: failedLoginsData, isLoading: failedLoading } = useFailedLogins({
    timeRange,
  });

  const { data: suspiciousData, isLoading: suspiciousLoading } =
    useSuspiciousActivities({
      timeRange,
    });

  const { data: userActivityData, isLoading: activityLoading } =
    useUserActivity(userId, {
      timeRange,
    });

  // Calculate metrics when data changes
  useEffect(() => {
    if (logsLoading || failedLoading || suspiciousLoading) return;

    const auditLogs = logs || [];
    const failedLogins = failedLoginsData?.data || [];
    const suspicious = suspiciousData?.data || [];
    const userActivity = userActivityData?.data || [];

    // Event counts
    const totalEvents = auditLogs.length;
    const criticalEvents = auditLogs.filter(
      (log) => log.level === "critical"
    ).length;
    const warningEvents = auditLogs.filter(
      (log) => log.level === "warning"
    ).length;
    const infoEvents = auditLogs.filter((log) => log.level === "info").length;

    // Security incidents
    const failedLoginsCount = failedLogins.length;
    const suspiciousCount = suspicious.length;
    const securityAlerts = auditLogs.filter(
      (log) => log.category === "security" || log.action.includes("security")
    ).length;
    const blockedAttempts = auditLogs.filter(
      (log) => log.action.includes("blocked") || log.action.includes("rejected")
    ).length;

    // User metrics
    const uniqueUsers = new Set(
      auditLogs.map((log) => log.userId).filter(Boolean)
    );
    const uniqueIPs = new Set(
      auditLogs.map((log) => log.ipAddress).filter(Boolean)
    );
    const uniqueLocations = new Set(
      auditLogs.map((log) => log.location).filter(Boolean)
    );

    // Detect unusual locations (more than 3 different locations per user)
    const userLocationCounts = {};
    auditLogs.forEach((log) => {
      if (log.userId && log.location) {
        if (!userLocationCounts[log.userId]) {
          userLocationCounts[log.userId] = new Set();
        }
        userLocationCounts[log.userId].add(log.location);
      }
    });
    const unusualLocations = Object.values(userLocationCounts).filter(
      (locations) => locations.size > 3
    ).length;

    // New devices (users with more than 2 different user agents)
    const userDeviceCounts = {};
    auditLogs.forEach((log) => {
      if (log.userId && log.userAgent) {
        if (!userDeviceCounts[log.userId]) {
          userDeviceCounts[log.userId] = new Set();
        }
        userDeviceCounts[log.userId].add(log.userAgent);
      }
    });
    const newDevices = Object.values(userDeviceCounts).filter(
      (devices) => devices.size > 2
    ).length;

    // Time-based analysis
    const hourlyActivity = Array.from({ length: 24 }, () => 0);
    let weekendActivityCount = 0;

    auditLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      hourlyActivity[hour]++;

      // Weekend activity (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendActivityCount++;
      }
    });

    const peakActivityHour = hourlyActivity.indexOf(
      Math.max(...hourlyActivity)
    );

    // Off-hours activity (before 8 AM or after 6 PM)
    const offHoursActivity = auditLogs.filter((log) => {
      const hour = new Date(log.timestamp).getHours();
      return hour < 8 || hour > 18;
    }).length;

    // Compliance metrics
    const dataAccessEvents = auditLogs.filter(
      (log) =>
        log.action.includes("view") ||
        log.action.includes("download") ||
        log.action.includes("export")
    ).length;

    const exportEvents = auditLogs.filter(
      (log) => log.action.includes("export") || log.action.includes("download")
    ).length;

    const policyViolations = criticalEvents + suspiciousCount;

    // Calculate security score
    let securityScore = 100;

    // Deduct points for security issues
    securityScore -= Math.min(30, criticalEvents * 5); // Max 30 points for critical events
    securityScore -= Math.min(20, failedLoginsCount * 2); // Max 20 points for failed logins
    securityScore -= Math.min(25, suspiciousCount * 5); // Max 25 points for suspicious activities
    securityScore -= Math.min(15, unusualLocations * 3); // Max 15 points for unusual locations
    securityScore -= Math.min(10, newDevices * 2); // Max 10 points for new devices

    securityScore = Math.max(0, securityScore);

    // Determine risk level
    let riskLevel = "low";
    if (securityScore < 50) riskLevel = "critical";
    else if (securityScore < 70) riskLevel = "high";
    else if (securityScore < 85) riskLevel = "medium";

    // Compliance score (separate metric)
    let complianceScore = 100;
    complianceScore -= Math.min(40, policyViolations * 10);
    complianceScore -= Math.min(
      20,
      exportEvents > 10 ? (exportEvents - 10) * 2 : 0
    );
    complianceScore = Math.max(0, complianceScore);

    setMetrics({
      securityScore: Math.round(securityScore),
      riskLevel,
      totalEvents,
      criticalEvents,
      warningEvents,
      infoEvents,
      failedLogins: failedLoginsCount,
      suspiciousActivities: suspiciousCount,
      securityAlerts,
      blockedAttempts,
      activeUsers: uniqueUsers.size,
      uniqueIPs: uniqueIPs.size,
      unusualLocations,
      newDevices,
      peakActivityHour,
      offHoursActivity,
      weekendActivity: weekendActivityCount,
      complianceScore: Math.round(complianceScore),
      policyViolations,
      dataAccessEvents,
      exportEvents,
    });
  }, [
    logs,
    failedLoginsData,
    suspiciousData,
    userActivityData,
    logsLoading,
    failedLoading,
    suspiciousLoading,
  ]);

  const getScoreColor = useCallback((score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  }, []);

  const getRiskColor = useCallback((riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, []);

  const getRecommendations = useCallback(() => {
    const recommendations = [];

    if (metrics.securityScore < 70) {
      recommendations.push({
        type: "critical",
        message: "Security score is below acceptable threshold",
        action: "Review recent security events and strengthen access controls",
      });
    }

    if (metrics.failedLogins > 10) {
      recommendations.push({
        type: "warning",
        message: "High number of failed login attempts detected",
        action: "Consider implementing account lockout policies",
      });
    }

    if (metrics.suspiciousActivities > 5) {
      recommendations.push({
        type: "warning",
        message: "Multiple suspicious activities detected",
        action: "Investigate unusual user behavior patterns",
      });
    }

    if (metrics.unusualLocations > 3) {
      recommendations.push({
        type: "info",
        message: "Users accessing from unusual locations",
        action: "Verify location-based access patterns",
      });
    }

    if (metrics.offHoursActivity > totalEvents * 0.3) {
      recommendations.push({
        type: "info",
        message: "High off-hours activity detected",
        action: "Review after-hours access policies",
      });
    }

    return recommendations;
  }, [metrics]);

  return {
    metrics,
    isLoading:
      logsLoading || failedLoading || suspiciousLoading || activityLoading,
    getScoreColor,
    getRiskColor,
    getRecommendations,
  };
};

export const useSecurityDashboard = () => {
  const [dashboardConfig, setDashboardConfig] = useState({
    timeRange: "24h",
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    showAlerts: true,
    showMetrics: true,
    showActivity: true,
    alertThreshold: {
      failedLogins: 5,
      criticalEvents: 3,
      suspiciousActivities: 2,
      unusualLocations: 3,
    },
  });

  const metrics = useSecurityMetrics(dashboardConfig.timeRange);
  const [alerts, setAlerts] = useState([]);

  // Generate security alerts based on thresholds
  useEffect(() => {
    const newAlerts = [];
    const now = new Date();

    if (metrics.failedLogins >= dashboardConfig.alertThreshold.failedLogins) {
      newAlerts.push({
        id: "failed-logins",
        type: "authentication",
        severity: "high",
        title: "Multiple Failed Logins",
        message: `${metrics.failedLogins} failed login attempts detected`,
        timestamp: now.toISOString(),
        count: metrics.failedLogins,
      });
    }

    if (
      metrics.criticalEvents >= dashboardConfig.alertThreshold.criticalEvents
    ) {
      newAlerts.push({
        id: "critical-events",
        type: "system",
        severity: "critical",
        title: "Critical Security Events",
        message: `${metrics.criticalEvents} critical security events`,
        timestamp: now.toISOString(),
        count: metrics.criticalEvents,
      });
    }

    if (
      metrics.suspiciousActivities >=
      dashboardConfig.alertThreshold.suspiciousActivities
    ) {
      newAlerts.push({
        id: "suspicious-activities",
        type: "behavior",
        severity: "high",
        title: "Suspicious Activities",
        message: `${metrics.suspiciousActivities} suspicious activities detected`,
        timestamp: now.toISOString(),
        count: metrics.suspiciousActivities,
      });
    }

    if (
      metrics.unusualLocations >=
      dashboardConfig.alertThreshold.unusualLocations
    ) {
      newAlerts.push({
        id: "unusual-locations",
        type: "access",
        severity: "medium",
        title: "Unusual Access Locations",
        message: `${metrics.unusualLocations} users accessing from unusual locations`,
        timestamp: now.toISOString(),
        count: metrics.unusualLocations,
      });
    }

    setAlerts(newAlerts);
  }, [metrics, dashboardConfig.alertThreshold]);

  const updateConfig = useCallback((updates) => {
    setDashboardConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  return {
    metrics,
    alerts,
    dashboardConfig,
    updateConfig,
    dismissAlert,
    isLoading: metrics.isLoading,
  };
};

export const useComplianceMetrics = () => {
  const [complianceData, setComplianceData] = useState({
    overallScore: 0,
    categories: {
      dataProtection: { score: 0, violations: 0 },
      accessControl: { score: 0, violations: 0 },
      auditTrail: { score: 0, violations: 0 },
      incidentResponse: { score: 0, violations: 0 },
      userManagement: { score: 0, violations: 0 },
    },
    requirements: [],
    recommendations: [],
    lastAssessment: null,
  });

  const { logs } = useAuditLogs({ limit: 500 });
  const { data: systemActivity } = useSystemActivity();

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    // Analyze compliance based on audit logs
    const dataProtectionViolations = logs.filter(
      (log) => log.action.includes("data_export") && !log.authorized
    ).length;

    const accessControlViolations = logs.filter(
      (log) => log.level === "critical" && log.category === "authentication"
    ).length;

    const auditTrailScore = logs.length > 100 ? 100 : (logs.length / 100) * 100;

    const incidentResponseTime = calculateAverageResponseTime(logs);
    const incidentScore =
      incidentResponseTime < 3600
        ? 100 // < 1 hour = 100
        : incidentResponseTime < 7200
        ? 80 // < 2 hours = 80
        : incidentResponseTime < 14400
        ? 60 // < 4 hours = 60
        : 40; // > 4 hours = 40

    const userManagementViolations = logs.filter(
      (log) =>
        log.action.includes("unauthorized") ||
        (log.action.includes("admin") && log.level === "warning")
    ).length;

    const categories = {
      dataProtection: {
        score: Math.max(0, 100 - dataProtectionViolations * 20),
        violations: dataProtectionViolations,
      },
      accessControl: {
        score: Math.max(0, 100 - accessControlViolations * 15),
        violations: accessControlViolations,
      },
      auditTrail: {
        score: Math.round(auditTrailScore),
        violations: 0,
      },
      incidentResponse: {
        score: Math.round(incidentScore),
        violations: logs.filter((log) => log.level === "critical").length,
      },
      userManagement: {
        score: Math.max(0, 100 - userManagementViolations * 10),
        violations: userManagementViolations,
      },
    };

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(categories).reduce((sum, cat) => sum + cat.score, 0) / 5
    );

    // Generate recommendations
    const recommendations = [];
    Object.entries(categories).forEach(([category, data]) => {
      if (data.score < 70) {
        recommendations.push({
          category,
          priority: data.score < 50 ? "high" : "medium",
          message: getComplianceRecommendation(category, data.score),
        });
      }
    });

    setComplianceData({
      overallScore,
      categories,
      requirements: generateComplianceRequirements(categories),
      recommendations,
      lastAssessment: new Date().toISOString(),
    });
  }, [logs, systemActivity]);

  return complianceData;
};

export const useThreatDetection = () => {
  const [threats, setThreats] = useState([]);
  const [threatLevel, setThreatLevel] = useState("low");
  const [lastScan, setLastScan] = useState(null);

  const { logs } = useAuditLogs({ limit: 200 });
  const { data: suspicious } = useSuspiciousActivities();

  const scanForThreats = useCallback(() => {
    if (!logs || logs.length === 0) return;

    const detectedThreats = [];
    const now = new Date();

    // Detect brute force attempts
    const loginFailures = logs.filter(
      (log) =>
        log.action.includes("login_failed") &&
        new Date(log.timestamp) > new Date(now - 3600000) // Last hour
    );

    const ipLoginAttempts = {};
    loginFailures.forEach((log) => {
      const ip = log.ipAddress;
      ipLoginAttempts[ip] = (ipLoginAttempts[ip] || 0) + 1;
    });

    Object.entries(ipLoginAttempts).forEach(([ip, attempts]) => {
      if (attempts >= 5) {
        detectedThreats.push({
          id: `brute-force-${ip}`,
          type: "brute_force",
          severity: "high",
          title: "Brute Force Attack",
          description: `${attempts} failed login attempts from IP ${ip}`,
          ipAddress: ip,
          timestamp: now.toISOString(),
          evidence: loginFailures.filter((log) => log.ipAddress === ip),
        });
      }
    });

    // Detect unusual access patterns
    const recentActivity = logs.filter(
      (log) => new Date(log.timestamp) > new Date(now - 86400000) // Last 24 hours
    );

    const userActivityPatterns = {};
    recentActivity.forEach((log) => {
      if (!log.userId) return;

      if (!userActivityPatterns[log.userId]) {
        userActivityPatterns[log.userId] = {
          locations: new Set(),
          devices: new Set(),
          actions: [],
          hourPattern: Array.from({ length: 24 }, () => 0),
        };
      }

      const pattern = userActivityPatterns[log.userId];
      pattern.locations.add(log.location || log.ipAddress);
      pattern.devices.add(log.userAgent);
      pattern.actions.push(log.action);

      const hour = new Date(log.timestamp).getHours();
      pattern.hourPattern[hour]++;
    });

    // Analyze patterns for anomalies
    Object.entries(userActivityPatterns).forEach(([userId, pattern]) => {
      // Multiple locations
      if (pattern.locations.size > 3) {
        detectedThreats.push({
          id: `multi-location-${userId}`,
          type: "unusual_access",
          severity: "medium",
          title: "Multiple Access Locations",
          description: `User ${userId} accessed from ${pattern.locations.size} different locations`,
          userId,
          timestamp: now.toISOString(),
        });
      }

      // Unusual time patterns
      const normalHours = pattern.hourPattern.slice(8, 18); // 8 AM to 6 PM
      const offHours = [
        ...pattern.hourPattern.slice(0, 8),
        ...pattern.hourPattern.slice(18),
      ];

      const offHoursActivity = offHours.reduce((sum, count) => sum + count, 0);
      const normalActivity = normalHours.reduce((sum, count) => sum + count, 0);

      if (offHoursActivity > normalActivity * 1.5) {
        detectedThreats.push({
          id: `unusual-hours-${userId}`,
          type: "unusual_timing",
          severity: "low",
          title: "Unusual Access Hours",
          description: `User ${userId} showing high off-hours activity`,
          userId,
          timestamp: now.toISOString(),
        });
      }
    });

    // Determine overall threat level
    const highThreatCount = detectedThreats.filter(
      (t) => t.severity === "high"
    ).length;
    const mediumThreatCount = detectedThreats.filter(
      (t) => t.severity === "medium"
    ).length;

    let level = "low";
    if (highThreatCount > 0) level = "high";
    else if (mediumThreatCount > 2) level = "medium";

    setThreats(detectedThreats);
    setThreatLevel(level);
    setLastScan(now.toISOString());
  }, [logs, suspicious]);

  // Auto-scan every 5 minutes
  useEffect(() => {
    scanForThreats();

    const interval = setInterval(scanForThreats, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [scanForThreats]);

  return {
    threats,
    threatLevel,
    lastScan,
    scanForThreats,
    highThreatCount: threats.filter((t) => t.severity === "high").length,
    mediumThreatCount: threats.filter((t) => t.severity === "medium").length,
    lowThreatCount: threats.filter((t) => t.severity === "low").length,
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
      start.setDate(end.getDate() - 1);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function calculateAverageResponseTime(logs) {
  const incidents = logs.filter((log) => log.level === "critical");
  if (incidents.length === 0) return 0;

  // Mock calculation - would use actual incident response data
  return 3600; // 1 hour average
}

function getComplianceRecommendation(category, score) {
  const recommendations = {
    dataProtection: "Implement stronger data encryption and access controls",
    accessControl:
      "Review user permissions and implement multi-factor authentication",
    auditTrail: "Increase audit log retention and implement log analysis",
    incidentResponse:
      "Improve incident response procedures and reduce response time",
    userManagement: "Strengthen user lifecycle management and access reviews",
  };

  return recommendations[category] || "Review and improve security practices";
}

function generateComplianceRequirements(categories) {
  return Object.entries(categories).map(([category, data]) => ({
    category,
    requirement: getComplianceRequirement(category),
    status:
      data.score >= 80
        ? "compliant"
        : data.score >= 60
        ? "partial"
        : "non-compliant",
    score: data.score,
    violations: data.violations,
  }));
}

function getComplianceRequirement(category) {
  const requirements = {
    dataProtection: "GDPR/CCPA data protection compliance",
    accessControl: "ISO 27001 access control standards",
    auditTrail: "SOX audit trail requirements",
    incidentResponse: "NIST incident response framework",
    userManagement: "Identity and access management best practices",
  };

  return requirements[category] || "General security compliance";
}

export default useSecurityMetrics;
