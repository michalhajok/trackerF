/**
 * Dashboard Page
 * Main dashboard overview page
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";

export default function DashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiEndpoints.analytics.getDashboard(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log("Dashboard Data:", dashboardData);

  if (error) {
    return (
      <Alert variant="error">
        Failed to load dashboard data. Please try again later.
      </Alert>
    );
  }

  const data = dashboardData?.data || {};
  const portfolio = data.portfolio || {};
  const positions = data.positions || {};
  const performance = data.performance || {};

  const stats = [
    {
      name: "Total Portfolio Value",
      value: `$${(portfolio.totalValue || 0).toLocaleString()}`,
      change: portfolio.dayChangePercent || 0,
      changeValue: `$${(portfolio.dayChange || 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      name: "Total P&L",
      value: `$${(portfolio.totalPL || 0).toLocaleString()}`,
      change: portfolio.totalPL > 0 ? 15.3 : -12.8, // Mock percentage
      changeValue: `${portfolio.totalPL > 0 ? "+" : ""}$${(
        portfolio.totalPL || 0
      ).toLocaleString()}`,
      icon: portfolio.totalPL >= 0 ? TrendingUp : TrendingDown,
    },
    {
      name: "Open Positions",
      value: positions.open || 0,
      change: 0,
      changeValue: `${positions.open || 0} active`,
      icon: Activity,
    },
    {
      name: "Cash Balance",
      value: `$${(portfolio.totalCash || 0).toLocaleString()}`,
      change: 0,
      changeValue: "Available",
      icon: DollarSign,
    },
  ];

  const recentActivity = data.recentActivity || [];
  const topGainers = performance.topGainers || [];
  const topLosers = performance.topLosers || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-100">
          Heres whats happening with your portfolio today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-success-600 mr-1" />
                  ) : stat.change < 0 ? (
                    <ArrowDownRight className="w-4 h-4 text-error-600 mr-1" />
                  ) : null}
                  <span
                    className={`text-sm ${
                      stat.change > 0
                        ? "text-success-600"
                        : stat.change < 0
                        ? "text-error-600"
                        : "text-slate-500"
                    }`}
                  >
                    {stat.changeValue}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Top Performers
          </h3>
          {topGainers.length > 0 ? (
            <div className="space-y-3">
              {topGainers.slice(0, 5).map((position, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {position.symbol}
                    </p>
                    <p className="text-sm text-slate-500">
                      ${position.currentValue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-success-600">
                      +${position.grossPL?.toLocaleString()}
                    </p>
                    <p className="text-sm text-success-600">
                      +{position.plPercentage?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No positions data available</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Activity
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {activity.type === "position"
                        ? "Position"
                        : activity.type === "cash_operation"
                        ? "Cash Operation"
                        : "Order"}
                      {activity.action && ` ${activity.action}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {activity.symbol || "Portfolio"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No recent activity</p>
          )}
        </Card>
      </div>

      {/* Portfolio Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Portfolio Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-2">Total Invested</p>
            <p className="text-xl font-semibold text-slate-900">
              ${(positions.totalInvested || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Current Value</p>
            <p className="text-xl font-semibold text-slate-900">
              ${(portfolio.totalValue || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Net Return</p>
            <p
              className={`text-xl font-semibold ${
                (portfolio.totalPL || 0) >= 0
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {(portfolio.totalPL || 0) >= 0 ? "+" : ""}$
              {(portfolio.totalPL || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
