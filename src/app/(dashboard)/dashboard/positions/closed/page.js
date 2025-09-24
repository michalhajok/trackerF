/**
 * Closed Positions Page
 * Displays all closed positions with historical performance
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { Download, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import PositionCard from "@/components/features/Positions/PositionCard";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function ClosedPositionsPage() {
  const [filters, setFilters] = useState({
    symbol: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "closeTime",
    sortOrder: "desc",
  });

  const {
    data: positionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["positions", { status: "closed", ...filters }],
    queryFn: () =>
      apiEndpoints.positions.getAll({ status: "closed", ...filters }),
    staleTime: 1000 * 60 * 5, // Closed positions change less frequently
  });

  const positions = positionsData?.data || [];
  const summary = positionsData?.summary || {};

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeletePosition = async (position) => {
    if (
      confirm(
        `Are you sure you want to delete the ${position.symbol} position?`
      )
    ) {
      // Delete mutation would be called here
      console.log("Delete position:", position._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-error-600">Failed to load closed positions</p>
        <Button variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Closed Positions
          </h1>
          <p className="text-slate-600 mt-1">
            {positions.length} historical position
            {positions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Realized P&L</p>
                <p
                  className={`text-xl font-semibold ${
                    (summary.totalPL || 0) >= 0
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {formatCurrency(summary.totalPL || 0)}
                </p>
              </div>
              <TrendingDown
                className={`w-8 h-8 ${
                  (summary.totalPL || 0) >= 0
                    ? "text-success-600"
                    : "text-error-600"
                }`}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Win Rate</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatPercent(summary.winRate || 0)}
                </p>
                <p className="text-xs text-slate-500">
                  {summary.winningPositions || 0} of {positions.length}
                </p>
              </div>
              <Badge
                variant={(summary.winRate || 0) >= 50 ? "success" : "warning"}
              >
                {(summary.winRate || 0) >= 50 ? "Good" : "Poor"}
              </Badge>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Best Position</p>
                <p className="text-xl font-semibold text-success-600">
                  {summary.bestPosition
                    ? formatPercent(summary.bestPosition.return)
                    : "N/A"}
                </p>
                <p className="text-xs text-slate-500">
                  {summary.bestPosition?.symbol || "None"}
                </p>
              </div>
              <div className="w-2 h-8 bg-success-500 rounded"></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Worst Position</p>
                <p className="text-xl font-semibold text-error-600">
                  {summary.worstPosition
                    ? formatPercent(summary.worstPosition.return)
                    : "N/A"}
                </p>
                <p className="text-xs text-slate-500">
                  {summary.worstPosition?.symbol || "None"}
                </p>
              </div>
              <div className="w-2 h-8 bg-error-500 rounded"></div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search by symbol..."
            value={filters.symbol}
            onChange={(e) => handleFilterChange("symbol", e.target.value)}
          />

          <Input
            type="date"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />

          <Input
            type="date"
            placeholder="To date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <option value="closeTime">Close Date</option>
            <option value="symbol">Symbol</option>
            <option value="grossPL">P&L</option>
            <option value="plPercentage">Return %</option>
            <option value="duration">Duration</option>
          </Select>

          <Select
            value={filters.sortOrder}
            onValueChange={(value) => handleFilterChange("sortOrder", value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </div>
      </Card>

      {/* Positions Grid */}
      {positions.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingDown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No closed positions
          </h3>
          <p className="text-slate-600 mb-6">
            {filters.symbol || filters.dateFrom || filters.dateTo
              ? "No positions match your search criteria."
              : "Your closed positions will appear here once you close some positions."}
          </p>
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                symbol: "",
                dateFrom: "",
                dateTo: "",
                sortBy: "closeTime",
                sortOrder: "desc",
              })
            }
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map((position) => (
            <PositionCard
              key={position._id}
              position={position}
              onDelete={handleDeletePosition}
              // Edit is disabled for closed positions
              onEdit={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
