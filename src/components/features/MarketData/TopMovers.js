/**
 * TopMovers.js - Top market movers component
 * Displays biggest gainers, losers, and most active stocks
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTopMovers, useMarketData } from "../../hooks/useMarketData";

const TopMovers = ({
  data = null,
  isLoading = false,
  timeframe = "1d",
  limit = 10,
  onSymbolClick,
  onAddToWatchlist,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("gainers"); // gainers, losers, active
  const [sortBy, setSortBy] = useState("changePercent"); // changePercent, volume, marketCap
  const [filterMarketCap, setFilterMarketCap] = useState("all"); // all, large, mid, small

  // Fetch top movers data
  const { data: moversData, isLoading: fetchLoading } = useTopMovers({
    timeframe,
    limit: limit * 3, // Get more data for filtering
    enabled: !data,
  });

  // Use provided data or fetched data
  const rawData = data || moversData?.data;
  const loading = isLoading || fetchLoading;

  // Process and filter data
  const processedData = useMemo(() => {
    if (!rawData) {
      // Mock data for development
      return {
        gainers: [
          {
            symbol: "NVDA",
            name: "NVIDIA Corp",
            currentPrice: 432.5,
            changePercent: 8.45,
            volume: 45000000,
            marketCap: 1.1e12,
            sector: "Technology",
          },
          {
            symbol: "AMD",
            name: "Advanced Micro Devices",
            currentPrice: 124.3,
            changePercent: 7.23,
            volume: 32000000,
            marketCap: 2.0e11,
            sector: "Technology",
          },
          {
            symbol: "TSLA",
            name: "Tesla Inc",
            currentPrice: 245.67,
            changePercent: 6.78,
            volume: 28000000,
            marketCap: 7.8e11,
            sector: "Consumer Cyclical",
          },
          {
            symbol: "AMZN",
            name: "Amazon.com Inc",
            currentPrice: 145.89,
            changePercent: 5.43,
            volume: 25000000,
            marketCap: 1.5e12,
            sector: "Consumer Cyclical",
          },
          {
            symbol: "GOOGL",
            name: "Alphabet Inc",
            currentPrice: 138.24,
            changePercent: 4.56,
            volume: 22000000,
            marketCap: 1.7e12,
            sector: "Technology",
          },
        ],
        losers: [
          {
            symbol: "META",
            name: "Meta Platforms Inc",
            currentPrice: 324.12,
            changePercent: -4.23,
            volume: 18000000,
            marketCap: 8.2e11,
            sector: "Technology",
          },
          {
            symbol: "NFLX",
            name: "Netflix Inc",
            currentPrice: 467.89,
            changePercent: -3.67,
            volume: 15000000,
            marketCap: 2.1e11,
            sector: "Communication",
          },
          {
            symbol: "CRM",
            name: "Salesforce Inc",
            currentPrice: 189.45,
            changePercent: -3.21,
            volume: 12000000,
            marketCap: 1.8e11,
            sector: "Technology",
          },
          {
            symbol: "PYPL",
            name: "PayPal Holdings",
            currentPrice: 67.23,
            changePercent: -2.87,
            volume: 14000000,
            marketCap: 7.8e10,
            sector: "Financial Services",
          },
          {
            symbol: "UBER",
            name: "Uber Technologies",
            currentPrice: 45.67,
            changePercent: -2.45,
            volume: 20000000,
            marketCap: 9.2e10,
            sector: "Technology",
          },
        ],
        mostActive: [
          {
            symbol: "AAPL",
            name: "Apple Inc",
            currentPrice: 175.43,
            changePercent: 1.23,
            volume: 55000000,
            marketCap: 2.8e12,
            sector: "Technology",
          },
          {
            symbol: "SPY",
            name: "SPDR S&P 500 ETF",
            currentPrice: 432.78,
            changePercent: 0.54,
            volume: 48000000,
            marketCap: 4.1e11,
            sector: "ETF",
          },
          {
            symbol: "QQQ",
            name: "Invesco QQQ ETF",
            currentPrice: 367.89,
            changePercent: -0.12,
            volume: 35000000,
            marketCap: 2.1e11,
            sector: "ETF",
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corp",
            currentPrice: 378.45,
            changePercent: 2.11,
            volume: 33000000,
            marketCap: 2.8e12,
            sector: "Technology",
          },
          {
            symbol: "IWM",
            name: "iShares Russell 2000 ETF",
            currentPrice: 198.76,
            changePercent: -0.57,
            volume: 30000000,
            marketCap: 1.5e11,
            sector: "ETF",
          },
        ],
      };
    }

    // Filter by market cap if specified
    const filterByMarketCap = (stocks) => {
      if (filterMarketCap === "all") return stocks;

      return stocks.filter((stock) => {
        const marketCap = stock.marketCap || 0;
        switch (filterMarketCap) {
          case "large":
            return marketCap >= 10e9; // $10B+
          case "mid":
            return marketCap >= 2e9 && marketCap < 10e9; // $2B-$10B
          case "small":
            return marketCap < 2e9; // <$2B
          default:
            return true;
        }
      });
    };

    return {
      gainers: filterByMarketCap(rawData.gainers || []).slice(0, limit),
      losers: filterByMarketCap(rawData.losers || []).slice(0, limit),
      mostActive: filterByMarketCap(rawData.mostActive || []).slice(0, limit),
    };
  }, [rawData, filterMarketCap, limit]);

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

  const getRowBgColor = (change, index) => {
    const opacity = Math.max(0.1, Math.min(0.3, Math.abs(change) / 10));
    if (change > 0) {
      return `rgba(34, 197, 94, ${opacity})`; // Green
    } else if (change < 0) {
      return `rgba(239, 68, 68, ${opacity})`; // Red
    }
    return "transparent";
  };

  const renderMoversList = (movers, type) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!movers || movers.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {movers.map((stock, index) => (
          <div
            key={stock.symbol}
            className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: getRowBgColor(stock.changePercent, index),
            }}
            onClick={() => onSymbolClick?.(stock)}
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-6 text-center">
                <span className="text-sm font-bold text-gray-500">
                  #{index + 1}
                </span>
              </div>

              {/* Symbol & Name */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">
                    {stock.symbol}
                  </span>
                  {type === "active" && (
                    <FireIcon className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {stock.name}
                </div>
                {stock.sector && (
                  <div className="text-xs text-gray-500">{stock.sector}</div>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center space-x-6">
              {/* Price */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  ${formatPrice(stock.currentPrice)}
                </div>
                <div
                  className={`text-sm font-bold ${getChangeColor(
                    stock.changePercent
                  )}`}
                >
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>

              {/* Volume */}
              {type === "active" ? (
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {formatVolume(stock.volume)}
                  </div>
                  <div className="text-xs text-gray-500">Volume</div>
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Vol: {formatVolume(stock.volume)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatMarketCap(stock.marketCap)}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSymbolClick?.(stock);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>

                {onAddToWatchlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(stock);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Add to watchlist"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "gainers":
        return processedData.gainers;
      case "losers":
        return processedData.losers;
      case "active":
        return processedData.mostActive;
      default:
        return [];
    }
  };

  const getTabIcon = (tab) => {
    const iconClass = "h-5 w-5";
    switch (tab) {
      case "gainers":
        return (
          <ArrowTrendingUpIcon className={`${iconClass} text-green-500`} />
        );
      case "losers":
        return (
          <ArrowTrendingDownIcon className={`${iconClass} text-red-500`} />
        );
      case "active":
        return <FireIcon className={`${iconClass} text-orange-500`} />;
      default:
        return <ChartBarIcon className={iconClass} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Top Market Movers
            </h2>
            <p className="text-sm text-gray-600">
              Biggest moves in the {timeframe} timeframe
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Market Cap Filter */}
            <select
              value={filterMarketCap}
              onChange={(e) => setFilterMarketCap(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Market Caps</option>
              <option value="large">Large Cap ($10B+)</option>
              <option value="mid">Mid Cap ($2B-$10B)</option>
              <option value="small">Small Cap (&lt;$2B)</option>
            </select>

            {/* Timeframe */}
            <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg">
              {["1d", "1w", "1m"].map((tf) => (
                <button
                  key={tf}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    timeframe === tf
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            {
              id: "gainers",
              name: "Top Gainers",
              count: processedData.gainers?.length || 0,
            },
            {
              id: "losers",
              name: "Top Losers",
              count: processedData.losers?.length || 0,
            },
            {
              id: "active",
              name: "Most Active",
              count: processedData.mostActive?.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {getTabIcon(tab.id)}
              <span>{tab.name}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary Stats for Active Tab */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {activeTab === "gainers" && (
            <>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xl font-bold text-green-600">
                  +{processedData.gainers?.[0]?.changePercent?.toFixed(2) || 0}%
                </div>
                <div className="text-sm text-green-600">Top Gainer</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-xl font-bold text-emerald-600">
                  +
                  {(
                    (processedData.gainers?.reduce(
                      (sum, s) => sum + s.changePercent,
                      0
                    ) || 0) / Math.max(1, processedData.gainers?.length || 1)
                  ).toFixed(2)}
                  %
                </div>
                <div className="text-sm text-emerald-600">Average Gain</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="text-xl font-bold text-teal-600">
                  {formatVolume(
                    processedData.gainers?.reduce(
                      (sum, s) => sum + s.volume,
                      0
                    ) || 0
                  )}
                </div>
                <div className="text-sm text-teal-600">Total Volume</div>
              </div>
            </>
          )}

          {activeTab === "losers" && (
            <>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xl font-bold text-red-600">
                  {processedData.losers?.[0]?.changePercent?.toFixed(2) || 0}%
                </div>
                <div className="text-sm text-red-600">Top Loser</div>
              </div>
              <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-xl font-bold text-rose-600">
                  {(
                    (processedData.losers?.reduce(
                      (sum, s) => sum + s.changePercent,
                      0
                    ) || 0) / Math.max(1, processedData.losers?.length || 1)
                  ).toFixed(2)}
                  %
                </div>
                <div className="text-sm text-rose-600">Average Loss</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-xl font-bold text-pink-600">
                  {formatVolume(
                    processedData.losers?.reduce(
                      (sum, s) => sum + s.volume,
                      0
                    ) || 0
                  )}
                </div>
                <div className="text-sm text-pink-600">Total Volume</div>
              </div>
            </>
          )}

          {activeTab === "active" && (
            <>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xl font-bold text-orange-600">
                  {formatVolume(processedData.mostActive?.[0]?.volume || 0)}
                </div>
                <div className="text-sm text-orange-600">Highest Volume</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-xl font-bold text-amber-600">
                  {formatVolume(
                    processedData.mostActive?.reduce(
                      (sum, s) => sum + s.volume,
                      0
                    ) || 0
                  )}
                </div>
                <div className="text-sm text-amber-600">Combined Volume</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-xl font-bold text-yellow-600">
                  +
                  {(
                    (processedData.mostActive?.reduce(
                      (sum, s) => sum + Math.abs(s.changePercent),
                      0
                    ) || 0) / Math.max(1, processedData.mostActive?.length || 1)
                  ).toFixed(2)}
                  %
                </div>
                <div className="text-sm text-yellow-600">Avg Movement</div>
              </div>
            </>
          )}
        </div>

        {/* Movers List */}
        {renderMoversList(getCurrentData(), activeTab)}

        {/* Market Insights */}
        {getCurrentData()?.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Market Insights
            </h4>
            <div className="text-sm text-blue-700">
              {activeTab === "gainers" && (
                <p>
                  Strong momentum in{" "}
                  {processedData.gainers.filter(
                    (s) => s.sector === "Technology"
                  ).length > 2
                    ? "technology sector"
                    : "multiple sectors"}
                  with average gains of{" "}
                  {(
                    (processedData.gainers?.reduce(
                      (sum, s) => sum + s.changePercent,
                      0
                    ) || 0) / Math.max(1, processedData.gainers?.length || 1)
                  ).toFixed(2)}
                  %. High volume suggests institutional participation.
                </p>
              )}

              {activeTab === "losers" && (
                <p>
                  Market showing some weakness with{" "}
                  {processedData.losers?.length || 0} significant decliners.
                  Average decline of{" "}
                  {(
                    (processedData.losers?.reduce(
                      (sum, s) => sum + s.changePercent,
                      0
                    ) || 0) / Math.max(1, processedData.losers?.length || 1)
                  ).toFixed(2)}
                  %
                  {processedData.losers?.some((s) => s.volume > 20000000) &&
                    " with elevated volume indicating selling pressure"}
                  .
                </p>
              )}

              {activeTab === "active" && (
                <p>
                  High trading volume concentrated in{" "}
                  {processedData.mostActive?.filter(
                    (s) => s.sector === "Technology"
                  ).length > 2
                    ? "tech stocks"
                    : "mixed sectors"}
                  . Total volume of{" "}
                  {formatVolume(
                    processedData.mostActive?.reduce(
                      (sum, s) => sum + s.volume,
                      0
                    ) || 0
                  )}
                  suggests{" "}
                  {processedData.mostActive?.reduce(
                    (sum, s) => sum + s.volume,
                    0
                  ) > 200000000
                    ? "high"
                    : "moderate"}{" "}
                  market participation.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Movers Summary Component
export const QuickMoversSummary = ({
  limit = 3,
  showGainersOnly = false,
  compact = true,
  className = "",
}) => {
  const { data: moversData, isLoading } = useTopMovers({
    timeframe: "1d",
    limit: limit * 2,
  });

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const gainers = moversData?.data?.gainers?.slice(0, limit) || [];
  const losers = moversData?.data?.losers?.slice(0, limit) || [];

  const displayItems = showGainersOnly ? gainers : [...gainers, ...losers];

  return (
    <div className={`space-y-2 ${className}`}>
      {displayItems.map((stock) => (
        <div
          key={stock.symbol}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {stock.symbol}
            </span>
            {!compact && (
              <span className="text-xs text-gray-500 truncate max-w-24">
                {stock.name}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              ${stock.currentPrice?.toFixed(2)}
            </span>
            <span
              className={`text-sm font-bold ${getChangeColor(
                stock.changePercent
              )}`}
            >
              {stock.changePercent >= 0 ? "+" : ""}
              {stock.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}

      {displayItems.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No movers data available
        </div>
      )}
    </div>
  );
};

export default TopMovers;
