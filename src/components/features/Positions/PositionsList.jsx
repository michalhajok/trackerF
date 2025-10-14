"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

// Dynamic import dla heavy components
const PositionCard = dynamic(() => import("./PositionCard.jsx"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const PositionDetails = dynamic(() => import("./PositionDetails.jsx"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export default function PositionsList({
  positions = [],
  onRefresh,
  portfolioId,
  viewMode = "table",
}) {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const [expandedSymbols, setExpandedSymbols] = useState(new Set());
  const { success, error: showError } = useToast();

  // Grupowanie pozycji według symbolu z kalkulacjami
  const groupedPositions = useMemo(() => {
    const groups = {};

    positions.forEach((position) => {
      const symbol = position.symbol;

      if (!groups[symbol]) {
        groups[symbol] = {
          symbol,
          positions: [],
          totalVolume: 0,
          totalValue: 0,
          totalPL: 0,
          weightedAvgPrice: 0,
          currentPrice: 0,
          instrumentType: position.type || position.assetType || "Unknown",
        };
      }

      const group = groups[symbol];
      group.positions.push(position);

      // Kalkulacje dla zagregowanych danych
      const positionValue = position.openPrice * position.volume;
      group.totalVolume += position.volume;
      group.totalValue += position.currentValue || positionValue;
      group.totalPL += position.grossPL || 0;

      // Średnia ważona cena otwarcia
      const totalInvestment = group.positions.reduce(
        (sum, pos) => sum + pos.openPrice * pos.volume,
        0
      );
      group.weightedAvgPrice = totalInvestment / group.totalVolume;

      // Aktualna cena (używamy najnowszej dostępnej)
      group.currentPrice =
        position.marketPrice ||
        position.currentPrice ||
        position.closePrice ||
        0;
    });

    return Object.values(groups);
  }, [positions]);

  const toggleSymbol = (symbol) => {
    const newExpanded = new Set(expandedSymbols);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedSymbols(newExpanded);
  };

  const handleEdit = (position) => {
    console.log("Edit position:", position);
  };

  const handleDelete = async (position) => {
    if (
      confirm(`Are you sure you want to delete position ${position.symbol}?`)
    ) {
      try {
        success("Position deleted successfully");
        onRefresh?.();
      } catch (error) {
        showError("Failed to delete position");
      }
    }
  };

  const handleClose = async (position) => {
    try {
      success("Position closed successfully");
      onRefresh?.();
    } catch (error) {
      showError("Failed to close position");
    }
  };

  if (positions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No positions found
          </h3>
          <p className="text-slate-600 mb-6">
            Start building your portfolio by adding your first position.
          </p>
          <Button
            href={`/dashboard/portfolios/${portfolioId}/positions/new`}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Position
          </Button>
        </div>
      </Card>
    );
  }

  // Table View z grupowaniem po symbolu
  if (viewMode === "table") {
    return (
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Total P&L</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedPositions.map((group) => {
                const isExpanded = expandedSymbols.has(group.symbol);
                const isProfit = group.totalPL >= 0;
                const plPercentage =
                  ((group.currentPrice - group.weightedAvgPrice) /
                    group.weightedAvgPrice) *
                  100;

                return (
                  <React.Fragment key={`group-${group.symbol}`}>
                    {/* Wiersz główny - podsumowanie symbolu */}
                    <TableRow className="font-medium bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSymbol(group.symbol)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>

                          <div className="text-primary-600 hover:text-primary-800 font-semibold">
                            {group.symbol}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.instrumentType}</Badge>
                      </TableCell>
                      <TableCell>
                        {group.totalVolume.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(group.weightedAvgPrice)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(group.currentPrice)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${
                            isProfit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isProfit ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-medium">
                            {formatCurrency(group.totalPL)}
                          </span>
                        </div>
                        <div
                          className={`text-xs ${
                            isProfit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatPercent(plPercentage)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {group.positions.length} position
                          {group.positions.length !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSymbol(group.symbol)}
                        >
                          {isExpanded ? "Collapse" : "Expand"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Rozwinięte pozycje */}
                    {isExpanded &&
                      group.positions.map((position) => (
                        <TableRow key={position._id} className="bg-blue-50/50">
                          <TableCell className="pl-12">
                            <span className="text-sm text-gray-600">
                              #{position._id.slice(-6)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                position.type === "BUY"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {position.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {position.volume?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(position.openPrice)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              position.marketPrice || position.closePrice
                            )}
                          </TableCell>
                          <TableCell>
                            <div
                              className={`flex items-center gap-1 ${
                                (position.grossPL || 0) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(position.grossPL || 0) >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span className="font-medium">
                                {formatCurrency(position.grossPL)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPercent(position.plPercentage)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                position.status === "open"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {position.status.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(position.openTime, "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewDetailsId(position._id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(position)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              {position.status === "open" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleClose(position)}
                                  className="text-orange-600"
                                >
                                  Close
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(position)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  // Cards View z grupowaniem (bez zmian)
  if (viewMode === "cards") {
    return (
      <div className="space-y-6">
        {groupedPositions.map((group) => {
          const isExpanded = expandedSymbols.has(group.symbol);
          const isProfit = group.totalPL >= 0;

          return (
            <div key={group.symbol} className="space-y-4">
              {/* Card podsumowania symbolu */}
              <Card className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSymbol(group.symbol)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{group.symbol}</h3>
                      <p className="text-sm text-gray-600">
                        {group.positions.length} position
                        {group.positions.length !== 1 ? "s" : ""} •
                        {group.totalVolume.toLocaleString()} shares
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(group.currentPrice)}
                    </div>
                    <div
                      className={`flex items-center gap-1 justify-end ${
                        isProfit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {formatCurrency(group.totalPL)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Rozwinięte karty pozycji */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-8">
                  {group.positions.map((position) => (
                    <PositionCard
                      key={position._id}
                      position={position}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClose={handleClose}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Detailed View pozostaje bez zmian dla uproszczenia
  return (
    <div className="space-y-6">
      {positions.map((position) => (
        <PositionDetails
          key={position._id}
          position={position}
          showActions={true}
        >
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(position)}
            >
              <Edit className="w-3 h-3" />
              Edit
            </Button>
            {position.status === "open" && (
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleClose(position)}
              >
                Close
              </Button>
            )}
            <Button
              size="sm"
              variant="error"
              onClick={() => handleDelete(position)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        </PositionDetails>
      ))}
    </div>
  );
}
