/**
 * /dashboard/market-data/sectors/page.js - Sector analysis
 * Comprehensive sector performance analysis and comparison
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useSectorPerformance,
  useSectorCompanies,
  useSectorNews,
  useSectorComparison,
  useMarketData,
} from "../../../hooks/useMarketData";
import SymbolCard, {
  SymbolGrid,
} from "../../../components/market-data/SymbolCard";
import PriceChart from "../../../components/market-data/PriceChart";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

export default function SectorsPage() {
  const searchParams = useSearchParams();
  const selectedSectorParam = searchParams.get("sector");

  const [selectedSector, setSelectedSector] = useState(
    selectedSectorParam || null
  );
  const [timeframe, setTimeframe] = useState("1M"); // 1D, 1W, 1M, 3M, 1Y
  const [sortBy, setSortBy] = useState("marketCap"); // marketCap, performance, volume
  const [showComparison, setShowComparison] = useState(false);

  // Hooks
  const { data: sectors, isLoading: sectorsLoading } =
    useSectorPerformance(timeframe);
  const { data: sectorCompanies, isLoading: companiesLoading } =
    useSectorCompanies(selectedSector, {
      sortBy,
      enabled: !!selectedSector,
    });
  const { data: sectorNews, isLoading: newsLoading } = useSectorNews(
    selectedSector,
    {
      enabled: !!selectedSector,
    }
  );

  // Sector colors for visualization
  const sectorColors = {
    Technology: "#3B82F6",
    Healthcare: "#10B981",
    "Financial Services": "#F59E0B",
    "Consumer Cyclical": "#EF4444",
    "Communication Services": "#8B5CF6",
    Industrials: "#06B6D4",
    "Consumer Defensive": "#84CC16",
    Energy: "#F97316",
    Utilities: "#6B7280",
    "Real Estate": "#EC4899",
    "Basic Materials": "#F43F5E",
  };

  const getSectorColor = (sector) => sectorColors[sector] || "#6B7280";

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap?.toLocaleString()}`;
  };

  const renderSectorOverview = () => (
    <div className="space-y-6">
      {/* Sector Performance Heatmap */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Sector Performance
            </h3>

            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="1D">1 Day</option>
                <option value="1W">1 Week</option>
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="1Y">1 Year</option>
              </select>

              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  showComparison
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showComparison ? "Hide" : "Show"} Comparison
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sectorsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 rounded-lg h-24"
                ></div>
              ))}
            </div>
          ) : sectors ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sectors.map((sector) => (
                <div
                  key={sector.sector}
                  onClick={() => setSelectedSector(sector.sector)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSector === sector.sector
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  } ${
                    sector.change >= 0
                      ? "bg-gradient-to-br from-green-50 to-green-100"
                      : "bg-gradient-to-br from-red-50 to-red-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSectorColor(sector.sector) }}
                    ></div>
                    {sector.change >= 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {sector.sector}
                  </h4>

                  <div className="space-y-1">
                    <div
                      className={`text-lg font-bold ${
                        sector.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {sector.change >= 0 ? "+" : ""}
                      {sector.change.toFixed(2)}%
                    </div>

                    <div className="text-xs text-gray-600">
                      {sector.companies} companies
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatMarketCap(sector.marketCap)}
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          sector.change >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.abs(sector.change) * 20,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No sector data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Sector Comparison Chart */}
      {showComparison && sectors && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Sector Comparison ({timeframe})
            </h3>
          </div>
          <div className="p-6">
            <div className="h-80">
              {/* This would be a bar chart comparing all sectors */}
              <div className="flex items-end justify-between h-full space-x-2">
                {sectors.slice(0, 11).map((sector) => {
                  const height = Math.max(5, Math.abs(sector.change) * 5);
                  return (
                    <div
                      key={sector.sector}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t transition-all ${
                            sector.change >= 0 ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-center">
                        <div className="font-medium truncate w-16">
                          {sector.sector.split(" ")[0]}
                        </div>
                        <div
                          className={`font-bold ${
                            sector.change >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {sector.change >= 0 ? "+" : ""}
                          {sector.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Best Performing Sectors
              </h3>
            </div>
          </div>
          <div className="p-6">
            {sectors &&
              sectors
                .filter((s) => s.change >= 0)
                .sort((a, b) => b.change - a.change)
                .slice(0, 5)
                .map((sector, index) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                    onClick={() => setSelectedSector(sector.sector)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {sector.sector}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {sector.companies} companies
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{sector.change.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMarketCap(sector.marketCap)}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Worst Performing Sectors
              </h3>
            </div>
          </div>
          <div className="p-6">
            {sectors &&
              sectors
                .filter((s) => s.change < 0)
                .sort((a, b) => a.change - b.change)
                .slice(0, 5)
                .map((sector, index) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                    onClick={() => setSelectedSector(sector.sector)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {sector.sector}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {sector.companies} companies
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {sector.change.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMarketCap(sector.marketCap)}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectorDetail = () => (
    <div className="space-y-6">
      {/* Sector Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedSector(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to All Sectors
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getSectorColor(selectedSector) + "20" }}
          >
            <BuildingOffice2Icon
              className="h-6 w-6"
              style={{ color: getSectorColor(selectedSector) }}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedSector}
            </h2>
            <p className="text-gray-600">
              Sector performance and company analysis
            </p>
          </div>

          {/* Sector stats */}
          {sectors && (
            <div className="text-right">
              {sectors.find((s) => s.sector === selectedSector) && (
                <div className="space-y-1">
                  <div
                    className={`text-2xl font-bold ${
                      sectors.find((s) => s.sector === selectedSector).change >=
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {sectors.find((s) => s.sector === selectedSector).change >=
                    0
                      ? "+"
                      : ""}
                    {sectors
                      .find((s) => s.sector === selectedSector)
                      .change.toFixed(2)}
                    %
                  </div>
                  <div className="text-sm text-gray-500">
                    {sectors.find((s) => s.sector === selectedSector).companies}{" "}
                    companies
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatMarketCap(
                      sectors.find((s) => s.sector === selectedSector).marketCap
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sector Companies */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSector} Companies
            </h3>

            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="marketCap">Sort by Market Cap</option>
                <option value="performance">Sort by Performance</option>
                <option value="volume">Sort by Volume</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {companiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 rounded-lg h-32"
                ></div>
              ))}
            </div>
          ) : sectorCompanies && sectorCompanies.length > 0 ? (
            <SymbolGrid
              symbols={sectorCompanies.map((c) => c.symbol)}
              variant="default"
              onSymbolClick={(symbol) => {
                // Navigate to symbol detail or show chart
                console.log("Navigate to", symbol);
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BuildingOffice2Icon className="h-8 w-8 mx-auto mb-2" />
              <p>No companies data available for this sector</p>
            </div>
          )}
        </div>
      </div>

      {/* Sector News */}
      {sectorNews && sectorNews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSector} News
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sectorNews.slice(0, 5).map((article, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 mb-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(article.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sector Analysis</h1>
          <p className="text-gray-600">
            {selectedSector
              ? `Detailed analysis of ${selectedSector} sector`
              : "Comprehensive sector performance and analysis"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/market-data"
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Market Overview
          </Link>

          <Link
            href="/dashboard/market-data/symbols"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Symbol Explorer
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {selectedSector ? renderSectorDetail() : renderSectorOverview()}
    </div>
  );
}
