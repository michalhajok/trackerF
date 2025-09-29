/**
 * Portfolio Chart Component
 * Chart visualization for portfolio performance
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useState } from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PortfolioChart() {
  const [period, setPeriod] = useState("1M");
  const [chartType, setChartType] = useState("value");

  const {
    data: chartData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolio-chart", period, chartType],
    queryFn: () =>
      apiEndpoints.analytics.getPortfolioChart({ period, type: chartType }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const data = chartData?.data || {};

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
            <p>Unable to load chart data</p>
          </div>
        </div>
      </Card>
    );
  }

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
          <Select value={chartType} onValueChange={setChartType} size="sm">
            <option value="value">Portfolio Value</option>
            <option value="returns">Returns</option>
            <option value="allocation">Allocation</option>
          </Select>

          <Select value={period} onValueChange={setPeriod} size="sm">
            <option value="1W">1 Week</option>
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </Select>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Chart visualization would go here</p>
          <p className="text-sm text-slate-500">Chart.js integration needed</p>
          {data.timeline && (
            <p className="text-xs text-slate-400 mt-2">
              {data.timeline.length} data points available
            </p>
          )}
        </div>
      </div>

      {/* Chart Summary */}
      {data.summary && (
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-600">Start Value</p>
            <p className="text-lg font-semibold text-slate-900">
              ${data.summary.startValue?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Current Value</p>
            <p className="text-lg font-semibold text-slate-900">
              ${data.summary.endValue?.toLocaleString() || "0"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Change</p>
            <p
              className={`text-lg font-semibold ${
                (data.summary.change || 0) >= 0
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {(data.summary.change || 0) >= 0 ? "+" : ""}
              {((data.summary.change || 0) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
