/**
 * MarketOverview.js - Main market overview dashboard component
 * Displays comprehensive market data, indices, and analysis
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  GlobeAltIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  useMarketSummary,
  useTopMovers,
  useBatchMarketData,
  useMarketDataAnalytics,
} from "../../hooks/useMarketData";
import { useRealTimePrice } from "../../hooks/useRealTimePrice";
import MarketSummary from "./MarketSummary";
import TopMovers from "./TopMovers";
import SectorAnalysis from "./SectorAnalysis";
import SymbolCard from "./SymbolCard";

const MarketOverview = ({
  watchedSymbols = ["SPY", "QQQ", "AAPL", "GOOGL", "MSFT", "TSLA"],
  showRealTime = true,
  className = "",
}) => {
  const [selectedView, setSelectedView] = useState("overview"); // overview, sectors, movers, indices
  const [timeframe, setTimeframe] = useState("1d"); // 1h, 1d, 1w, 1m
  const [sortBy, setSortBy] = useState("marketCap"); // marketCap, change, volume, name

  // Fetch market data
  const { data: marketSummary, isLoading: summaryLoading } = useMarketSummary();
  const { data: topMovers, isLoading: moversLoading } = useTopMovers({
    timeframe,
    limit: 10,
  });

  // Batch market data for watched symbols
  const {
    symbols: watchedSymbolsData,
    isLoading: symbolsLoading,
    refreshInterval,
  } = useBatchMarketData(watchedSymbols);

  // Market analytics
  const analytics = useMarketDataAnalytics(watchedSymbolsData);

  // Real-time price updates
  const {
    isConnected: isRealTimeConnected,
    lastUpdate,
    subscribedCount,
  } = useRealTimePrice(showRealTime ? watchedSymbols : [], {
    autoConnect: showRealTime,
    onPriceUpdate: (updates) => {
      console.log("💹 Real-time price updates:", Object.keys(updates));
    },
  });

  // Major indices data
  const majorIndices = useMemo(
    () => [
      { symbol: "SPY", name: "S&P 500", sector: "Index" },
      { symbol: "QQQ", name: "NASDAQ 100", sector: "Index" },
      { symbol: "IWM", name: "Russell 2000", sector: "Index" },
      { symbol: "DIA", name: "Dow Jones", sector: "Index" },
      { symbol: "VTI", name: "Total Stock Market", sector: "Index" },
      { symbol: "GLD", name: "Gold", sector: "Commodity" },
    ],
    []
  );

  const getMarketStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-red-600 bg-red-100";
      case "pre_market":
        return "text-yellow-600 bg-yellow-100";
      case "after_hours":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getMarketSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600";
      case "bearish":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const formatMarketCap = (value) => {
    if (!value) return "N/A";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (summaryLoading && symbolsLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
          <p className="text-gray-600">
            Real-time market data and analysis •
            {showRealTime && (
              <span
                className={`ml-1 ${
                  isRealTimeConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {isRealTimeConnected ? "🟢 Live" : "🔴 Offline"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Market Status */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketStatusColor(
                marketSummary?.data?.marketStatus || "unknown"
              )}`}
            >
              {(marketSummary?.data?.marketStatus || "unknown")
                .replace("_", " ")
                .toUpperCase()}
            </span>

            {lastUpdate && (
              <div className="text-xs text-gray-500">
                Updated {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Timeframe selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
          </select>
        </div>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Market Cap */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Market Cap
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMarketCap(analytics.totalMarketCap)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm ${getMarketSentimentColor(
                analytics.marketSentiment
              )}`}
            >
              {analytics.marketSentiment.charAt(0).toUpperCase() +
                analytics.marketSentiment.slice(1)}{" "}
              Market
            </span>
          </div>
        </div>

        {/* Average Change */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Change</p>
              <p
                className={`text-2xl font-bold ${
                  analytics.averageChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {analytics.averageChange >= 0 ? "+" : ""}
                {analytics.averageChange.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              {analytics.averageChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Across {watchedSymbolsData.length} symbols
            </span>
          </div>
        </div>

        {/* Volatility Index */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Volatility Index
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.volatilityIndex.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {analytics.volatilityIndex > 20
                ? "High"
                : analytics.volatilityIndex > 10
                ? "Medium"
                : "Low"}{" "}
              volatility
            </span>
          </div>
        </div>

        {/* Active Symbols */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Symbols
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {subscribedCount || watchedSymbolsData.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <GlobeAltIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {showRealTime ? "Real-time tracking" : "Static data"}
            </span>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", name: "Overview", icon: ChartBarIcon },
              { id: "indices", name: "Indices", icon: BuildingOfficeIcon },
              { id: "movers", name: "Top Movers", icon: ArrowTrendingUpIcon },
              { id: "sectors", name: "Sectors", icon: FunnelIcon },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === view.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <view.icon className="h-5 w-5" />
                <span>{view.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* View Content */}
        <div className="p-6">
          {selectedView === "overview" && (
            <div className="space-y-6">
              {/* Market Summary */}
              <MarketSummary
                data={marketSummary?.data}
                isLoading={summaryLoading}
                timeframe={timeframe}
              />

              {/* Watched Symbols */}
              {watchedSymbolsData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Watchlist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchedSymbolsData.map((symbol) => (
                      <SymbolCard
                        key={symbol.symbol}
                        symbol={symbol}
                        showChart={true}
                        realTime={showRealTime}
                        onClick={(s) => console.log("Symbol clicked:", s)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Market Gainers
                  </h4>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.topGainers.length}
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Avg: +
                    {(
                      analytics.topGainers.reduce(
                        (sum, g) => sum + (g.changePercent || 0),
                        0
                      ) / Math.max(1, analytics.topGainers.length)
                    ).toFixed(2)}
                    %
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">
                    Market Losers
                  </h4>
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.topLosers.length}
                  </div>
                  <div className="text-sm text-red-600 mt-1">
                    Avg:{" "}
                    {(
                      analytics.topLosers.reduce(
                        (sum, l) => sum + (l.changePercent || 0),
                        0
                      ) / Math.max(1, analytics.topLosers.length)
                    ).toFixed(2)}
                    %
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Most Active
                  </h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.mostActive.length}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    By volume trading
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === "indices" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Major Indices
                </h3>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Refresh: {Math.round(refreshInterval / 1000)}s
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {majorIndices.map((index) => {
                  const indexData = watchedSymbolsData.find(
                    (s) => s.symbol === index.symbol
                  );
                  return (
                    <SymbolCard
                      key={index.symbol}
                      symbol={
                        indexData || { ...index, currentPrice: 0, change: 0 }
                      }
                      showChart={true}
                      variant="index"
                      realTime={showRealTime}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {selectedView === "movers" && (
            <TopMovers
              data={topMovers?.data}
              isLoading={moversLoading}
              timeframe={timeframe}
              onSymbolClick={(symbol) => console.log("Mover clicked:", symbol)}
            />
          )}

          {selectedView === "sectors" && (
            <SectorAnalysis
              symbols={watchedSymbolsData}
              timeframe={timeframe}
              analytics={analytics}
            />
          )}
        </div>
      </div>

      {/* Real-time Connection Status */}
      {showRealTime && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isRealTimeConnected
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRealTimeConnected
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span>{isRealTimeConnected ? "Live Data" : "Connecting..."}</span>
              {isRealTimeConnected && subscribedCount > 0 && (
                <span className="text-xs">({subscribedCount} symbols)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Market Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Market Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector Performance */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Sector Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(analytics.sectorsBreakdown)
                .slice(0, 5)
                .map(([sector, data]) => (
                  <div
                    key={sector}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">{sector}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {data.count} symbols
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          data.totalChange / data.count >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.totalChange / data.count >= 0 ? "+" : ""}
                        {(data.totalChange / data.count).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Recent Updates
            </h4>
            <div className="space-y-2">
              {watchedSymbolsData
                .filter((s) => s.lastUpdated)
                .sort(
                  (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
                )
                .slice(0, 5)
                .map((symbol) => (
                  <div
                    key={symbol.symbol}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {symbol.symbol}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${symbol.currentPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          (symbol.changePercent || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(symbol.changePercent || 0) >= 0 ? "+" : ""}
                        {(symbol.changePercent || 0).toFixed(2)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(symbol.lastUpdated), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market News & Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Market Events Today
        </h3>

        <div className="space-y-3">
          {/* Mock market events - would come from actual news API */}
          {[
            {
              time: "09:30",
              event: "Market Open",
              impact: "neutral",
              description: "US markets opened with mixed sentiment",
            },
            {
              time: "10:15",
              event: "Fed Speech",
              impact: "high",
              description:
                "Federal Reserve Chairman scheduled remarks on inflation",
            },
            {
              time: "14:00",
              event: "Earnings Report",
              impact: "medium",
              description: "Major tech companies reporting quarterly results",
            },
            {
              time: "16:00",
              event: "Market Close",
              impact: "neutral",
              description: "Regular trading session ends",
            },
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 text-sm font-medium text-gray-600 w-16">
                {event.time}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-medium text-gray-900">
                    {event.event}
                  </h5>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.impact === "high"
                        ? "bg-red-100 text-red-800"
                        : event.impact === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.impact.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
