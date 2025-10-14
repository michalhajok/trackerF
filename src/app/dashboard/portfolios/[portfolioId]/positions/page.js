"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Plus, Download, Filter } from "lucide-react";
import { usePositions } from "@/hooks/usePositions";
import { useToast } from "@/contexts/ToastContext";

// Dynamic import dla heavy components (CODE SPLITTING)
const PositionsList = dynamic(
  () => import("@/components/features/Positions/PositionsList.jsx"),
  {
    loading: () => (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

export default function PositionsPage() {
  const { portfolioId } = useParams();
  const { success, error: showError } = useToast();

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "openTime",
    sortOrder: "desc",
    type: "all",
  });

  const {
    positions,
    isLoading,
    error,
    // refetch,
  } = usePositions(portfolioId, filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      // TODO: Implement export functionality
      success("Export functionality coming soon!");
    } catch (error) {
      showError("Failed to export positions");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" title="Error Loading Positions">
          Failed to load positions. Please try refreshing the page.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Positions</h1>
          <p className="text-slate-600">
            Manage your portfolio positions ({positions.length} total)
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            href={`/dashboard/portfolios/${portfolioId}/positions/new`}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Input
              placeholder="Search symbol..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </Select>

          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </Select>

          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="openTime">Open Date</option>
            <option value="symbol">Symbol</option>
            <option value="grossPL">P&L</option>
            <option value="currentValue">Value</option>
          </Select>

          <Select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </Select>
        </div>
      </Card>

      {/* Positions List - Używa komponentu z features */}
      <PositionsList
        positions={positions}
        onRefresh={console.log("asd")}
        portfolioId={portfolioId}
      />
    </div>
  );
}
