/**
 * SecurityAlerts.js - Security alerts component
 * Displays security alerts with actions and threat information
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  EyeIcon,
  BellIcon,
  ClockIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useSecurityAlerts,
  useThreatDetection,
} from "../../hooks/useSecurityMetrics";
import { formatDistanceToNow } from "date-fns";

const SecurityAlerts = ({
  alerts = [],
  threatLevel = "low",
  onDismissAlert,
  onInvestigateAlert,
  className = "",
}) => {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp"); // timestamp, severity, type
  const [expandedAlert, setExpandedAlert] = useState(null);

  // Get additional alert data
  const {
    alerts: securityAlerts,
    dismissAlert,
    markAsRead,
  } = useSecurityAlerts();
  const { threats, scanForThreats } = useThreatDetection();

  // Combine all alerts
  const allAlerts = useMemo(() => {
    return [
      ...alerts.map((alert) => ({ ...alert, source: "dashboard" })),
      ...securityAlerts.map((alert) => ({ ...alert, source: "security" })),
      ...threats.map((threat) => ({
        ...threat,
        source: "threat",
        severity: threat.severity || "medium",
        timestamp: threat.timestamp || new Date().toISOString(),
      })),
    ];
  }, [alerts, securityAlerts, threats]);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...allAlerts];

    if (filterSeverity !== "all") {
      filtered = filtered.filter((alert) => alert.severity === filterSeverity);
    }

    if (filterType !== "all") {
      filtered = filtered.filter((alert) => alert.type === filterType);
    }

    // Sort alerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "severity":
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (
            (severityOrder[b.severity] || 2) - (severityOrder[a.severity] || 2)
          );
        case "type":
          return a.type.localeCompare(b.type);
        case "timestamp":
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  }, [allAlerts, filterSeverity, filterType, sortBy]);

  // Alert counts by severity
  const alertCounts = useMemo(() => {
    return {
      critical: filteredAlerts.filter((a) => a.severity === "critical").length,
      high: filteredAlerts.filter((a) => a.severity === "high").length,
      medium: filteredAlerts.filter((a) => a.severity === "medium").length,
      low: filteredAlerts.filter((a) => a.severity === "low").length,
      total: filteredAlerts.length,
    };
  }, [filteredAlerts]);

  const getAlertIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "authentication":
        return <UserGroupIcon className={`${iconClass} text-orange-500`} />;
      case "brute_force":
        return (
          <ShieldExclamationIcon className={`${iconClass} text-red-500`} />
        );
      case "suspicious":
      case "unusual_access":
        return (
          <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />
        );
      case "system":
        return <ComputerDesktopIcon className={`${iconClass} text-blue-500`} />;
      default:
        return <BellIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleDismiss = (alert) => {
    onDismissAlert?.(alert.id);
    if (alert.source === "security") {
      dismissAlert(alert.id);
    }
  };

  const handleInvestigate = (alert) => {
    onInvestigateAlert?.(alert);
    setExpandedAlert(expandedAlert === alert.id ? null : alert.id);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Security Alerts
          </h2>
          <p className="text-sm text-gray-600">
            {alertCounts.total} alerts • Threat Level:
            <span
              className={`ml-1 font-medium ${getThreatLevelColor(threatLevel)}`}
            >
              {threatLevel.toUpperCase()}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => scanForThreats()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Scan for New Threats
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {alertCounts.critical}
              </div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {alertCounts.high}
              </div>
              <div className="text-sm text-orange-600">High</div>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {alertCounts.medium}
              </div>
              <div className="text-sm text-yellow-600">Medium</div>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {alertCounts.low}
              </div>
              <div className="text-sm text-blue-600">Low</div>
            </div>
            <BellIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Types</option>
            <option value="authentication">Authentication</option>
            <option value="brute_force">Brute Force</option>
            <option value="suspicious">Suspicious Activity</option>
            <option value="system">System Events</option>
            <option value="access">Access Control</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="timestamp">Newest First</option>
            <option value="severity">By Severity</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Security Alerts
            </h3>
            <p className="text-gray-500">
              {filterSeverity !== "all" || filterType !== "all"
                ? "No alerts match your current filters"
                : "Your system is secure - no active alerts"}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getSeverityColor(
                alert.severity
              )} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {alert.title}
                      </h4>

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>

                      {alert.count && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {alert.count}x
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-700">
                      {alert.message || alert.description}
                    </p>

                    {/* Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(alert.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {alert.userId && (
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-3 w-3" />
                          <span>User: {alert.userId}</span>
                        </div>
                      )}

                      {alert.ipAddress && (
                        <div className="flex items-center space-x-1">
                          <ComputerDesktopIcon className="h-3 w-3" />
                          <span>IP: {alert.ipAddress}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <span className="capitalize">{alert.type} Alert</span>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    {alert.recommendations &&
                      alert.recommendations.length > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <h5 className="text-xs font-medium text-blue-800 mb-1">
                            Recommended Actions:
                          </h5>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {alert.recommendations
                              .slice(0, 2)
                              .map((recommendation, index) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-1"
                                >
                                  <span className="text-blue-500 mt-0.5">
                                    •
                                  </span>
                                  <span>{recommendation}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                {/* Alert Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleInvestigate(alert)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Investigate alert"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDismiss(alert)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Dismiss alert"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAlert === alert.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Alert Details
                      </h5>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div>
                          <strong>Alert ID:</strong> {alert.id}
                        </div>
                        <div>
                          <strong>Source:</strong> {alert.source}
                        </div>
                        <div>
                          <strong>Type:</strong> {alert.type}
                        </div>
                        <div>
                          <strong>Severity:</strong> {alert.severity}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        {alert.resolvedAt && (
                          <div>
                            <strong>Resolved:</strong>{" "}
                            {new Date(alert.resolvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Technical Information
                      </h5>
                      <div className="text-xs text-gray-700 space-y-1">
                        {alert.evidence && (
                          <div>
                            <strong>Evidence Count:</strong>{" "}
                            {Array.isArray(alert.evidence)
                              ? alert.evidence.length
                              : 1}
                          </div>
                        )}
                        {alert.affectedResources && (
                          <div>
                            <strong>Affected Resources:</strong>{" "}
                            {alert.affectedResources.join(", ")}
                          </div>
                        )}
                        {alert.detectionMethod && (
                          <div>
                            <strong>Detection:</strong> {alert.detectionMethod}
                          </div>
                        )}
                        {alert.mitigationStatus && (
                          <div>
                            <strong>Mitigation:</strong>{" "}
                            {alert.mitigationStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence Preview */}
                  {alert.evidence &&
                    Array.isArray(alert.evidence) &&
                    alert.evidence.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Evidence ({alert.evidence.length} items)
                        </h5>
                        <div className="bg-gray-100 p-3 rounded-lg max-h-32 overflow-y-auto">
                          {alert.evidence.slice(0, 3).map((evidence, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 mb-2 last:mb-0"
                            >
                              <strong>#{index + 1}:</strong>{" "}
                              {evidence.action || evidence.message}
                              <span className="text-gray-500 ml-2">
                                (
                                {formatDistanceToNow(
                                  new Date(evidence.timestamp),
                                  { addSuffix: true }
                                )}
                                )
                              </span>
                            </div>
                          ))}
                          {alert.evidence.length > 3 && (
                            <div className="text-xs text-gray-500">
                              ... and {alert.evidence.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">
                      Export Details
                    </button>
                    <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg">
                      Create Incident
                    </button>
                    <button
                      onClick={() => handleDismiss(alert)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg"
                    >
                      Dismiss Alert
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {alertCounts.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Quick Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            {alertCounts.critical > 0 && (
              <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                Address {alertCounts.critical} Critical Alert
                {alertCounts.critical !== 1 ? "s" : ""}
              </button>
            )}

            {alertCounts.high > 0 && (
              <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">
                Review {alertCounts.high} High-Priority Alert
                {alertCounts.high !== 1 ? "s" : ""}
              </button>
            )}

            <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
              Export All Alerts
            </button>

            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Generate Security Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAlerts;
