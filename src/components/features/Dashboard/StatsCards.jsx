/**
 * Stats Cards Component
 * Dashboard statistics cards showing key portfolio metrics
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function StatsCards() {
  const {
    data: statsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiEndpoints.dashboard.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  const stats = statsData?.data || {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-5 w-5 bg-slate-200 rounded"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-20 text-slate-400">
              <span className="text-sm">Error loading stats</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Portfolio Value",
      value: formatCurrency(stats.portfolioValue || 0),
      change: stats.portfolioChange || 0,
      icon: DollarSign,
      color: "primary",
    },
    {
      title: "Total P&L",
      value: formatCurrency(stats.totalPL || 0),
      change: stats.totalPLPercent || 0,
      icon: stats.totalPL >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalPL >= 0 ? "success" : "error",
    },
    {
      title: "Open Positions",
      value: (stats.openPositions || 0).toString(),
      subtitle: `${stats.closedPositions || 0} closed`,
      icon: PieChart,
      color: "blue",
    },
    {
      title: "Cash Balance",
      value: formatCurrency(stats.cashBalance || 0),
      subtitle: `${stats.currency || "PLN"}`,
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Today's Change",
      value: formatCurrency(stats.todayChange || 0),
      change: stats.todayChangePercent || 0,
      icon: stats.todayChange >= 0 ? TrendingUp : TrendingDown,
      color: stats.todayChange >= 0 ? "success" : "error",
    },
    {
      title: "Active Orders",
      value: (stats.pendingOrders || 0).toString(),
      subtitle: `${stats.executedOrders || 0} executed`,
      icon: Target,
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsConfig.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ title, value, change, subtitle, icon: Icon, color }) {
  const getColorClasses = (color, hasChange = false) => {
    const colors = {
      primary: {
        icon: "text-primary-600",
        change: hasChange
          ? change >= 0
            ? "text-success-600"
            : "text-error-600"
          : "",
      },
      success: {
        icon: "text-success-600",
        change: "text-success-600",
      },
      error: {
        icon: "text-error-600",
        change: "text-error-600",
      },
      blue: {
        icon: "text-blue-600",
        change: "",
      },
      green: {
        icon: "text-green-600",
        change: "",
      },
      warning: {
        icon: "text-warning-600",
        change: "",
      },
    };
    return colors[color] || colors.primary;
  };

  const colorClasses = getColorClasses(color, change !== undefined);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-600 truncate">{title}</h4>
        <Icon className={`h-5 w-5 ${colorClasses.icon}`} />
      </div>

      <div className="mb-1">
        <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      </div>

      <div className="flex items-center justify-between">
        {change !== undefined ? (
          <p className={`text-sm font-medium ${colorClasses.change}`}>
            {change > 0 ? "+" : ""}
            {formatPercent(change, 1)}
          </p>
        ) : subtitle ? (
          <p className="text-sm text-slate-500 truncate">{subtitle}</p>
        ) : (
          <div></div>
        )}

        {change !== undefined && (
          <div className={`flex items-center ${colorClasses.change}`}>
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
