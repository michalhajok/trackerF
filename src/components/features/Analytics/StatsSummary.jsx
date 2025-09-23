/**
 * Stats Summary Component
 * Summary statistics for portfolio analytics
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

export default function StatsSummary({ period = "1Y" }) {
  const {
    data: summaryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats-summary", period],
    queryFn: () => apiEndpoints.analytics.getStatsSummary({ period }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const stats = summaryData?.data || {};

  const statItems = [
    {
      title: "Total Return",
      value: formatPercent(stats.totalReturn),
      subValue: formatCurrency(stats.totalReturnAbsolute),
      icon: stats.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalReturn >= 0 ? "success" : "error",
    },
    {
      title: "Win Rate",
      value: formatPercent(stats.winRate),
      subValue: `${stats.winningTrades}/${stats.totalTrades} trades`,
      icon: Target,
      color: stats.winRate >= 50 ? "success" : "warning",
    },
    {
      title: "Best Performer",
      value: stats.bestPerformer?.symbol || "N/A",
      subValue: stats.bestPerformer
        ? formatPercent(stats.bestPerformer.return)
        : "",
      icon: Award,
      color: "primary",
    },
    {
      title: "Worst Performer",
      value: stats.worstPerformer?.symbol || "N/A",
      subValue: stats.worstPerformer
        ? formatPercent(stats.worstPerformer.return)
        : "",
      icon: TrendingDown,
      color: "error",
    },
    {
      title: "Average Hold Time",
      value: stats.averageHoldTime
        ? `${Math.round(stats.averageHoldTime)} days`
        : "N/A",
      subValue: stats.totalPositions ? `${stats.totalPositions} positions` : "",
      icon: Clock,
      color: "blue",
    },
    {
      title: "Portfolio Volatility",
      value: formatPercent(stats.volatility),
      subValue: "Annualized",
      icon: BarChart3,
      color: stats.volatility > 20 ? "warning" : "success",
    },
    {
      title: "Sharpe Ratio",
      value: stats.sharpeRatio ? stats.sharpeRatio.toFixed(2) : "N/A",
      subValue: "Risk-adjusted return",
      icon: Target,
      color:
        stats.sharpeRatio > 1
          ? "success"
          : stats.sharpeRatio > 0.5
          ? "warning"
          : "error",
    },
    {
      title: "Max Drawdown",
      value: formatPercent(Math.abs(stats.maxDrawdown)),
      subValue: "Peak to trough",
      icon: TrendingDown,
      color: Math.abs(stats.maxDrawdown) > 20 ? "error" : "warning",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Unable to load statistics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Performance Summary - {period === "1Y" ? "1 Year" : period}
        </h3>
        <Calendar className="w-5 h-5 text-slate-400" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            Key Insights
          </h4>
          <div className="space-y-3">
            {stats.insights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color }) {
  const getColorClasses = (color) => {
    const colors = {
      primary: "text-primary-600",
      success: "text-success-600",
      error: "text-error-600",
      warning: "text-warning-600",
      blue: "text-blue-600",
    };
    return colors[color] || colors.primary;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-600 truncate">{title}</h4>
        <Icon className={`h-5 w-5 ${getColorClasses(color)}`} />
      </div>

      <div className="mb-1">
        <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      </div>

      {subValue && (
        <p className="text-sm text-slate-500 truncate">{subValue}</p>
      )}
    </Card>
  );
}
