/**
 * SymbolCard.js - Individual symbol card component
 * Displays symbol information with price, change, and mini chart
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useMarketData, useHistoricalData } from "../../hooks/useMarketData";
import { useSymbolPriceSubscription } from "../../hooks/useRealTimePrice";

const SymbolCard = ({
  symbol,
  variant = "default", // default, compact, detailed, index
  showChart = false,
  showActions = true,
  realTime = false,
  onClick,
  onAddToWatchlist,
  onToggleFavorite,
  isInWatchlist = false,
  isFavorite = false,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Get additional market data if not provided in symbol prop
  const { data: additionalData } = useMarketData(symbol.symbol, {
    enabled: !symbol.currentPrice && !!symbol.symbol,
  });

  // Get historical data for mini chart
  const { data: chartData } = useHistoricalData(symbol.symbol, {
    period: "1D",
    interval: "5m",
    enabled: showChart,
  });

  // Real-time price subscription
  useSymbolPriceSubscription(realTime ? symbol.symbol : null, (updates) => {
    if (updates[symbol.symbol]) {
      // Symbol data would be updated through React Query cache
      console.log(`💹 ${symbol.symbol} updated:`, updates[symbol.symbol].price);
    }
  });

  // Merge symbol data
  const symbolData = useMemo(() => {
    return {
      ...symbol,
      ...(additionalData?.data || {}),
      currentPrice:
        symbol.currentPrice || additionalData?.data?.currentPrice || 0,
      change: symbol.change || additionalData?.data?.change || 0,
      changePercent:
        symbol.changePercent || additionalData?.data?.changePercent || 0,
      volume: symbol.volume || additionalData?.data?.volume || 0,
      marketCap: symbol.marketCap || additionalData?.data?.marketCap || 0,
      dayHigh: symbol.dayHigh || additionalData?.data?.dayHigh || 0,
      dayLow: symbol.dayLow || additionalData?.data?.dayLow || 0,
    };
  }, [symbol, additionalData]);

  // Chart data processing
  const miniChartData = useMemo(() => {
    if (!chartData?.data?.prices) return [];

    return chartData.data.prices.slice(-20).map((price, index) => ({
      x: index,
      y: price.close,
      timestamp: price.timestamp,
    }));
  }, [chartData]);

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

  const formatPrice = (price) => {
    if (price >= 1000)
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const renderMiniChart = () => {
    if (!showChart || miniChartData.length === 0) return null;

    const maxPrice = Math.max(...miniChartData.map((d) => d.y));
    const minPrice = Math.min(...miniChartData.map((d) => d.y));
    const priceRange = maxPrice - minPrice || 1;

    const pathData = miniChartData
      .map((point, index) => {
        const x = (index / (miniChartData.length - 1)) * 100;
        const y = 100 - ((point.y - minPrice) / priceRange) * 100;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return (
      <div className="mt-3">
        <svg
          width="100%"
          height="40"
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          <path
            d={pathData}
            stroke={symbolData.changePercent >= 0 ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient
              id={`gradient-${symbolData.symbol}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={
                  symbolData.changePercent >= 0 ? "#10b981" : "#ef4444"
                }
                stopOpacity="0.2"
              />
              <stop
                offset="100%"
                stopColor={
                  symbolData.changePercent >= 0 ? "#10b981" : "#ef4444"
                }
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`url(#gradient-${symbolData.symbol})`}
          />
        </svg>
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
        onClick={() => onClick?.(symbolData)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900 text-sm">
              {symbolData.symbol}
            </div>
            {realTime && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              ${formatPrice(symbolData.currentPrice)}
            </div>
            <div
              className={`text-xs font-medium ${getChangeColor(
                symbolData.changePercent
              )}`}
            >
              {symbolData.changePercent >= 0 ? "+" : ""}
              {symbolData.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
        isHovered && onClick ? "transform scale-105" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900">
                {symbolData.symbol}
              </h3>

              {realTime && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    LIVE
                  </span>
                </div>
              )}

              {variant === "index" && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  INDEX
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1">
              {symbolData.name || symbolData.companyName || "Unknown Company"}
            </p>

            {symbolData.sector && (
              <p className="text-xs text-gray-500">{symbolData.sector}</p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(symbolData);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {isFavorite ? (
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {!isInWatchlist && onAddToWatchlist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWatchlist(symbolData);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Add to watchlist"
                >
                  <PlusIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Toggle details"
              >
                <InformationCircleIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${formatPrice(symbolData.currentPrice)}
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`text-sm font-medium ${getChangeColor(
                  symbolData.change
                )}`}
              >
                {symbolData.change >= 0 ? "+" : ""}$
                {symbolData.change.toFixed(2)}
              </span>

              <span
                className={`text-sm font-medium ${getChangeColor(
                  symbolData.changePercent
                )}`}
              >
                ({symbolData.changePercent >= 0 ? "+" : ""}
                {symbolData.changePercent.toFixed(2)}%)
              </span>

              {symbolData.changePercent !== 0 && (
                <div className="flex-shrink-0">
                  {symbolData.changePercent >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional metrics */}
          <div className="text-right">
            {symbolData.volume > 0 && (
              <div className="text-xs text-gray-500">
                Vol: {formatVolume(symbolData.volume)}
              </div>
            )}
            {symbolData.marketCap > 0 && (
              <div className="text-xs text-gray-500">
                Cap: {formatMarketCap(symbolData.marketCap)}
              </div>
            )}
            {symbolData.lastUpdated && (
              <div className="text-xs text-gray-500">
                {new Date(symbolData.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Mini Chart */}
        {renderMiniChart()}

        {/* Day Range */}
        {(symbolData.dayLow > 0 || symbolData.dayHigh > 0) && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Day Range</span>
              <span>
                ${symbolData.dayLow.toFixed(2)} - $
                {symbolData.dayHigh.toFixed(2)}
              </span>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{
                    width: `${
                      ((symbolData.currentPrice - symbolData.dayLow) /
                        (symbolData.dayHigh - symbolData.dayLow)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div
                className="absolute top-0 w-0.5 h-3 bg-gray-900 transform -translate-x-0.5"
                style={{
                  left: `${
                    ((symbolData.currentPrice - symbolData.dayLow) /
                      (symbolData.dayHigh - symbolData.dayLow)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {symbolData.pe && (
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E Ratio:</span>
                  <span className="font-medium">
                    {symbolData.pe.toFixed(2)}
                  </span>
                </div>
              )}

              {symbolData.eps && (
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS:</span>
                  <span className="font-medium">
                    ${symbolData.eps.toFixed(2)}
                  </span>
                </div>
              )}

              {symbolData.dividendYield && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend:</span>
                  <span className="font-medium">
                    {symbolData.dividendYield.toFixed(2)}%
                  </span>
                </div>
              )}

              {symbolData.beta && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Beta:</span>
                  <span className="font-medium">
                    {symbolData.beta.toFixed(2)}
                  </span>
                </div>
              )}

              {symbolData.avgVolume && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Volume:</span>
                  <span className="font-medium">
                    {formatVolume(symbolData.avgVolume)}
                  </span>
                </div>
              )}

              {symbolData.week52High && (
                <div className="flex justify-between">
                  <span className="text-gray-600">52W High:</span>
                  <span className="font-medium">
                    ${symbolData.week52High.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Performance indicators */}
            {symbolData.week52High && symbolData.week52Low && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>52-Week Range</span>
                  <span>
                    {(
                      ((symbolData.currentPrice - symbolData.week52Low) /
                        (symbolData.week52High - symbolData.week52Low)) *
                      100
                    ).toFixed(0)}
                    % to high
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      symbolData.changePercent >= 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        ((symbolData.currentPrice - symbolData.week52Low) /
                          (symbolData.week52High - symbolData.week52Low)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {showActions && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {onClick && (
                <button
                  onClick={() => onClick(symbolData)}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
              )}

              {onAddToWatchlist && !isInWatchlist && (
                <button
                  onClick={() => onAddToWatchlist(symbolData)}
                  className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {symbolData.volume > 0 && (
                <span>Vol: {formatVolume(symbolData.volume)}</span>
              )}
              {symbolData.marketCap > 0 && (
                <span>{formatMarketCap(symbolData.marketCap)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click handler for entire card */}
      {onClick && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => onClick(symbolData)}
        />
      )}

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

// Symbol List Component
export const SymbolList = ({
  symbols = [],
  variant = "default",
  sortBy = "marketCap",
  sortOrder = "desc",
  onSymbolClick,
  onAddToWatchlist,
  showActions = true,
  className = "",
}) => {
  const sortedSymbols = useMemo(() => {
    return [...symbols].sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [symbols, sortBy, sortOrder]);

  if (symbols.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No symbols to display</p>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-2 ${className}`}>
        {sortedSymbols.map((symbol) => (
          <div
            key={symbol.symbol}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="font-medium text-gray-900">{symbol.symbol}</div>
              <div className="text-sm text-gray-600">{symbol.name}</div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  ${formatPrice(symbol.currentPrice)}
                </div>
                <div
                  className={`text-sm ${getChangeColor(symbol.changePercent)}`}
                >
                  {symbol.changePercent >= 0 ? "+" : ""}
                  {symbol.changePercent.toFixed(2)}%
                </div>
              </div>

              {showActions && (
                <button
                  onClick={() => onSymbolClick?.(symbol)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {sortedSymbols.map((symbol) => (
        <SymbolCard
          key={symbol.symbol}
          symbol={symbol}
          variant={variant}
          onClick={onSymbolClick}
          onAddToWatchlist={onAddToWatchlist}
          showActions={showActions}
          showChart={true}
        />
      ))}
    </div>
  );
};

// Helper functions
function formatPrice(price) {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

function formatVolume(volume) {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
}

function formatMarketCap(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export default SymbolCard;
