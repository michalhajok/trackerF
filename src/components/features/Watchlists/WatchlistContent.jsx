"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
} from "lucide-react";

const formatCurrency = (value) => `$${value?.toFixed(2) || "0.00"}`;
const formatPercent = (value) => `${value?.toFixed(2) || "0.00"}%`;

export default function WatchlistContent({
  watchlist,
  onAddSymbol,
  onRefresh,
}) {
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
    showAlerts: "all",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter and sort items
  const filteredItems = (watchlist.items || [])
    .filter((item) => {
      if (
        filters.search &&
        !item.symbol.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.showAlerts !== "all") {
        const hasActiveAlerts = item.priceAlerts?.some(
          (alert) => alert.isActive
        );
        if (filters.showAlerts === "with_alerts" && !hasActiveAlerts)
          return false;
        if (filters.showAlerts === "without_alerts" && hasActiveAlerts)
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === "addedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleRemoveSymbol = async (symbol) => {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
      try {
        // TODO: Implement remove symbol API call
        console.log("Remove symbol:", symbol);
        onRefresh?.();
      } catch (error) {
        console.error("Failed to remove symbol:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{watchlist.name}</CardTitle>
            {watchlist.description && (
              <p className="text-sm text-gray-600 mt-1">
                {watchlist.description}
              </p>
            )}
          </div>
          <Button onClick={onAddSymbol}>
            <Plus className="w-4 h-4 mr-2" />
            Add Symbol
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search symbols..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            placeholder="Sort by"
          >
            <SelectOption value="symbol">Symbol</SelectOption>
            <SelectOption value="addedAt">Date Added</SelectOption>
            <SelectOption value="currentPrice">Price</SelectOption>
            <SelectOption value="dayChange">Change %</SelectOption>
          </Select>

          <Select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            placeholder="Order"
          >
            <SelectOption value="asc">Ascending</SelectOption>
            <SelectOption value="desc">Descending</SelectOption>
          </Select>

          <Select
            value={filters.showAlerts}
            onChange={(e) => handleFilterChange("showAlerts", e.target.value)}
            placeholder="Alerts"
          >
            <SelectOption value="all">All Symbols</SelectOption>
            <SelectOption value="with_alerts">With Alerts</SelectOption>
            <SelectOption value="without_alerts">No Alerts</SelectOption>
          </Select>
        </div>

        {/* Symbols Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {filters.search
                ? "No matching symbols"
                : "No symbols in watchlist"}
            </div>
            <p className="text-gray-400 mb-6">
              {filters.search
                ? "Try adjusting your search terms"
                : "Add some symbols to start tracking"}
            </p>
            {!filters.search && (
              <Button onClick={onAddSymbol}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Symbol
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <WatchlistSymbolRow
                    key={item.symbol}
                    item={item}
                    onRemove={handleRemoveSymbol}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistSymbolRow({ item, onRemove }) {
  const hasAlerts = item.priceAlerts?.some((alert) => alert.isActive);
  const dayChange = item.dayChange || 0;
  const dayChangePercent = item.dayChangePercent || 0;

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-mono font-medium">
        <div>
          <div className="font-semibold">{item.symbol}</div>
          {item.companyName && (
            <div className="text-xs text-gray-500 truncate max-w-32">
              {item.companyName}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className="text-right font-mono">
        {formatCurrency(item.currentPrice || 0)}
      </TableCell>

      <TableCell className="text-right">
        <div
          className={`flex flex-col items-end ${
            dayChange >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <div className="flex items-center gap-1">
            {dayChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="font-medium">
              {formatPercent(dayChangePercent)}
            </span>
          </div>
          <div className="text-xs">{formatCurrency(dayChange)}</div>
        </div>
      </TableCell>

      <TableCell className="max-w-32">
        <div className="truncate" title={item.notes}>
          {item.notes || "-"}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1">
          {hasAlerts ? (
            <Bell className="w-4 h-4 text-blue-500" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-300" />
          )}
          <span className="text-xs text-gray-500">
            {item.priceAlerts?.filter((a) => a.isActive).length || 0}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-gray-500">
        {new Date(item.addedAt).toLocaleDateString("pl-PL")}
      </TableCell>

      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.symbol)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
