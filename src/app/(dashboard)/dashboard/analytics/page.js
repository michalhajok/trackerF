/**
 * Analytics Page
 * Portfolio performance analytics and charts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Target,
  Download,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import { useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("1Y");
  const [allocationGroupBy, setAllocationGroupBy] = useState("symbol");

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["analytics", "performance", period],
    queryFn: () => apiEndpoints.analytics.getPerformance({ period }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: allocationData, isLoading: allocationLoading } = useQuery({
    queryKey: ["analytics", "allocation", allocationGroupBy],
    queryFn: () =>
      apiEndpoints.analytics.getAllocation({ groupBy: allocationGroupBy }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: statisticsData, isLoading: statisticsLoading } = useQuery({
    queryKey: ["analytics", "statistics", period],
    queryFn: () => apiEndpoints.analytics.getStatistics({ period }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const performance = performanceData?.data || {};
  const allocation = allocationData?.data || {};
  const statistics = statisticsData?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600">Portfolio performance and insights</p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={period}
            onValueChange={setPeriod}
            placeholder="Select period"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="ALL">All Time</option>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceLoading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Return"
            value={`${(performance.metrics?.totalReturn || 0).toFixed(2)}%`}
            subtitle={`$${(
              performance.metrics?.totalPL || 0
            ).toLocaleString()}`}
            icon={TrendingUp}
            trend={performance.metrics?.totalReturn >= 0 ? "up" : "down"}
          />

          <MetricCard
            title="Win Rate"
            value={`${(performance.metrics?.winRate || 0).toFixed(1)}%`}
            subtitle={`${performance.metrics?.winningTrades || 0} / ${
              (performance.metrics?.winningTrades || 0) +
              (performance.metrics?.losingTrades || 0)
            } trades`}
            icon={Target}
          />

          <MetricCard
            title="Average Win"
            value={`$${(performance.metrics?.avgWin || 0).toLocaleString()}`}
            subtitle="Per winning trade"
            icon={TrendingUp}
            trend="up"
          />

          <MetricCard
            title="Profit Factor"
            value={(performance.metrics?.profitFactor || 0).toFixed(2)}
            subtitle="Risk/Reward ratio"
            icon={BarChart3}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Performance
            </h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          {performanceLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : performance.timeline && performance.timeline.length > 0 ? (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">
                  Performance chart would go here
                </p>
                <p className="text-sm text-slate-500">
                  Chart.js integration needed
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No performance data available
            </div>
          )}
        </Card>

        {/* Allocation Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Portfolio Allocation
            </h3>
            <Select
              value={allocationGroupBy}
              onValueChange={setAllocationGroupBy}
              size="sm"
            >
              <option value="symbol">By Symbol</option>
              <option value="sector">By Sector</option>
              <option value="currency">By Currency</option>
              <option value="exchange">By Exchange</option>
            </Select>
          </div>

          {allocationLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : allocation.allocation && allocation.allocation.length > 0 ? (
            <div className="space-y-4">
              {allocation.allocation.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded mr-3`}
                      style={{ backgroundColor: getColorForIndex(index) }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {item.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">
                      ${item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">No allocation data available</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Trading Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Trading Statistics
        </h3>

        {statisticsLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatItem
              label="Total Trades"
              value={statistics.trading?.totalTrades || 0}
            />
            <StatItem
              label="Total Invested"
              value={`$${(
                statistics.financial?.totalDeposits || 0
              ).toLocaleString()}`}
            />
            <StatItem
              label="Total Commissions"
              value={`$${(
                statistics.financial?.totalCommissions || 0
              ).toLocaleString()}`}
            />
            <StatItem
              label="Most Traded Symbol"
              value={statistics.activity?.mostTradedSymbol?.symbol || "N/A"}
              subtitle={`${
                statistics.activity?.mostTradedSymbol?.count || 0
              } trades`}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-600">{title}</h4>
        <Icon
          className={`w-5 h-5 ${
            trend === "up"
              ? "text-success-600"
              : trend === "down"
              ? "text-error-600"
              : "text-slate-400"
          }`}
        />
      </div>
      <div
        className={`text-2xl font-bold mb-1 ${
          trend === "up"
            ? "text-success-600"
            : trend === "down"
            ? "text-error-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </div>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </Card>
  );
}

function StatItem({ label, value, subtitle }) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

// Helper function for colors
function getColorForIndex(index) {
  const colors = [
    "#218099", // primary-500
    "#32b8c5", // primary-400
    "#5eedd8", // primary-300
    "#99f6e4", // primary-200
    "#64748b", // slate-500
    "#94a3b8", // slate-400
    "#cbd5e1", // slate-300
    "#e2e8f0", // slate-200
  ];
  return colors[index % colors.length];
}
