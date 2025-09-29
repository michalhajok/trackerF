/**
 * WatchlistCard.js - Watchlist card component
 * Displays watchlist information with summary and quick actions
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShareIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useWatchlist,
  useDeleteWatchlist,
  useUpdateWatchlist,
  useWatchlistStats,
} from "@/hooks/useWatchlists";
import { useBatchMarketData } from "@/hooks/useMarketData";
import { formatDistanceToNow } from "date-fns";

const WatchlistCard = ({
  watchlist,
  variant = "default", // default, compact, detailed
  showActions = true,
  showStats = true,
  onEdit,
  onView,
  onShare,
  onAddSymbol,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Get watchlist symbols data
  const { symbols: symbolsData, isLoading: symbolsLoading } =
    useBatchMarketData(watchlist.symbols || []);

  // Get watchlist statistics
  const { data: stats, isLoading: statsLoading } = useWatchlistStats(
    watchlist.id,
    { enabled: showStats }
  );

  // Mutations
  const deleteWatchlistMutation = useDeleteWatchlist();
  const updateWatchlistMutation = useUpdateWatchlist();

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!symbolsData || symbolsData.length === 0) {
      return {
        totalSymbols: watchlist.symbols?.length || 0,
        avgChange: 0,
        gainers: 0,
        losers: 0,
        totalValue: 0,
        topGainer: null,
        topLoser: null,
      };
    }

    const changes = symbolsData.map((s) => s.changePercent || 0);
    const avgChange =
      changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const gainers = changes.filter((c) => c > 0).length;
    const losers = changes.filter((c) => c < 0).length;
    const totalValue = symbolsData.reduce(
      (sum, s) => sum + s.currentPrice * (s.shares || 1),
      0
    );

    const sortedByChange = [...symbolsData].sort(
      (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
    );
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    return {
      totalSymbols: symbolsData.length,
      avgChange,
      gainers,
      losers,
      totalValue,
      topGainer,
      topLoser,
    };
  }, [symbolsData, watchlist.symbols]);

  const handleDelete = async () => {
    if (
      confirm(`Are you sure you want to delete "${watchlist.name}" watchlist?`)
    ) {
      try {
        await deleteWatchlistMutation.mutateAsync(watchlist.id);
      } catch (error) {
        console.error("Failed to delete watchlist:", error);
        alert("Failed to delete watchlist");
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await updateWatchlistMutation.mutateAsync({
        id: watchlist.id,
        updates: { isFavorite: !watchlist.isFavorite },
      });
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeBgColor = (change) => {
    if (change > 1) return "bg-green-100 border-green-300";
    if (change > 0) return "bg-green-50 border-green-200";
    if (change < -1) return "bg-red-100 border-red-300";
    if (change < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const formatValue = (value) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (variant === "compact") {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
        onClick={() => onView?.(watchlist)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {watchlist.isFavorite && (
              <StarIconSolid className="h-4 w-4 text-yellow-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">{watchlist.name}</h4>
              <p className="text-sm text-gray-500">
                {summary.totalSymbols} symbols
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-sm font-medium ${getChangeColor(
                summary.avgChange
              )}`}
            >
              {summary.avgChange >= 0 ? "+" : ""}
              {summary.avgChange.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">
              {summary.gainers}↑ {summary.losers}↓
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
        isHovered ? "transform scale-105" : ""
      } ${getChangeBgColor(summary.avgChange)} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Icon/Avatar */}
            <div
              className={`p-3 rounded-lg ${
                summary.avgChange >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <ChartBarIcon
                className={`h-6 w-6 ${
                  summary.avgChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {watchlist.name}
                </h3>

                {watchlist.isFavorite && (
                  <StarIconSolid className="h-5 w-5 text-yellow-500" />
                )}

                {watchlist.isPublic && (
                  <ShareIcon
                    className="h-4 w-4 text-blue-500"
                    title="Public watchlist"
                  />
                )}

                {watchlist.hasAlerts && (
                  <BellIcon
                    className="h-4 w-4 text-orange-500"
                    title="Has price alerts"
                  />
                )}
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {watchlist.description || "No description provided"}
              </p>

              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{summary.totalSymbols} symbols</span>
                <span>
                  Created{" "}
                  {formatDistanceToNow(new Date(watchlist.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {watchlist.lastViewed && (
                  <span>
                    Viewed{" "}
                    {formatDistanceToNow(new Date(watchlist.lastViewed), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite();
                }}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                title={
                  watchlist.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {watchlist.isFavorite ? (
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                title="Toggle details"
              >
                <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
            <div
              className={`text-xl font-bold ${getChangeColor(
                summary.avgChange
              )}`}
            >
              {summary.avgChange >= 0 ? "+" : ""}
              {summary.avgChange.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-600">Avg Change</div>
          </div>

          <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">
              {summary.gainers}
            </div>
            <div className="text-xs text-gray-600">Gainers</div>
          </div>

          <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">
              {summary.losers}
            </div>
            <div className="text-xs text-gray-600">Losers</div>
          </div>
        </div>

        {/* Top Performers */}
        {summary.topGainer && summary.topLoser && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-800">
                  Top Gainer
                </span>
              </div>
              <div className="mt-1">
                <div className="text-sm font-bold text-green-900">
                  {summary.topGainer.symbol}
                </div>
                <div className="text-xs text-green-700">
                  +{summary.topGainer.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">
                  Top Loser
                </span>
              </div>
              <div className="mt-1">
                <div className="text-sm font-bold text-red-900">
                  {summary.topLoser.symbol}
                </div>
                <div className="text-xs text-red-700">
                  {summary.topLoser.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-white border-opacity-30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stats */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Statistics
                </h4>
                <div className="space-y-2">
                  {stats && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">
                          {formatValue(summary.totalValue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">24h Volume:</span>
                        <span className="font-medium">
                          {formatValue(stats.totalVolume)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Volatility:</span>
                        <span className="font-medium">
                          {stats.volatility.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Beta:</span>
                        <span className="font-medium">
                          {stats.averageBeta.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Top Symbols */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Top Symbols
                </h4>
                <div className="space-y-2">
                  {symbolsData.slice(0, 4).map((symbol) => (
                    <div
                      key={symbol.symbol}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {symbol.symbol}
                      </span>
                      <span
                        className={`text-xs font-medium ${getChangeColor(
                          symbol.changePercent
                        )}`}
                      >
                        {symbol.changePercent >= 0 ? "+" : ""}
                        {symbol.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                  {summary.totalSymbols > 4 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{summary.totalSymbols - 4} more symbols
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-white bg-opacity-50 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView?.(watchlist)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View
              </button>

              <button
                onClick={() => onAddSymbol?.(watchlist)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-white transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Symbol
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit?.(watchlist)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit watchlist"
              >
                <PencilIcon className="h-4 w-4" />
              </button>

              {onShare && (
                <button
                  onClick={() => onShare(watchlist)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Share watchlist"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={deleteWatchlistMutation.isLoading}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete watchlist"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(symbolsLoading || statsLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

// Watchlist Grid Component
export const WatchlistGrid = ({
  watchlists = [],
  variant = "default",
  sortBy = "name", // name, created, performance, symbols
  sortOrder = "asc",
  onEdit,
  onView,
  onShare,
  onAddSymbol,
  isLoading = false,
  className = "",
}) => {
  const sortedWatchlists = useMemo(() => {
    return [...watchlists].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "created":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "symbols":
          aValue = a.symbols?.length || 0;
          bValue = b.symbols?.length || 0;
          break;
        case "name":
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }, [watchlists, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (watchlists.length === 0) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Watchlists Found
        </h3>
        <p className="text-gray-500">
          Create your first watchlist to get started
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {sortedWatchlists.map((watchlist) => (
        <WatchlistCard
          key={watchlist.id}
          watchlist={watchlist}
          variant={variant}
          onEdit={onEdit}
          onView={onView}
          onShare={onShare}
          onAddSymbol={onAddSymbol}
        />
      ))}
    </div>
  );
};

// Quick Watchlist Summary Component
export const WatchlistSummary = ({
  watchlist,
  showChart = false,
  className = "",
}) => {
  const { symbols: symbolsData } = useBatchMarketData(watchlist.symbols || []);

  const summary = useMemo(() => {
    if (!symbolsData || symbolsData.length === 0) return null;

    const changes = symbolsData.map((s) => s.changePercent || 0);
    const avgChange =
      changes.reduce((sum, change) => sum + change, 0) / changes.length;

    return {
      avgChange,
      gainers: changes.filter((c) => c > 0).length,
      losers: changes.filter((c) => c < 0).length,
    };
  }, [symbolsData]);

  if (!summary) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-sm text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{watchlist.name}</h4>
        <span className="text-sm text-gray-500">
          {symbolsData.length} symbols
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div
            className={`text-lg font-bold ${
              summary.avgChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {summary.avgChange >= 0 ? "+" : ""}
            {summary.avgChange.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500">Average</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {summary.gainers}
          </div>
          <div className="text-xs text-gray-500">Gainers</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{summary.losers}</div>
          <div className="text-xs text-gray-500">Losers</div>
        </div>
      </div>

      {showChart && symbolsData.length > 0 && (
        <div className="mt-4 h-16 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">
            Mini chart would go here
          </span>
        </div>
      )}
    </div>
  );
};

export default WatchlistCard;
