/**
 * /dashboard/market-data/page.js - Market data browser dashboard
 * Main market overview with trending stocks, indices, and market summaries
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  GlobeAmericasIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  useMarketOverview,
  useMarketIndices,
  useTrendingSymbols,
  useMarketNews,
  useSectorPerformance,
  useMarketSearch,
} from "../../../hooks/useMarketData";
import SymbolCard, {
  SymbolGrid,
} from "../../../components/features/MarketData/SymbolCard";
import PriceChart from "../../../components/features/MarketData/PriceChart";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function MarketDataPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState("SPY");
  const [viewMode, setViewMode] = useState("overview"); // overview, trending, indices
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Hooks
  const { data: marketOverview, isLoading: overviewLoading } =
    useMarketOverview();
  const { data: indices, isLoading: indicesLoading } = useMarketIndices();
  const { data: trending, isLoading: trendingLoading } = useTrendingSymbols();
  const { data: news, isLoading: newsLoading } = useMarketNews({ limit: 5 });
  const { data: sectors, isLoading: sectorsLoading } = useSectorPerformance();
  const { data: searchResults, isLoading: searchLoading } = useMarketSearch(
    searchQuery,
    {
      enabled: searchQuery.length > 2,
    }
  );

  // Auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        // Trigger refetch of all market data
        window.location.reload();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Market status
  const getMarketStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Simple market hours check (9:30 AM - 4:00 PM EST, Mon-Fri)
    if (day === 0 || day === 6) return "closed"; // Weekend
    if (hour < 9 || (hour === 9 && now.getMinutes() < 30)) return "pre-market";
    if (hour >= 16) return "after-hours";
    return "open";
  };

  const marketStatus = getMarketStatus();

  const getMarketStatusColor = () => {
    switch (marketStatus) {
      case "open":
        return "text-green-600 bg-green-100";
      case "pre-market":
        return "text-yellow-600 bg-yellow-100";
      case "after-hours":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderMarketOverview = () => (
    <div className="space-y-6">
      {/* Market Status & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Status</p>
              <p
                className={`text-2xl font-bold capitalize ${getMarketStatusColor()}`}
              >
                {marketStatus.replace("-", " ")}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getMarketStatusColor()}`}>
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Symbols
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {marketOverview?.activeSymbols?.toLocaleString() || "—"}
              </p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ChartBarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketOverview?.totalVolume
                  ? `${(marketOverview.totalVolume / 1e9).toFixed(1)}B`
                  : "—"}
              </p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketOverview?.totalMarketCap
                  ? `$${(marketOverview.totalMarketCap / 1e12).toFixed(1)}T`
                  : "—"}
              </p>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <GlobeAmericasIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Major Indices */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Major Indices</h3>
        </div>
        <div className="p-6">
          {indicesLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : indices ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {indices.map((index) => (
                <div
                  key={index.symbol}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedIndex === index.symbol
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedIndex(index.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {index.symbol}
                      </h4>
                      <p className="text-sm text-gray-600">{index.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {index.price?.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          index.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {index.change >= 0 ? "+" : ""}
                        {index.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
              <p>No indices data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Index Chart */}
      {selectedIndex && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedIndex} Chart
            </h3>
          </div>
          <div className="p-6">
            <PriceChart
              symbol={selectedIndex}
              height={300}
              period="1D"
              realTime={true}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderTrending = () => (
    <div className="space-y-6">
      {/* Trending Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FireIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Most Active
              </h3>
            </div>
          </div>
          <div className="p-6">
            {trendingLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : trending?.mostActive ? (
              <SymbolGrid
                symbols={trending.mostActive}
                variant="compact"
                onSymbolClick={(symbol) => console.log("Navigate to", symbol)}
              />
            ) : (
              <div className="text-center text-gray-500">
                <p>No trending data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Gainers */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Top Gainers
              </h3>
            </div>
          </div>
          <div className="p-6">
            {trendingLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : trending?.topGainers ? (
              <SymbolGrid
                symbols={trending.topGainers}
                variant="compact"
                onSymbolClick={(symbol) => console.log("Navigate to", symbol)}
              />
            ) : (
              <div className="text-center text-gray-500">
                <p>No gainers data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Top Losers
              </h3>
            </div>
          </div>
          <div className="p-6">
            {trendingLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : trending?.topLosers ? (
              <SymbolGrid
                symbols={trending.topLosers}
                variant="compact"
                onSymbolClick={(symbol) => console.log("Navigate to", symbol)}
              />
            ) : (
              <div className="text-center text-gray-500">
                <p>No losers data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent IPOs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent IPOs
              </h3>
            </div>
          </div>
          <div className="p-6">
            {trendingLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : trending?.recentIPOs ? (
              <SymbolGrid
                symbols={trending.recentIPOs}
                variant="compact"
                onSymbolClick={(symbol) => console.log("Navigate to", symbol)}
              />
            ) : (
              <div className="text-center text-gray-500">
                <p>No recent IPOs available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectorPerformance = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Sector Performance
        </h3>
      </div>
      <div className="p-6">
        {sectorsLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : sectors ? (
          <div className="space-y-4">
            {sectors.map((sector) => (
              <Link
                key={sector.sector}
                href={`/dashboard/market-data/sectors?sector=${sector.sector}`}
                className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {sector.sector}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {sector.companies} companies
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        sector.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {sector.change >= 0 ? "+" : ""}
                      {sector.change.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Mkt Cap: ${(sector.marketCap / 1e9).toFixed(1)}B
                    </p>
                  </div>
                </div>

                {/* Mini performance bar */}
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sector.change >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.abs(sector.change) * 10,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-12">
                      {sector.change >= 0 ? "+" : ""}
                      {sector.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
            <p>No sector data available</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMarketNews = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Market News</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {newsLoading ? (
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
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
                    {article.sentiment && (
                      <>
                        <span>•</span>
                        <span
                          className={`capitalize ${
                            article.sentiment === "positive"
                              ? "text-green-600"
                              : article.sentiment === "negative"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {article.sentiment}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No market news available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Data</h1>
          <p className="text-gray-600">
            Real-time market overview and analysis
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto-refresh setting */}
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 text-gray-400" />
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>No refresh</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/market-data/symbols"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Symbol Explorer
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search symbols, companies, or news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Search Results Dropdown */}
        {searchQuery.length > 2 &&
          searchResults &&
          searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => {
                    setSearchQuery("");
                    // Navigate to symbol
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {result.symbol}
                      </h4>
                      <p className="text-sm text-gray-600">{result.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${result.price?.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${
                          result.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.change >= 0 ? "+" : ""}
                        {result.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { id: "overview", label: "Overview" },
          { id: "trending", label: "Trending" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {viewMode === "overview" ? renderMarketOverview() : renderTrending()}
        </div>

        <div className="space-y-6">
          {renderSectorPerformance()}
          {renderMarketNews()}
        </div>
      </div>
    </div>
  );
}
