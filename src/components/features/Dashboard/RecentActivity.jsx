/**
 * Recent Activity Component
 * Shows recent portfolio activities and transactions
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function RecentActivity({ limit = 10 }) {
  const {
    data: activityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => apiEndpoints.dashboard.getRecentActivity({ limit }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minutes
  });

  const activities = activityData?.data || [];

  const getActivityIcon = (type, subtype) => {
    switch (type) {
      case "position":
        return subtype === "open" ? (
          <TrendingUp className="w-4 h-4 text-success-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-error-600" />
        );
      case "cash_operation":
        return subtype === "deposit" || subtype === "dividend" ? (
          <ArrowUpCircle className="w-4 h-4 text-success-600" />
        ) : (
          <ArrowDownCircle className="w-4 h-4 text-error-600" />
        );
      case "order":
        return <Clock className="w-4 h-4 text-warning-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActivityColor = (type, subtype, amount) => {
    if (type === "position") {
      return amount >= 0 ? "text-success-600" : "text-error-600";
    }
    if (type === "cash_operation") {
      return subtype === "deposit" || subtype === "dividend"
        ? "text-success-600"
        : "text-error-600";
    }
    return "text-slate-900";
  };

  const formatActivityTitle = (activity) => {
    switch (activity.type) {
      case "position":
        return `${activity.data.type} ${activity.data.symbol}`;
      case "cash_operation":
        return `${
          activity.data.type.charAt(0).toUpperCase() +
          activity.data.type.slice(1)
        }`;
      case "order":
        return `${activity.data.side} Order - ${activity.data.symbol}`;
      default:
        return "Unknown Activity";
    }
  };

  const formatActivityDescription = (activity) => {
    switch (activity.type) {
      case "position":
        return `${activity.data.volume} shares ${
          activity.data.status === "closed" ? "closed" : "opened"
        } at ${formatCurrency(activity.data.price)}`;
      case "cash_operation":
        return activity.data.comment || `${activity.data.currency} account`;
      case "order":
        return `${activity.data.type} order for ${activity.data.volume} shares`;
      default:
        return "Portfolio activity";
    }
  };

  const getActivityBadge = (activity) => {
    switch (activity.type) {
      case "position":
        return (
          <Badge
            variant={activity.data.status === "open" ? "success" : "default"}
            size="sm"
          >
            {activity.data.status}
          </Badge>
        );
      case "cash_operation":
        return (
          <Badge
            variant={
              activity.data.type === "deposit" ||
              activity.data.type === "dividend"
                ? "success"
                : "error"
            }
            size="sm"
          >
            {activity.data.type}
          </Badge>
        );
      case "order":
        return (
          <Badge
            variant={
              activity.data.status === "executed"
                ? "success"
                : activity.data.status === "pending"
                ? "warning"
                : "default"
            }
            size="sm"
          >
            {activity.data.status}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Unable to load recent activity</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Activity
        </h3>
        <Activity className="w-5 h-5 text-slate-400" />
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No recent activity
          </h4>
          <p className="text-slate-600">
            Your portfolio activities will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-b-0"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-surface-50 rounded-full flex items-center justify-center">
                {getActivityIcon(
                  activity.type,
                  activity.data.type || activity.data.status
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {formatActivityTitle(activity)}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getActivityBadge(activity)}
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 truncate mb-2">
                  {formatActivityDescription(activity)}
                </p>

                {/* Amount/Value */}
                {activity.data.amount !== undefined && (
                  <div
                    className={`text-sm font-medium ${getActivityColor(
                      activity.type,
                      activity.data.type,
                      activity.data.amount
                    )}`}
                  >
                    {activity.type === "cash_operation" &&
                    (activity.data.type === "deposit" ||
                      activity.data.type === "dividend")
                      ? "+"
                      : ""}
                    {activity.type === "cash_operation" &&
                    (activity.data.type === "withdrawal" ||
                      activity.data.type === "fee")
                      ? "-"
                      : ""}
                    {formatCurrency(
                      Math.abs(activity.data.amount),
                      activity.data.currency
                    )}
                  </div>
                )}

                {activity.data.value !== undefined && (
                  <div className="text-sm font-medium text-slate-900">
                    {formatCurrency(
                      activity.data.value,
                      activity.data.currency
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* View More Link */}
          <div className="pt-4 text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Activity
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
