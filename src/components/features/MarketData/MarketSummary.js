/**
 * MarketSummary.js - Market summary component
 * Displays overall market indicators and statistics
 */

"use client";

import React, { useMemo } from "react";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  GlobeAltIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const MarketSummary = ({
  data = null,
  isLoading = false,
  timeframe = "1d",
  showDetails = true,
  className = "",
}) => {
  // Mock market summary data (would come from actual API)
  const marketData = useMemo(() => {
    if (data) return data;

    return {
      indices: {
        sp500: { value: 4327.78, change: 23.45, changePercent: 0.54 },
        nasdaq: { value: 13408.56, change: -45.67, changePercent: -0.34 },
        dow: { value: 34234.12, change: 156.78, changePercent: 0.46 },
        russell2000: { value: 2156.89, change: -12.34, changePercent: -0.57 },
        vix: { value: 18.45, change: -1.23, changePercent: -6.25 },
      },
      sectors: {
        technology: { changePercent: 1.23, volume: 1.2e9 },
        healthcare: { changePercent: 0.67, volume: 8.5e8 },
        financials: { changePercent: -0.45, volume: 9.1e8 },
        energy: { changePercent: 2.34, volume: 7.8e8 },
        consumer: { changePercent: 0.12, volume: 6.9e8 },
      },
      statistics: {
        totalVolume: 15.6e9,
        advancers: 1847,
        decliners: 1923,
        unchanged: 234,
        newHighs: 89,
        newLows: 156,
        marketCap: 45.2e12,
      },
      marketStatus: "open",
      lastUpdate: new Date().toISOString(),
      sentiment: "neutral", // bullish, bearish, neutral
    };
  }, [data]);

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeBgColor = (change) => {
    if (change > 0) return "bg-green-50 border-green-200";
    if (change < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getMarketStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "pre_market":
        return "bg-yellow-100 text-yellow-800";
      case "after_hours":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      case "bearish":
        return <TrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Market Summary
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketStatusColor(
                    marketData.marketStatus
                  )}`}
                >
                  {marketData.marketStatus.replace("_", " ").toUpperCase()}
                </span>

                <div className="flex items-center space-x-1">
                  {getSentimentIcon(marketData.sentiment)}
                  <span className="capitalize">
                    {marketData.sentiment} sentiment
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>
              Updated{" "}
              {formatDistanceToNow(new Date(marketData.lastUpdate), {
                addSuffix: true,
              })}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Major Indices */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Major Indices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries({
              "S&P 500": marketData.indices.sp500,
              NASDAQ: marketData.indices.nasdaq,
              "Dow Jones": marketData.indices.dow,
              "Russell 2000": marketData.indices.russell2000,
              VIX: marketData.indices.vix,
            }).map(([name, index]) => (
              <div
                key={name}
                className={`p-4 rounded-lg border ${getChangeBgColor(
                  index.changePercent
                )} transition-all duration-200 hover:shadow-md`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {name}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {index.value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <span
                      className={`text-sm font-medium ${getChangeColor(
                        index.change
                      )}`}
                    >
                      {index.change >= 0 ? "+" : ""}
                      {index.change.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm font-medium ${getChangeColor(
                        index.changePercent
                      )}`}
                    >
                      ({index.changePercent >= 0 ? "+" : ""}
                      {index.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Trading Activity
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BanknotesIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Total Volume
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-900">
                  {formatLargeNumber(marketData.statistics.totalVolume)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {marketData.statistics.advancers.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">Advancers</div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-600">
                    {marketData.statistics.decliners.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-600">Decliners</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">
                    {marketData.statistics.unchanged.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Unchanged</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Market Highlights
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-800">
                  Total Market Cap
                </span>
                <span className="text-sm font-bold text-purple-900">
                  ${formatLargeNumber(marketData.statistics.marketCap)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {marketData.statistics.newHighs}
                  </div>
                  <div className="text-xs text-green-600">New 52W Highs</div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-600">
                    {marketData.statistics.newLows}
                  </div>
                  <div className="text-xs text-red-600">New 52W Lows</div>
                </div>
              </div>

              {/* Advance/Decline Ratio */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    A/D Ratio
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {(
                      marketData.statistics.advancers /
                      marketData.statistics.decliners
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      marketData.statistics.advancers >
                      marketData.statistics.decliners
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (marketData.statistics.advancers /
                          (marketData.statistics.advancers +
                            marketData.statistics.decliners)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>More Decliners</span>
                  <span>More Advancers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sector Performance */}
        {showDetails && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Sector Performance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(marketData.sectors).map(([sector, data]) => (
                <div
                  key={sector}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getChangeBgColor(
                    data.changePercent
                  )}`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {sector.replace(/([A-Z])/g, " $1").trim()}
                    </div>

                    <div
                      className={`text-lg font-bold ${getChangeColor(
                        data.changePercent
                      )}`}
                    >
                      {data.changePercent >= 0 ? "+" : ""}
                      {data.changePercent.toFixed(2)}%
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Vol: {formatLargeNumber(data.volume)}
                    </div>

                    {/* Mini trend indicator */}
                    <div className="mt-2 flex justify-center">
                      {data.changePercent >= 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Breadth Analysis */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Market Breadth
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Advancers vs Decliners */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Advancers vs Decliners
              </h5>
              <div className="relative">
                <div className="flex">
                  <div
                    className="bg-green-500 h-8 flex items-center justify-center text-white text-sm font-medium rounded-l"
                    style={{
                      width: `${
                        (marketData.statistics.advancers /
                          (marketData.statistics.advancers +
                            marketData.statistics.decliners)) *
                        100
                      }%`,
                    }}
                  >
                    {marketData.statistics.advancers}
                  </div>
                  <div
                    className="bg-red-500 h-8 flex items-center justify-center text-white text-sm font-medium rounded-r"
                    style={{
                      width: `${
                        (marketData.statistics.decliners /
                          (marketData.statistics.advancers +
                            marketData.statistics.decliners)) *
                        100
                      }%`,
                    }}
                  >
                    {marketData.statistics.decliners}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Advancers</span>
                  <span>Decliners</span>
                </div>
              </div>
            </div>

            {/* New Highs vs Lows */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                52-Week Highs vs Lows
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-100 rounded">
                  <span className="text-sm text-green-800">New Highs</span>
                  <span className="text-sm font-bold text-green-900">
                    {marketData.statistics.newHighs}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                  <span className="text-sm text-red-800">New Lows</span>
                  <span className="text-sm font-bold text-red-900">
                    {marketData.statistics.newLows}
                  </span>
                </div>
              </div>
            </div>

            {/* Market Sentiment Gauge */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Market Sentiment
              </h5>
              <div className="text-center">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    {getSentimentIcon(marketData.sentiment)}
                  </div>
                  <div className="text-lg font-bold text-gray-900 capitalize">
                    {marketData.sentiment}
                  </div>
                  <div className="text-sm text-gray-500">
                    Based on breadth analysis
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fear & Greed Index Visualization */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Fear & Greed Index
            </h5>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                  <div
                    className="absolute top-0 w-1 h-4 bg-white border-2 border-gray-800 rounded transform -translate-x-0.5"
                    style={{
                      left: `${
                        marketData.indices.vix <= 12
                          ? 80
                          : marketData.indices.vix <= 20
                          ? 50
                          : 20
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Extreme Fear</span>
                  <span>Neutral</span>
                  <span>Extreme Greed</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {marketData.indices.vix.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">VIX Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {(
                (marketData.statistics.advancers /
                  (marketData.statistics.advancers +
                    marketData.statistics.decliners)) *
                100
              ).toFixed(0)}
              %
            </div>
            <div className="text-sm text-blue-600">Breadth Ratio</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {formatLargeNumber(marketData.statistics.totalVolume)}
            </div>
            <div className="text-sm text-purple-600">Total Volume</div>
          </div>

          <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-600">
              ${formatLargeNumber(marketData.statistics.marketCap)}
            </div>
            <div className="text-sm text-indigo-600">Market Cap</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {marketData.statistics.unchanged.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Unchanged</div>
          </div>
        </div>

        {/* Market Heat Map Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Sector Heatmap
            </h4>
            <span className="text-xs text-gray-500">
              Size by market cap • Color by performance
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 h-32">
            {Object.entries(marketData.sectors).map(([sector, data], index) => {
              const intensity = Math.abs(data.changePercent) / 3; // Normalize to 0-1
              const isPositive = data.changePercent >= 0;

              return (
                <div
                  key={sector}
                  className={`rounded-lg flex items-center justify-center p-2 text-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                    isPositive
                      ? `bg-green-${Math.round(
                          intensity * 400 + 100
                        )} text-green-800`
                      : `bg-red-${Math.round(
                          intensity * 400 + 100
                        )} text-red-800`
                  }`}
                  title={`${sector}: ${data.changePercent.toFixed(2)}%`}
                  style={{
                    backgroundColor: isPositive
                      ? `rgba(34, 197, 94, ${0.1 + intensity * 0.4})`
                      : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
                    gridRow: index < 2 ? "span 2" : "span 1",
                  }}
                >
                  <div>
                    <div className="text-xs font-medium capitalize">
                      {sector.slice(0, 8)}
                    </div>
                    <div className="text-xs font-bold">
                      {data.changePercent >= 0 ? "+" : ""}
                      {data.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market News Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Market Summary
          </h4>
          <p className="text-sm text-blue-700">
            {marketData.statistics.advancers > marketData.statistics.decliners
              ? `Markets showing positive momentum with ${marketData.statistics.advancers} advancers vs ${marketData.statistics.decliners} decliners. `
              : `Markets facing headwinds with ${marketData.statistics.decliners} decliners vs ${marketData.statistics.advancers} advancers. `}
            VIX at {marketData.indices.vix.value.toFixed(1)} indicates{" "}
            {marketData.indices.vix.value < 20
              ? "low"
              : marketData.indices.vix.value < 30
              ? "elevated"
              : "high"}{" "}
            volatility expectations.
            {marketData.statistics.newHighs >
              marketData.statistics.newLows * 2 &&
              " Strong momentum with new highs outnumbering new lows 2:1."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketSummary;
