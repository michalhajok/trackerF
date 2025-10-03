/**
 * Positions Manager - NOWY KOMPONENT
 * Centralny manager do zarządzania pozycjami
 */
"use client";

import { useState } from "react";
import { usePositions } from "@/hooks/usePortfolios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Plus, Download, Filter, Grid3x3, List, BarChart3 } from "lucide-react";
import PositionsList from "./PositionsList.jsx";

export default function PositionsManager({ portfolioId }) {
  const [viewMode, setViewMode] = useState("table");
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
    sortBy: "openTime",
    sortOrder: "desc",
  });

  const {
    data: positions = [],
    isLoading,
    isError,
    refetch,
  } = usePositions(portfolioId, filters);

  const summary = {
    total: positions.length,
    open: positions.filter((p) => p.status === "open").length,
    closed: positions.filter((p) => p.status === "closed").length,
    totalValue: positions.reduce((sum, p) => sum + (p.currentValue || 0), 0),
    totalPL: positions.reduce((sum, p) => sum + (p.grossPL || 0), 0),
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
            <p className="text-xs text-slate-600">Total Positions</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.open}</p>
            <p className="text-xs text-slate-600">Open</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">
              {summary.closed}
            </p>
            <p className="text-xs text-slate-600">Closed</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(summary.totalValue)}
            </p>
            <p className="text-xs text-slate-600">Total Value</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p
              className={`text-lg font-bold ${
                summary.totalPL >= 0 ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatCurrency(summary.totalPL)}
            </p>
            <p className="text-xs text-slate-600">Total P&L</p>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "detailed" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("detailed")}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button href={`/dashboard/portfolios/${portfolioId}/positions/new`}>
              <Plus className="w-4 h-4 mr-1" />
              Add Position
            </Button>
          </div>
        </div>
      </Card>

      {/* Positions List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <Alert type="error" title="Failed to load positions">
          <Button onClick={refetch} className="mt-2">
            Try Again
          </Button>
        </Alert>
      ) : (
        <PositionsList
          positions={positions}
          viewMode={viewMode}
          onRefresh={refetch}
          portfolioId={portfolioId}
        />
      )}
    </div>
  );
}
