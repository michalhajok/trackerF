/**
 * Positions List Component
 * Displays a list of trading positions with filters and actions
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import Link from "next/link";

export default function PositionsList() {
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    symbol: "",
    sortBy: "openTime",
    sortOrder: "desc",
  });

  const {
    data: positionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["positions-list", filters],
    queryFn: () => apiEndpoints.positions.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const positions = positionsData?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-slate-200 rounded w-32"></div>
                <div className="h-5 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-error-600">Failed to load positions</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <option value="all">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </Select>

          <Input
            placeholder="Search symbol..."
            value={filters.symbol}
            onChange={(e) => handleFilterChange("symbol", e.target.value)}
          />

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <option value="openTime">Open Date</option>
            <option value="symbol">Symbol</option>
            <option value="grossPL">P&L</option>
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

      {/* Positions List */}
      {positions.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No positions found
          </h3>
          <p className="text-slate-600 mb-6">
            {filters.symbol ||
            filters.status !== "all" ||
            filters.type !== "all"
              ? "Try adjusting your filters to see more positions."
              : "Create your first position to start tracking your portfolio."}
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Position
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {positions.map((position) => (
            <PositionCard key={position._id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionCard({ position }) {
  const isOpen = position.status === "open";
  const isProfit = (position.grossPL || 0) >= 0;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Link
              href={`/dashboard/positions/${position._id}`}
              className="text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
            >
              {position.symbol}
            </Link>
            <Badge variant={position.type === "BUY" ? "success" : "error"}>
              {position.type}
            </Badge>
            <Badge variant={isOpen ? "warning" : "default"}>
              {position.status.toUpperCase()}
            </Badge>
            {position.name && (
              <span className="text-sm text-slate-500 truncate">
                {position.name}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Volume</p>
              <p className="font-medium">{position.volume?.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Open Price</p>
              <p className="font-medium">
                {formatCurrency(position.openPrice)}
              </p>
            </div>

            {isOpen ? (
              <div>
                <p className="text-xs text-slate-500 mb-1">Market Price</p>
                <p className="font-medium">
                  {formatCurrency(position.marketPrice)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-1">Close Price</p>
                <p className="font-medium">
                  {formatCurrency(position.closePrice)}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-1">Value</p>
              <p className="font-medium">
                {formatCurrency(
                  isOpen ? position.currentValue : position.saleValue
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">P&L</p>
              <div className="flex items-center">
                <p
                  className={`font-medium ${
                    isProfit ? "text-success-600" : "text-error-600"
                  }`}
                >
                  {formatCurrency(position.grossPL)}
                </p>
                {isProfit ? (
                  <TrendingUp className="w-3 h-3 text-success-600 ml-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-error-600 ml-1" />
                )}
              </div>
              <p
                className={`text-xs ${
                  isProfit ? "text-success-600" : "text-error-600"
                }`}
              >
                {formatPercent(position.plPercentage)}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <span>Opened: {formatDate(position.openTime)}</span>
              {!isOpen && <span>Closed: {formatDate(position.closeTime)}</span>}
              {position.exchange && <span>Exchange: {position.exchange}</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-6">
          <Link href={`/dashboard/positions/${position._id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error-600 hover:text-error-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
