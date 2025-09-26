/**
 * SectorAnalysis.js - Sector analysis and comparison component
 * Shows sector performance, allocation, and detailed analysis
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  BuildingOfficeIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  useMarketDataAnalytics,
  useBatchMarketData,
} from "../../hooks/useMarketData";

const SectorAnalysis = ({
  symbols = [],
  timeframe = "1d",
  analytics = null,
  showAllocation = true,
  showPerformance = true,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState("performance"); // performance, allocation, volume, count
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedSector, setSelectedSector] = useState(null);

  // Get market analytics if not provided
  const computedAnalytics = useMarketDataAnalytics(symbols);
  const activeAnalytics = analytics || computedAnalytics;

  // Sector data processing
  const sectorData = useMemo(() => {
    if (!activeAnalytics.sectorsBreakdown) {
      // Mock sector data
      return {
        Technology: {
          count: 8,
          totalValue: 125000,
          totalChange: 145.67,
          averageChange: 2.34,
          volume: 1.2e9,
          marketCap: 8.5e12,
          symbols: [
            "AAPL",
            "GOOGL",
            "MSFT",
            "NVDA",
            "META",
            "TSLA",
            "AMD",
            "NFLX",
          ],
        },
        Healthcare: {
          count: 3,
          totalValue: 45000,
          totalChange: -12.45,
          averageChange: -0.87,
          volume: 4.5e8,
          marketCap: 2.1e12,
          symbols: ["JNJ", "PFE", "ABBV"],
        },
        "Financial Services": {
          count: 4,
          totalValue: 67000,
          totalChange: 23.89,
          averageChange: 1.23,
          volume: 6.7e8,
          marketCap: 3.2e12,
          symbols: ["JPM", "BAC", "WFC", "GS"],
        },
        "Consumer Cyclical": {
          count: 5,
          totalValue: 89000,
          totalChange: 56.78,
          averageChange: 1.89,
          volume: 8.9e8,
          marketCap: 4.1e12,
          symbols: ["AMZN", "HD", "MCD", "NKE", "SBUX"],
        },
        Energy: {
          count: 3,
          totalValue: 34000,
          totalChange: 78.45,
          averageChange: 3.45,
          volume: 5.6e8,
          marketCap: 1.8e12,
          symbols: ["XOM", "CVX", "COP"],
        },
      };
    }

    return Object.entries(activeAnalytics.sectorsBreakdown).reduce(
      (acc, [sector, data]) => {
        acc[sector] = {
          ...data,
          averageChange: data.count > 0 ? data.totalChange / data.count : 0,
        };
        return acc;
      },
      {}
    );
  }, [activeAnalytics]);

  // Sort sectors
  const sortedSectors = useMemo(() => {
    return Object.entries(sectorData).sort(([, a], [, b]) => {
      let aValue, bValue;

      switch (sortBy) {
        case "performance":
          aValue = a.averageChange;
          bValue = b.averageChange;
          break;
        case "allocation":
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case "volume":
          aValue = a.volume;
          bValue = b.volume;
          break;
        case "count":
          aValue = a.count;
          bValue = b.count;
          break;
        default:
          aValue = a.averageChange;
          bValue = b.averageChange;
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });
  }, [sectorData, sortBy, sortOrder]);

  const totalPortfolioValue = useMemo(() => {
    return Object.values(sectorData).reduce(
      (sum, sector) => sum + sector.totalValue,
      0
    );
  }, [sectorData]);

  const getPerformanceColor = (change) => {
    if (change > 2) return "text-green-700 bg-green-100";
    if (change > 0) return "text-green-600 bg-green-50";
    if (change > -2) return "text-red-600 bg-red-50";
    return "text-red-700 bg-red-100";
  };

  const getSectorIcon = (sector) => {
    const iconClass = "h-6 w-6";
    const lowerSector = sector.toLowerCase();

    if (lowerSector.includes("tech"))
      return <ChartBarIcon className={`${iconClass} text-blue-500`} />;
    if (lowerSector.includes("health"))
      return <BuildingOfficeIcon className={`${iconClass} text-red-500`} />;
    if (lowerSector.includes("financ"))
      return <BanknotesIcon className={`${iconClass} text-green-500`} />;
    if (lowerSector.includes("energy"))
      return <ArrowTrendingUpIcon className={`${iconClass} text-orange-500`} />;
    if (lowerSector.includes("consumer"))
      return <ChartPieIcon className={`${iconClass} text-purple-500`} />;

    return <BuildingOfficeIcon className={`${iconClass} text-gray-500`} />;
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Sector Analysis
              </h2>
              <p className="text-sm text-gray-600">
                {Object.keys(sectorData).length} sectors • {symbols.length}{" "}
                total symbols
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="performance-desc">Best Performance</option>
              <option value="performance-asc">Worst Performance</option>
              <option value="allocation-desc">Largest Allocation</option>
              <option value="volume-desc">Most Volume</option>
              <option value="count-desc">Most Symbols</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sector Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {
                sortedSectors.filter(([, data]) => data.averageChange > 0)
                  .length
              }
            </div>
            <div className="text-sm text-green-600">Positive Sectors</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {
                sortedSectors.filter(([, data]) => data.averageChange < 0)
                  .length
              }
            </div>
            <div className="text-sm text-red-600">Negative Sectors</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {(
                sortedSectors.reduce(
                  (sum, [, data]) => sum + data.averageChange,
                  0
                ) / Math.max(1, sortedSectors.length)
              ).toFixed(2)}
              %
            </div>
            <div className="text-sm text-blue-600">Average Performance</div>
          </div>
        </div>

        {/* Sector Allocation Chart */}
        {showAllocation && totalPortfolioValue > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Portfolio Allocation
            </h3>

            <div className="space-y-3">
              {/* Allocation Bar */}
              <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden flex">
                {sortedSectors.map(([sector, data], index) => {
                  const percentage =
                    (data.totalValue / totalPortfolioValue) * 100;
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                    "bg-red-500",
                    "bg-yellow-500",
                    "bg-indigo-500",
                    "bg-pink-500",
                  ];

                  return percentage > 1 ? (
                    <div
                      key={sector}
                      className={`${
                        colors[index % colors.length]
                      } flex items-center justify-center text-white text-xs font-medium transition-all duration-200 hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                      title={`${sector}: ${percentage.toFixed(1)}%`}
                    >
                      {percentage > 8 && sector.slice(0, 4)}
                    </div>
                  ) : null;
                })}
              </div>

              {/* Allocation Legend */}
              <div className="flex flex-wrap gap-3">
                {sortedSectors.map(([sector, data], index) => {
                  const percentage =
                    (data.totalValue / totalPortfolioValue) * 100;
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                    "bg-red-500",
                    "bg-yellow-500",
                    "bg-indigo-500",
                    "bg-pink-500",
                  ];

                  return (
                    <div key={sector} className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-sm ${
                          colors[index % colors.length]
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {sector} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sector Performance Table */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sector Performance
          </h3>

          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("count")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Symbols</span>
                      {sortBy === "count" && (
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("performance")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Performance</span>
                      {sortBy === "performance" && (
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("allocation")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Allocation</span>
                      {sortBy === "allocation" && (
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("volume")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Volume</span>
                      {sortBy === "volume" && (
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSectors.map(([sector, data]) => {
                  const allocationPercent =
                    totalPortfolioValue > 0
                      ? (data.totalValue / totalPortfolioValue) * 100
                      : 0;

                  return (
                    <tr
                      key={sector}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedSector === sector ? "bg-blue-50" : ""
                      }`}
                      onClick={() =>
                        setSelectedSector(
                          selectedSector === sector ? null : sector
                        )
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {getSectorIcon(sector)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sector}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.symbols?.slice(0, 3).join(", ")}
                              {data.count > 3 && ` +${data.count - 3} more`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {data.count}
                        </div>
                        <div className="text-xs text-gray-500">symbols</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(
                            data.averageChange
                          )}`}
                        >
                          {data.averageChange >= 0 ? "+" : ""}
                          {data.averageChange.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Total: {data.averageChange >= 0 ? "+" : ""}$
                          {data.totalChange.toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${formatLargeNumber(data.totalValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {allocationPercent.toFixed(1)}% of portfolio
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatLargeNumber(data.volume)}
                        </div>
                        <div className="text-xs text-gray-500">daily vol</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {data.averageChange >= 0 ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Detail Modal */}
        {selectedSector && sectorData[selectedSector] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getSectorIcon(selectedSector)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedSector}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Detailed sector analysis •{" "}
                        {sectorData[selectedSector].count} symbols
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSector(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Sector Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {sectorData[selectedSector].averageChange.toFixed(2)}%
                    </div>
                    <div className="text-xs text-blue-600">Avg Performance</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      $
                      {formatLargeNumber(sectorData[selectedSector].totalValue)}
                    </div>
                    <div className="text-xs text-green-600">Total Value</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {formatLargeNumber(sectorData[selectedSector].volume)}
                    </div>
                    <div className="text-xs text-purple-600">Volume</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {(
                        (sectorData[selectedSector].totalValue /
                          totalPortfolioValue) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-orange-600">Of Portfolio</div>
                  </div>
                </div>

                {/* Symbol Breakdown */}
                {sectorData[selectedSector].symbols && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Symbols in {selectedSector}
                    </h4>
                    <div className="space-y-2">
                      {sectorData[selectedSector].symbols.map((symbolName) => {
                        const symbolData = symbols.find(
                          (s) => s.symbol === symbolName
                        );
                        return symbolData ? (
                          <div
                            key={symbolName}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {symbolName}
                              </span>
                              <div className="text-xs text-gray-500">
                                {symbolData.name}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                ${symbolData.currentPrice?.toFixed(2)}
                              </div>
                              <div
                                className={`text-xs font-medium ${
                                  getPerformanceColor(
                                    symbolData.changePercent || 0
                                  ).split(" ")[0]
                                }`}
                              >
                                {(symbolData.changePercent || 0) >= 0
                                  ? "+"
                                  : ""}
                                {(symbolData.changePercent || 0).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={symbolName}
                            className="p-2 text-gray-400 text-sm"
                          >
                            {symbolName} (No data)
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sector Performance Comparison */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance Comparison
          </h3>

          <div className="space-y-2">
            {sortedSectors.map(([sector, data], index) => {
              const maxValue = Math.max(
                ...sortedSectors.map(([, d]) => Math.abs(d.averageChange))
              );
              const barWidth = (Math.abs(data.averageChange) / maxValue) * 100;

              return (
                <div key={sector} className="flex items-center space-x-4">
                  <div
                    className="w-32 text-sm text-gray-700 truncate"
                    title={sector}
                  >
                    {sector}
                  </div>

                  <div className="flex-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 relative">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          data.averageChange >= 0
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${barWidth}%`,
                          marginLeft:
                            data.averageChange < 0
                              ? `${100 - barWidth}%`
                              : "0%",
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {data.averageChange >= 0 ? "+" : ""}
                          {data.averageChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-20 text-right text-sm text-gray-600">
                    {data.count} stocks
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best & Worst Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-700">
              🏆 Top Performing Sectors
            </h4>
            {sortedSectors
              .filter(([, data]) => data.averageChange > 0)
              .slice(0, 3)
              .map(([sector, data], index) => (
                <div
                  key={sector}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-green-700 font-bold">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-green-800">
                        {sector}
                      </div>
                      <div className="text-xs text-green-600">
                        {data.count} symbols
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-700">
                      +{data.averageChange.toFixed(2)}%
                    </div>
                    <div className="text-xs text-green-600">
                      {formatLargeNumber(data.volume)} vol
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-red-700">
              📉 Underperforming Sectors
            </h4>
            {sortedSectors
              .filter(([, data]) => data.averageChange < 0)
              .slice(0, 3)
              .map(([sector, data], index) => (
                <div
                  key={sector}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-red-700 font-bold">#{index + 1}</span>
                    <div>
                      <div className="text-sm font-medium text-red-800">
                        {sector}
                      </div>
                      <div className="text-xs text-red-600">
                        {data.count} symbols
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-700">
                      {data.averageChange.toFixed(2)}%
                    </div>
                    <div className="text-xs text-red-600">
                      {formatLargeNumber(data.volume)} vol
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Sector Rotation Analysis */}
        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
          <h4 className="text-lg font-medium text-indigo-800 mb-4">
            Sector Rotation Insights
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-indigo-700 mb-2">
                Money Flow
              </h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-indigo-700">
                    Inflows:{" "}
                    {
                      sortedSectors.filter(([, d]) => d.averageChange > 1)
                        .length
                    }{" "}
                    sectors
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-indigo-700">
                    Outflows:{" "}
                    {
                      sortedSectors.filter(([, d]) => d.averageChange < -1)
                        .length
                    }{" "}
                    sectors
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-indigo-700 mb-2">
                Market Sentiment
              </h5>
              <div className="text-sm text-indigo-700">
                {sortedSectors.filter(([, d]) => d.averageChange > 0).length >
                sortedSectors.filter(([, d]) => d.averageChange < 0).length
                  ? `Risk-on sentiment with ${
                      sortedSectors.filter(([, d]) => d.averageChange > 0)
                        .length
                    }/${sortedSectors.length} sectors positive`
                  : `Risk-off sentiment with ${
                      sortedSectors.filter(([, d]) => d.averageChange < 0)
                        .length
                    }/${sortedSectors.length} sectors negative`}
              </div>
            </div>
          </div>

          {/* Top rotation candidates */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-indigo-700 mb-2">
              Rotation Candidates
            </h5>
            <div className="flex flex-wrap gap-2">
              {sortedSectors
                .filter(([, data]) => Math.abs(data.averageChange) > 1)
                .slice(0, 5)
                .map(([sector, data]) => (
                  <span
                    key={sector}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      data.averageChange > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sector}: {data.averageChange >= 0 ? "+" : ""}
                    {data.averageChange.toFixed(1)}%
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function formatLargeNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

function getSectorIcon(sector) {
  const iconClass = "h-5 w-5";
  const lowerSector = sector.toLowerCase();

  if (lowerSector.includes("tech"))
    return <ChartBarIcon className={`${iconClass} text-blue-500`} />;
  if (lowerSector.includes("health"))
    return <BuildingOfficeIcon className={`${iconClass} text-red-500`} />;
  if (lowerSector.includes("financ"))
    return <BanknotesIcon className={`${iconClass} text-green-500`} />;
  if (lowerSector.includes("energy"))
    return <ArrowTrendingUpIcon className={`${iconClass} text-orange-500`} />;
  if (lowerSector.includes("consumer"))
    return <ChartPieIcon className={`${iconClass} text-purple-500`} />;

  return <BuildingOfficeIcon className={`${iconClass} text-gray-500`} />;
}

function getPerformanceColor(change) {
  if (change > 2) return "text-green-700 bg-green-100";
  if (change > 0) return "text-green-600 bg-green-50";
  if (change > -2) return "text-red-600 bg-red-50";
  return "text-red-700 bg-red-100";
}

export default SectorAnalysis;
