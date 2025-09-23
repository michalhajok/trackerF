/**
 * Allocation Chart Component
 * Pie chart showing portfolio allocation by various criteria
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useState } from "react";
import { PieChart, Download, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatPercent, getColorForIndex } from "@/lib/utils";

export default function AllocationChart() {
  const [groupBy, setGroupBy] = useState("symbol");
  const [showSmallAllocations, setShowSmallAllocations] = useState(true);

  const {
    data: allocationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allocation-chart", groupBy],
    queryFn: () => apiEndpoints.analytics.getAllocation({ groupBy }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const data = allocationData?.data || {};
  const allocation = data.allocation || [];
  const totalValue = data.totalValue || 0;

  // Filter small allocations if needed
  const filteredAllocation = showSmallAllocations
    ? allocation
    : allocation.filter((item) => item.percentage >= 1);

  const groupByOptions = [
    { value: "symbol", label: "By Symbol" },
    { value: "sector", label: "By Sector" },
    { value: "currency", label: "By Currency" },
    { value: "exchange", label: "By Exchange" },
    { value: "type", label: "By Type" },
  ];

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
            <PieChart className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>Unable to load allocation data</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PieChart className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-slate-900">
            Portfolio Allocation
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Select value={groupBy} onValueChange={setGroupBy} size="sm">
            {groupByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSmallAllocations(!showSmallAllocations)}
          >
            {showSmallAllocations ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showSmallAllocations ? "Hide Small" : "Show All"}
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {filteredAllocation.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>No allocation data available</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Placeholder */}
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Pie chart visualization</p>
              <p className="text-sm text-slate-500">
                Chart.js integration needed
              </p>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900">
                {groupByOptions.find((o) => o.value === groupBy)?.label}
              </h4>
              <p className="text-sm text-slate-500">
                Total: {formatCurrency(totalValue)}
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredAllocation.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded mr-3 flex-shrink-0"
                      style={{ backgroundColor: getColorForIndex(index) }}
                    />
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {item.label || "Unknown"}
                    </span>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-medium text-slate-900">
                      {formatPercent(item.percentage, 1)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                </div>
              ))}

              {!showSmallAllocations &&
                allocation.length > filteredAllocation.length && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-slate-300 rounded mr-3" />
                      <span className="text-sm font-medium text-slate-600">
                        Other ({allocation.length - filteredAllocation.length}{" "}
                        items)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-600">
                        {formatPercent(
                          allocation
                            .slice(filteredAllocation.length)
                            .reduce((sum, item) => sum + item.percentage, 0),
                          1
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatCurrency(
                          allocation
                            .slice(filteredAllocation.length)
                            .reduce((sum, item) => sum + item.value, 0)
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {allocation.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Total Positions</p>
            <p className="text-lg font-semibold text-slate-900">
              {allocation.length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Largest Allocation</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatPercent(
                Math.max(...allocation.map((a) => a.percentage)),
                1
              )}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Diversification</p>
            <p className="text-lg font-semibold text-slate-900">
              {allocation.filter((a) => a.percentage >= 5).length}
            </p>
            <p className="text-xs text-slate-500">positions 5%</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Concentration Risk</p>
            <p
              className={`text-lg font-semibold ${
                allocation
                  .slice(0, 3)
                  .reduce((sum, a) => sum + a.percentage, 0) > 60
                  ? "text-warning-600"
                  : "text-success-600"
              }`}
            >
              {formatPercent(
                allocation
                  .slice(0, 3)
                  .reduce((sum, a) => sum + a.percentage, 0),
                1
              )}
            </p>
            <p className="text-xs text-slate-500">top 3 holdings</p>
          </div>
        </div>
      )}
    </Card>
  );
}
