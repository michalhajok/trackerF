/**
 * Performance Chart Component
 * Chart showing portfolio performance over time
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function PerformanceChart() {
  const [period, setPeriod] = useState("1M");
  const [metric, setMetric] = useState("value");

  const {
    data: chartData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["performance-chart", period, metric],
    queryFn: () =>
      apiEndpoints.analytics.getPerformanceChart({ period, metric }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const data = chartData?.data || {};
  const performance = data.performance || {};

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>Unable to load performance data</p>
          </div>
        </div>
      </Card>
    );
  }

  const periods = [
    { value: "1W", label: "1 Week" },
    { value: "1M", label: "1 Month" },
    { value: "3M", label: "3 Months" },
    { value: "6M", label: "6 Months" },
    { value: "1Y", label: "1 Year" },
    { value: "ALL", label: "All Time" },
  ];

  const metrics = [
    { value: "value", label: "Portfolio Value" },
    { value: "returns", label: "Returns %" },
    { value: "drawdown", label: "Drawdown" },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-slate-900">
            Portfolio Performance
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Select value={metric} onValueChange={setMetric} size="sm">
            {metrics.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>

          <Select value={period} onValueChange={setPeriod} size="sm">
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Stats */}
      {performance && Object.keys(performance).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Start Value</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(performance.startValue)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Current Value</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(performance.endValue)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Absolute Return</p>
            <p
              className={`text-lg font-semibold ${
                (performance.absoluteReturn || 0) >= 0
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {formatCurrency(performance.absoluteReturn)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Percentage Return</p>
            <p
              className={`text-lg font-semibold ${
                (performance.percentageReturn || 0) >= 0
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {(performance.percentageReturn || 0) >= 0 ? "+" : ""}
              {formatPercent(performance.percentageReturn)}
            </p>
          </div>
        </div>
      )}

      {/* Chart Placeholder */}
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg mb-4">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Performance chart visualization</p>
          <p className="text-sm text-slate-500">Chart.js integration needed</p>
          {data.dataPoints && (
            <p className="text-xs text-slate-400 mt-2">
              {data.dataPoints.length} data points available
            </p>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      {performance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          {performance.volatility !== undefined && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Volatility</p>
              <p className="text-sm font-medium text-slate-900">
                {formatPercent(performance.volatility)}
              </p>
            </div>
          )}

          {performance.sharpeRatio !== undefined && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Sharpe Ratio</p>
              <p className="text-sm font-medium text-slate-900">
                {performance.sharpeRatio.toFixed(2)}
              </p>
            </div>
          )}

          {performance.maxDrawdown !== undefined && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Max Drawdown</p>
              <p className="text-sm font-medium text-error-600">
                {formatPercent(performance.maxDrawdown)}
              </p>
            </div>
          )}

          {performance.winRate !== undefined && (
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Win Rate</p>
              <p className="text-sm font-medium text-slate-900">
                {formatPercent(performance.winRate)}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
