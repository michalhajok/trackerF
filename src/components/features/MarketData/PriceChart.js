/**
 * PriceChart.js - Advanced price chart component
 * Interactive chart with multiple timeframes and technical indicators
 */

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useHistoricalData, useMarketData } from "../../hooks/useMarketData";
import { useRealTimePrice } from "../../hooks/useRealTimePrice";

const PriceChart = ({
  symbol,
  initialPeriod = "1D",
  initialInterval = "5m",
  showTechnicalIndicators = true,
  showVolume = true,
  realTime = true,
  height = 400,
  className = "",
}) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [interval, setInterval] = useState(initialInterval);
  const [chartType, setChartType] = useState("candlestick"); // line, candlestick, area
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    ema20: false,
    rsi: false,
    macd: false,
    bollinger: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [crosshair, setCrosshair] = useState({
    x: null,
    y: null,
    visible: false,
  });

  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch historical data
  const {
    data: chartData,
    isLoading,
    error,
  } = useHistoricalData(symbol, {
    period,
    interval,
    includeTechnicals: showTechnicalIndicators,
  });

  // Get current market data
  const { data: currentData } = useMarketData(symbol);

  // Real-time updates
  const { getPrice, isConnected } = useRealTimePrice(realTime ? [symbol] : [], {
    onPriceUpdate: (updates) => {
      if (updates[symbol]) {
        // Would update chart with new real-time price
        console.log(`📊 Chart update for ${symbol}:`, updates[symbol].price);
      }
    },
  });

  // Process chart data
  const processedData = useMemo(() => {
    if (!chartData?.data?.prices)
      return { prices: [], volume: [], indicators: {} };

    const prices = chartData.data.prices.map((price, index) => ({
      ...price,
      x: index,
      timestamp: new Date(price.timestamp),
    }));

    const volume = prices.map((price, index) => ({
      x: index,
      y: price.volume || 0,
      timestamp: price.timestamp,
    }));

    // Calculate technical indicators
    const technicalIndicators = {};

    if (indicators.sma20) {
      technicalIndicators.sma20 = calculateSMA(
        prices.map((p) => p.close),
        20
      );
    }

    if (indicators.sma50) {
      technicalIndicators.sma50 = calculateSMA(
        prices.map((p) => p.close),
        50
      );
    }

    if (indicators.ema20) {
      technicalIndicators.ema20 = calculateEMA(
        prices.map((p) => p.close),
        20
      );
    }

    if (indicators.rsi) {
      technicalIndicators.rsi = calculateRSI(
        prices.map((p) => p.close),
        14
      );
    }

    if (indicators.bollinger) {
      technicalIndicators.bollinger = calculateBollingerBands(
        prices.map((p) => p.close),
        20,
        2
      );
    }

    return {
      prices,
      volume,
      indicators: technicalIndicators,
    };
  }, [chartData, indicators]);

  // Chart dimensions and scales
  const chartDimensions = useMemo(() => {
    if (processedData.prices.length === 0) return null;

    const prices = processedData.prices.map((p) => p.close);
    const volumes = processedData.volume.map((v) => v.y);

    return {
      minPrice: Math.min(...prices) * 0.98,
      maxPrice: Math.max(...prices) * 1.02,
      maxVolume: Math.max(...volumes),
      width: 800,
      height: height,
      padding: { top: 20, right: 60, bottom: showVolume ? 100 : 40, left: 60 },
    };
  }, [processedData, height, showVolume]);

  const handleMouseMove = (event) => {
    if (!chartRef.current || !chartDimensions) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate data point index
    const dataIndex = Math.round(
      ((x - chartDimensions.padding.left) /
        (chartDimensions.width -
          chartDimensions.padding.left -
          chartDimensions.padding.right)) *
        (processedData.prices.length - 1)
    );

    if (dataIndex >= 0 && dataIndex < processedData.prices.length) {
      setCrosshair({ x, y, dataIndex, visible: true });
    }
  };

  const handleMouseLeave = () => {
    setCrosshair({ x: null, y: null, visible: false });
  };

  const toggleIndicator = (indicator) => {
    setIndicators((prev) => ({
      ...prev,
      [indicator]: !prev[indicator],
    }));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderChart = () => {
    if (!chartDimensions || processedData.prices.length === 0) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
            <p>No chart data available</p>
          </div>
        </div>
      );
    }

    const { prices, volume } = processedData;
    const { minPrice, maxPrice, maxVolume, width, height, padding } =
      chartDimensions;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight =
      height - padding.top - padding.bottom - (showVolume ? 80 : 0);
    const volumeHeight = showVolume ? 60 : 0;

    return (
      <svg
        ref={chartRef}
        width={width}
        height={height}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Price Chart */}
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {chartType === "line" &&
            renderLineChart(
              prices,
              chartWidth,
              chartHeight,
              minPrice,
              maxPrice
            )}
          {chartType === "area" &&
            renderAreaChart(
              prices,
              chartWidth,
              chartHeight,
              minPrice,
              maxPrice
            )}
          {chartType === "candlestick" &&
            renderCandlestickChart(
              prices,
              chartWidth,
              chartHeight,
              minPrice,
              maxPrice
            )}

          {/* Technical Indicators */}
          {showTechnicalIndicators &&
            renderIndicators(
              processedData.indicators,
              chartWidth,
              chartHeight,
              minPrice,
              maxPrice
            )}
        </g>

        {/* Volume Chart */}
        {showVolume && (
          <g
            transform={`translate(${padding.left}, ${height - padding.bottom})`}
          >
            {renderVolumeChart(volume, chartWidth, volumeHeight, maxVolume)}
          </g>
        )}

        {/* Axes */}
        {renderAxes(
          chartWidth,
          chartHeight,
          minPrice,
          maxPrice,
          prices,
          padding
        )}

        {/* Crosshair */}
        {crosshair.visible &&
          renderCrosshair(crosshair, chartWidth, chartHeight, prices, padding)}
      </svg>
    );
  };

  const renderLineChart = (prices, width, height, minPrice, maxPrice) => {
    const priceRange = maxPrice - minPrice;
    const pathData = prices
      .map((price, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - ((price.close - minPrice) / priceRange) * height;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return (
      <path
        d={pathData}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        className="drop-shadow-sm"
      />
    );
  };

  const renderAreaChart = (prices, width, height, minPrice, maxPrice) => {
    const priceRange = maxPrice - minPrice;
    const pathData = prices
      .map((price, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - ((price.close - minPrice) / priceRange) * height;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return (
      <>
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#priceGradient)"
        />
        <path d={pathData} stroke="#3b82f6" strokeWidth="2" fill="none" />
      </>
    );
  };

  const renderCandlestickChart = (
    prices,
    width,
    height,
    minPrice,
    maxPrice
  ) => {
    const priceRange = maxPrice - minPrice;
    const candleWidth = Math.max(1, (width / prices.length) * 0.8);

    return (
      <g>
        {prices.map((price, index) => {
          const x = (index / (prices.length - 1)) * width;
          const yHigh =
            height - ((price.high - minPrice) / priceRange) * height;
          const yLow = height - ((price.low - minPrice) / priceRange) * height;
          const yOpen =
            height - ((price.open - minPrice) / priceRange) * height;
          const yClose =
            height - ((price.close - minPrice) / priceRange) * height;

          const isGreen = price.close >= price.open;
          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.abs(yClose - yOpen);

          return (
            <g key={index}>
              {/* High-Low line */}
              <line
                x1={x}
                y1={yHigh}
                x2={x}
                y2={yLow}
                stroke={isGreen ? "#10b981" : "#ef4444"}
                strokeWidth="1"
              />

              {/* Open-Close body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(1, bodyHeight)}
                fill={isGreen ? "#10b981" : "#ef4444"}
                stroke={isGreen ? "#059669" : "#dc2626"}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </g>
    );
  };

  const renderVolumeChart = (volume, width, height, maxVolume) => {
    const barWidth = (width / volume.length) * 0.8;

    return (
      <g>
        {volume.map((vol, index) => {
          const x = (index / (volume.length - 1)) * width;
          const barHeight = (vol.y / maxVolume) * height;
          const y = height - barHeight;

          return (
            <rect
              key={index}
              x={x - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#6b7280"
              opacity="0.7"
            />
          );
        })}
      </g>
    );
  };

  const renderAxes = (
    chartWidth,
    chartHeight,
    minPrice,
    maxPrice,
    prices,
    padding
  ) => {
    const priceSteps = 5;
    const timeSteps = 5;

    return (
      <g>
        {/* Y-axis (Price) */}
        <g transform={`translate(${padding.left - 10}, ${padding.top})`}>
          {Array.from({ length: priceSteps + 1 }).map((_, i) => {
            const price = minPrice + (maxPrice - minPrice) * (i / priceSteps);
            const y = chartHeight - (i / priceSteps) * chartHeight;

            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth + 10}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="-5"
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            );
          })}
        </g>

        {/* X-axis (Time) */}
        <g
          transform={`translate(${padding.left}, ${
            height - padding.bottom + 10
          })`}
        >
          {Array.from({ length: timeSteps + 1 }).map((_, i) => {
            const index = Math.floor((prices.length - 1) * (i / timeSteps));
            const price = prices[index];
            const x = (i / timeSteps) * chartWidth;

            if (!price) return null;

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1="-10"
                  x2={x}
                  y2="0"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y="15"
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {formatTimeLabel(price.timestamp, period)}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  };

  const renderCrosshair = (
    crosshair,
    chartWidth,
    chartHeight,
    prices,
    padding
  ) => {
    if (!crosshair.visible || crosshair.dataIndex === null) return null;

    const price = prices[crosshair.dataIndex];
    if (!price) return null;

    const x = crosshair.x - padding.left;
    const y = crosshair.y - padding.top;

    return (
      <g>
        {/* Crosshair lines */}
        <line
          x1={padding.left}
          y1={crosshair.y}
          x2={padding.left + chartWidth}
          y2={crosshair.y}
          stroke="#6b7280"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.7"
        />
        <line
          x1={crosshair.x}
          y1={padding.top}
          x2={crosshair.x}
          y2={padding.top + chartHeight}
          stroke="#6b7280"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.7"
        />

        {/* Price tooltip */}
        <g transform={`translate(${crosshair.x + 10}, ${crosshair.y - 10})`}>
          <rect
            x="0"
            y="-25"
            width="120"
            height="50"
            fill="rgba(0, 0, 0, 0.8)"
            rx="4"
          />
          <text x="8" y="-12" className="text-xs fill-white">
            {formatTimeLabel(price.timestamp, period)}
          </text>
          <text x="8" y="-2" className="text-xs fill-white font-medium">
            ${price.close.toFixed(2)}
          </text>
          <text x="8" y="12" className="text-xs fill-white">
            Vol: {formatVolume(price.volume)}
          </text>
        </g>
      </g>
    );
  };

  const renderIndicators = (
    technicalIndicators,
    width,
    height,
    minPrice,
    maxPrice
  ) => {
    const priceRange = maxPrice - minPrice;

    return (
      <g className="opacity-80">
        {/* SMA 20 */}
        {technicalIndicators.sma20 && (
          <path
            d={technicalIndicators.sma20
              .map((value, index) => {
                const x =
                  (index / (technicalIndicators.sma20.length - 1)) * width;
                const y = height - ((value - minPrice) / priceRange) * height;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            stroke="#f59e0b"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="2,2"
          />
        )}

        {/* SMA 50 */}
        {technicalIndicators.sma50 && (
          <path
            d={technicalIndicators.sma50
              .map((value, index) => {
                const x =
                  (index / (technicalIndicators.sma50.length - 1)) * width;
                const y = height - ((value - minPrice) / priceRange) * height;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            stroke="#8b5cf6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5,5"
          />
        )}

        {/* Bollinger Bands */}
        {technicalIndicators.bollinger && (
          <g opacity="0.3">
            <path
              d={technicalIndicators.bollinger.upper
                .map((value, index) => {
                  const x =
                    (index / (technicalIndicators.bollinger.upper.length - 1)) *
                    width;
                  const y = height - ((value - minPrice) / priceRange) * height;
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              stroke="#ef4444"
              strokeWidth="1"
              fill="none"
            />
            <path
              d={technicalIndicators.bollinger.lower
                .map((value, index) => {
                  const x =
                    (index / (technicalIndicators.bollinger.lower.length - 1)) *
                    width;
                  const y = height - ((value - minPrice) / priceRange) * height;
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              stroke="#ef4444"
              strokeWidth="1"
              fill="none"
            />
          </g>
        )}
      </g>
    );
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center text-red-600">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
          <p>Failed to load chart data</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-lg border border-gray-200 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : className
      }`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {symbol} Price Chart
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>
                  ${currentData?.data?.currentPrice?.toFixed(2) || "0.00"}
                </span>
                <span
                  className={getChangeColor(
                    currentData?.data?.changePercent || 0
                  )}
                >
                  {(currentData?.data?.changePercent || 0) >= 0 ? "+" : ""}
                  {(currentData?.data?.changePercent || 0).toFixed(2)}%
                </span>
                {realTime && isConnected && (
                  <span className="text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Live
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Period selector */}
            <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg">
              {["1D", "5D", "1M", "3M", "6M", "1Y"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    period === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="candlestick">Candlestick</option>
            </select>

            {/* Indicators */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Technical Indicators Panel */}
      {showTechnicalIndicators && (
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Indicators:
            </span>
            {Object.entries({
              sma20: "SMA 20",
              sma50: "SMA 50",
              ema20: "EMA 20",
              rsi: "RSI",
              bollinger: "Bollinger",
            }).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleIndicator(key)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  indicators[key]
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        <div
          className="overflow-hidden rounded-lg"
          style={{ height: `${height}px` }}
        >
          {renderChart()}
        </div>
      </div>

      {/* Chart Info */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Period: {period}</span>
            <span>Interval: {interval}</span>
            {processedData.prices.length > 0 && (
              <span>Data points: {processedData.prices.length}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {realTime && (
              <span className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "● Live" : "● Offline"}
              </span>
            )}
            <span>
              Last update:{" "}
              {chartData?.data?.lastUpdated
                ? new Date(chartData.data.lastUpdated).toLocaleTimeString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  const ema = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
}

function calculateRSI(prices, period) {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  // Initial calculation
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

function calculateBollingerBands(prices, period, multiplier) {
  const sma = calculateSMA(prices, period);
  const bands = { upper: [], middle: [], lower: [] };

  for (let i = 0; i < sma.length; i++) {
    const dataIndex = i + period - 1;
    const slice = prices.slice(dataIndex - period + 1, dataIndex + 1);
    const mean = sma[i];

    const variance =
      slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    bands.upper.push(mean + stdDev * multiplier);
    bands.middle.push(mean);
    bands.lower.push(mean - stdDev * multiplier);
  }

  return bands;
}

function formatTimeLabel(timestamp, period) {
  const date = new Date(timestamp);

  switch (period) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "5D":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "1M":
    case "3M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    default:
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
  }
}

function formatVolume(volume) {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
}

function getChangeColor(change) {
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-gray-600";
}

export default PriceChart;
