/**
 * WatchlistTable.js - Advanced watchlist table component
 * Displays symbols in table format with sorting, filtering and actions
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  TrashIcon,
  BellIcon,
  PlusIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useWatchlist,
  useRemoveSymbolFromWatchlist,
  useUpdateWatchlistSymbol,
} from "../../hooks/useWatchlist";
import { useBatchMarketData } from "../../hooks/useMarketData";
import { usePriceAlerts } from "../../hooks/usePriceAlerts";

const WatchlistTable = ({
  watchlistId,
  symbols = [],
  onSymbolClick,
  onCreateAlert,
  onRemoveSymbol,
  showActions = true,
  showFilters = true,
  showVolume = true,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("symbol"); // symbol, price, change, volume, marketCap
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterSector, setFilterSector] = useState("all");
  const [filterChange, setFilterChange] = useState("all"); // all, gainers, losers
  const [selectedSymbols, setSelectedSymbols] = useState(new Set());

  // Get real-time market data
  const {
    symbols: marketData,
    isLoading: dataLoading,
    lastUpdated,
  } = useBatchMarketData(
    symbols.map((s) => (typeof s === "string" ? s : s.symbol))
  );

  // Get price alerts for symbols
  const { data: alerts } = usePriceAlerts(watchlistId);

  // Mutations
  const removeSymbolMutation = useRemoveSymbolFromWatchlist();
  const updateSymbolMutation = useUpdateWatchlistSymbol();

  // Process and filter symbols
  const processedSymbols = useMemo(() => {
    const enrichedSymbols = symbols.map((symbolRef) => {
      const symbolStr =
        typeof symbolRef === "string" ? symbolRef : symbolRef.symbol;
      const marketInfo = marketData.find((m) => m.symbol === symbolStr);
      const symbolAlerts = alerts?.filter((a) => a.symbol === symbolStr) || [];

      return {
        symbol: symbolStr,
        notes: typeof symbolRef === "object" ? symbolRef.notes : "",
        addedAt:
          typeof symbolRef === "object"
            ? symbolRef.addedAt
            : new Date().toISOString(),
        isFavorite:
          typeof symbolRef === "object" ? symbolRef.isFavorite : false,
        tags: typeof symbolRef === "object" ? symbolRef.tags : [],

        // Market data
        currentPrice: marketInfo?.currentPrice || 0,
        change: marketInfo?.change || 0,
        changePercent: marketInfo?.changePercent || 0,
        volume: marketInfo?.volume || 0,
        marketCap: marketInfo?.marketCap || 0,
        name: marketInfo?.name || symbolStr,
        sector: marketInfo?.sector || "Unknown",
        dayHigh: marketInfo?.dayHigh || 0,
        dayLow: marketInfo?.dayLow || 0,

        // Alerts
        alerts: symbolAlerts,
        hasAlerts: symbolAlerts.length > 0,
      };
    });

    // Apply filters
    let filtered = enrichedSymbols;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.sector.toLowerCase().includes(query)
      );
    }

    // Sector filter
    if (filterSector !== "all") {
      filtered = filtered.filter((s) => s.sector === filterSector);
    }

    // Change filter
    if (filterChange === "gainers") {
      filtered = filtered.filter((s) => s.changePercent > 0);
    } else if (filterChange === "losers") {
      filtered = filtered.filter((s) => s.changePercent < 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const modifier = sortOrder === "desc" ? -1 : 1;
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

    return filtered;
  }, [
    symbols,
    marketData,
    alerts,
    searchQuery,
    sortField,
    sortOrder,
    filterSector,
    filterChange,
  ]);

  // Get unique sectors for filter
  const uniqueSectors = useMemo(() => {
    const sectors = [...new Set(processedSymbols.map((s) => s.sector))].filter(
      Boolean
    );
    return sectors.sort();
  }, [processedSymbols]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleSelectSymbol = (symbol, checked) => {
    const newSelected = new Set(selectedSymbols);
    if (checked) {
      newSelected.add(symbol);
    } else {
      newSelected.delete(symbol);
    }
    setSelectedSymbols(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSymbols.size === processedSymbols.length) {
      setSelectedSymbols(new Set());
    } else {
      setSelectedSymbols(new Set(processedSymbols.map((s) => s.symbol)));
    }
  };

  const handleBulkAction = async (action) => {
    const symbolsToProcess = Array.from(selectedSymbols);

    if (action === "remove" && symbolsToProcess.length > 0) {
      if (
        confirm(`Remove ${symbolsToProcess.length} symbols from watchlist?`)
      ) {
        try {
          await Promise.all(
            symbolsToProcess.map((symbol) =>
              removeSymbolMutation.mutateAsync({ watchlistId, symbol })
            )
          );
          setSelectedSymbols(new Set());
        } catch (error) {
          console.error("Bulk remove failed:", error);
          alert("Failed to remove symbols");
        }
      }
    }
  };

  const handleRemoveSymbol = async (symbol) => {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
      try {
        await removeSymbolMutation.mutateAsync({ watchlistId, symbol });
        onRemoveSymbol?.(symbol);
      } catch (error) {
        console.error("Remove symbol failed:", error);
        alert("Failed to remove symbol");
      }
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000)
      return price.toLocaleString("en-US", { minimumFractionDigits: 2 });
    return price.toFixed(2);
  };

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return (
      <ArrowsUpDownIcon
        className={`h-4 w-4 transform transition-transform ${
          sortOrder === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Watchlist Symbols
            </h3>
            <p className="text-sm text-gray-600">
              {processedSymbols.length} symbols
              {lastUpdated && (
                <span className="ml-2">
                  • Updated {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          {selectedSymbols.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedSymbols.size} selected
              </span>
              <button
                onClick={() => handleBulkAction("remove")}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>

            {/* Change Filter */}
            <select
              value={filterChange}
              onChange={(e) => setFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Changes</option>
              <option value="gainers">Gainers Only</option>
              <option value="losers">Losers Only</option>
            </select>

            {/* View Options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedSymbols(new Set())}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {dataLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading symbol data...</p>
          </div>
        ) : processedSymbols.length === 0 ? (
          <div className="p-8 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Symbols Found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try different search terms"
                : "Add symbols to your watchlist"}
            </p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedSymbols.size > 0 &&
                      selectedSymbols.size === processedSymbols.length
                    }
                    onChange={(e) => handleSelectAll()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    {getSortIcon("symbol")}
                  </div>
                </th>

                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("currentPrice")}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price</span>
                    {getSortIcon("currentPrice")}
                  </div>
                </th>

                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("changePercent")}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Change</span>
                    {getSortIcon("changePercent")}
                  </div>
                </th>

                {showVolume && (
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("volume")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Volume</span>
                      {getSortIcon("volume")}
                    </div>
                  </th>
                )}

                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("marketCap")}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Market Cap</span>
                    {getSortIcon("marketCap")}
                  </div>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>

                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>

                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {processedSymbols.map((symbol) => (
                <tr
                  key={symbol.symbol}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSymbolClick?.(symbol)}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymbols.has(symbol.symbol)}
                      onChange={(e) =>
                        handleSelectSymbol(symbol.symbol, e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>

                  {/* Symbol */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        {symbol.isFavorite && (
                          <StarIconSolid className="h-4 w-4 text-yellow-500" />
                        )}

                        {/* Real-time indicator */}
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {symbol.symbol}
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-32">
                          {symbol.name}
                        </div>

                        {/* Tags */}
                        {symbol.tags && symbol.tags.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {symbol.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${formatPrice(symbol.currentPrice)}
                    </div>
                    {symbol.dayHigh > 0 && symbol.dayLow > 0 && (
                      <div className="text-xs text-gray-500">
                        ${symbol.dayLow.toFixed(2)} - $
                        {symbol.dayHigh.toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Change */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div>
                        <div
                          className={`text-sm font-medium ${getChangeColor(
                            symbol.change
                          )}`}
                        >
                          {symbol.change >= 0 ? "+" : ""}$
                          {symbol.change.toFixed(2)}
                        </div>
                        <div
                          className={`text-sm font-medium ${getChangeColor(
                            symbol.changePercent
                          )}`}
                        >
                          ({symbol.changePercent >= 0 ? "+" : ""}
                          {symbol.changePercent.toFixed(2)}%)
                        </div>
                      </div>

                      {symbol.changePercent !== 0 && (
                        <div className="flex-shrink-0">
                          {symbol.changePercent >= 0 ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Volume */}
                  {showVolume && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatVolume(symbol.volume)}
                      </div>
                    </td>
                  )}

                  {/* Market Cap */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatMarketCap(symbol.marketCap)}
                    </div>
                  </td>

                  {/* Sector */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {symbol.sector}
                    </span>
                  </td>

                  {/* Alerts */}
                  <td
                    className="px-6 py-4 whitespace-nowrap text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {symbol.hasAlerts ? (
                      <div className="relative">
                        <BellIcon className="h-5 w-5 text-orange-500 mx-auto" />
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {symbol.alerts.length}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onCreateAlert?.(symbol.symbol)}
                        className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Create price alert"
                      >
                        <BellIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  {showActions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSymbolClick?.(symbol)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View symbol details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => onCreateAlert?.(symbol.symbol)}
                          className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Create alert"
                        >
                          <BellIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleRemoveSymbol(symbol.symbol)}
                          disabled={removeSymbolMutation.isLoading}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Remove from watchlist"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{processedSymbols.length} symbols shown</span>
            {selectedSymbols.size > 0 && (
              <span>{selectedSymbols.size} selected</span>
            )}

            {/* Quick Stats */}
            <div className="flex items-center space-x-3">
              <span className="text-green-600">
                {processedSymbols.filter((s) => s.changePercent > 0).length}{" "}
                gainers
              </span>
              <span className="text-red-600">
                {processedSymbols.filter((s) => s.changePercent < 0).length}{" "}
                losers
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export */}
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors">
              Export CSV
            </button>

            {/* Add Symbol */}
            <button
              onClick={() => onAddSymbol?.(watchlistId)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Symbol
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary Bar */}
      <div className="px-6 py-2 bg-gradient-to-r from-red-100 via-gray-100 to-green-100">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
            <span className="text-red-600 font-medium">
              {processedSymbols.filter((s) => s.changePercent < 0).length}
            </span>
          </div>

          <div className="w-32 bg-gray-300 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  processedSymbols.length > 0
                    ? (processedSymbols.filter((s) => s.changePercent > 0)
                        .length /
                        processedSymbols.length) *
                      100
                    : 50
                }%`,
              }}
            ></div>
          </div>

          <div className="flex items-center space-x-1">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">
              {processedSymbols.filter((s) => s.changePercent > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Watchlist Table for smaller spaces
export const CompactWatchlistTable = ({
  symbols = [],
  onSymbolClick,
  showChange = true,
  maxHeight = "300px",
  className = "",
}) => {
  const { symbols: marketData } = useBatchMarketData(
    symbols.map((s) => (typeof s === "string" ? s : s.symbol))
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900">
          Watchlist ({marketData.length})
        </h4>
      </div>

      <div
        className="divide-y divide-gray-200 overflow-y-auto"
        style={{ maxHeight }}
      >
        {marketData.map((symbol) => (
          <div
            key={symbol.symbol}
            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSymbolClick?.(symbol)}
          >
            <div>
              <div className="text-sm font-medium text-gray-900">
                {symbol.symbol}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-24">
                {symbol.name}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                ${symbol.currentPrice?.toFixed(2)}
              </div>
              {showChange && (
                <div
                  className={`text-xs font-medium ${getChangeColor(
                    symbol.changePercent
                  )}`}
                >
                  {symbol.changePercent >= 0 ? "+" : ""}
                  {symbol.changePercent?.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        ))}

        {marketData.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No symbols in watchlist
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistTable;
