"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const COLORS = [
  "#218099",
  "#32b8c5",
  "#5eedd8",
  "#99f6e4",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
];

export default function AllocationChart({ data, groupBy, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">No allocation data available</p>
              <p className="text-sm">
                Add positions to see portfolio allocation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display top 8 items
  const topItems = data.slice(0, 8);
  const totalOthers = data
    .slice(8)
    .reduce((sum, item) => sum + item.percentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation - {groupBy}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{item.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">
                  ${item.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {totalOthers > 0 && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3 bg-gray-300" />
                <span className="font-medium text-gray-600">Others</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{totalOthers.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">Visual pie chart coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
