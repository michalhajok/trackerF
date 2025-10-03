"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMemo } from "react";

export default function PerformanceChart({ data, period, isLoading }) {
  const chartData = useMemo(() => {
    if (!data || !data.length) return null;

    // Process data for chart visualization
    return data.map((point, index) => ({
      date: new Date(point.date).toLocaleDateString("pl-PL"),
      value: parseFloat(point.value || 0),
      cumulative: parseFloat(point.cumulative || 0),
      percentage: parseFloat(point.percentage || 0),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">No performance data available</p>
              <p className="text-sm">Start trading to see your performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance - {period}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">
              Portfolio Performance Chart
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {chartData.length} data points available
            </div>

            {/* Simple data visualization until chart library is integrated */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">First</div>
                <div className="font-medium">
                  {chartData[0].percentage.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Latest</div>
                <div className="font-medium">
                  {chartData[chartData.length - 1].percentage.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Change</div>
                <div
                  className={`font-medium ${
                    chartData[chartData.length - 1].percentage >=
                    chartData[0].percentage
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    chartData[chartData.length - 1].percentage -
                    chartData[0].percentage
                  ).toFixed(2)}
                  %
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Chart visualization coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
