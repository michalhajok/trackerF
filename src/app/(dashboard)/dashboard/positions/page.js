/**
 * Positions Page
 * Display all trading positions
 */

"use client";

import { useState } from "react";
import { useOpenPositions, useClosedPositions } from "@/hooks/usePositions";
import { Plus, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

export default function PositionsPage() {
  const [activeTab, setActiveTab] = useState("open");

  const {
    data: openPositions,
    isLoading: openLoading,
    error: openError,
  } = useOpenPositions();

  const {
    data: closedPositions,
    isLoading: closedLoading,
    error: closedError,
  } = useClosedPositions();

  const isLoading = activeTab === "open" ? openLoading : closedLoading;
  const error = activeTab === "open" ? openError : closedError;
  const positions = activeTab === "open" ? openPositions : closedPositions;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    const formatted = (value || 0).toFixed(2);
    return `${value > 0 ? "+" : ""}${formatted}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Positions</h1>
          <p className="text-slate-600">Manage your trading positions</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Position
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("open")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "open"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Open Positions
            {openPositions && (
              <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {openPositions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "closed"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Closed Positions
            {closedPositions && (
              <span className="ml-2 bg-surface-100 text-slate-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {closedPositions.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Alert variant="error">
          Failed to load positions. Please try again later.
        </Alert>
      )}

      {!isLoading && !error && positions && (
        <>
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No {activeTab} positions
              </h3>
              <p className="text-slate-600 mb-6">
                {activeTab === "open"
                  ? "You don't have any open positions yet. Create your first position to get started."
                  : "No closed positions found. Your completed trades will appear here."}
              </p>
              {activeTab === "open" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Position
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {positions.map((position) => (
                <PositionCard key={position._id} position={position} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Position Card Component
function PositionCard({ position }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    const formatted = (value || 0).toFixed(2);
    return `${value > 0 ? "+" : ""}${formatted}%`;
  };

  const isProfit = (position.grossPL || 0) >= 0;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {position.symbol}
            </h3>
            <Badge variant={position.type === "BUY" ? "success" : "error"}>
              {position.type}
            </Badge>
            <Badge variant={position.status === "open" ? "warning" : "default"}>
              {position.status}
            </Badge>
          </div>

          {position.name && (
            <p className="text-sm text-slate-600 mb-3">{position.name}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            <div>
              <p className="text-xs text-slate-500 mb-1">Current Price</p>
              <p className="font-medium">
                {position.status === "open"
                  ? formatCurrency(position.marketPrice)
                  : formatCurrency(position.closePrice)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Value</p>
              <p className="font-medium">
                {formatCurrency(
                  position.status === "open"
                    ? position.currentValue
                    : position.saleValue
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right ml-6">
          <div
            className={`text-lg font-bold ${
              isProfit ? "text-success-600" : "text-error-600"
            }`}
          >
            {formatCurrency(position.grossPL)}
          </div>
          <div
            className={`text-sm ${
              isProfit ? "text-success-600" : "text-error-600"
            }`}
          >
            {formatPercent(position.plPercentage)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(position.openTime).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
