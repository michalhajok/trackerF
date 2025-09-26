/**
 * /dashboard/market-data/symbols/page.js - Symbol explorer
 * Advanced symbol search and exploration with detailed market data
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ListBulletIcon,
  Squares2X2Icon,
  StarIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  InformationCircleIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useSymbolSearch,
  usePopularSymbols,
  useWatchlist,
  useMarketData,
  useSymbolScreener,
} from "../../../hooks/useMarketData";
import SymbolCard, {
  SymbolGrid,
} from "../../../components/market-data/SymbolCard";
import PriceChart from "../../../components/market-data/PriceChart";
import Link from "next/link";

export default function SymbolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid, list, chart
  const [filterExchange, setFilterExchange] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterMarketCap, setFilterMarketCap] = useState("all");
  const [sortBy, setSortBy] = useState("marketCap"); // marketCap, price, volume, change
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [showFilters, setShowFilters] = useState(false);

  // Hooks
  const { data: searchResults, isLoading: searchLoading } = useSymbolSearch(
    searchQuery,
    {
      exchange: filterExchange !== "all" ? filterExchange : undefined,
      sector: filterSector !== "all" ? filterSector : undefined,
      marketCap: filterMarketCap !== "all" ? filterMarketCap : undefined,
      sortBy,
      sortOrder,
      limit: 50,
      enabled: searchQuery.length > 0,
    }
  );

  const { data: popularSymbols, isLoading: popularLoading } =
    usePopularSymbols();
  const { data: watchlist } = useWatchlist();

  // Filter options
  const exchanges = [
    { value: "all", label: "All Exchanges" },
    { value: "NASDAQ", label: "NASDAQ" },
    { value: "NYSE", label: "NYSE" },
    { value: "AMEX", label: "AMEX" },
  ];

  const sectors = [
    { value: "all", label: "All Sectors" },
    { value: "Technology", label: "Technology" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Financial Services", label: "Financial Services" },
    { value: "Consumer Cyclical", label: "Consumer Cyclical" },
    { value: "Communication Services", label: "Communication Services" },
    { value: "Industrials", label: "Industrials" },
    { value: "Consumer Defensive", label: "Consumer Defensive" },
    { value: "Energy", label: "Energy" },
    { value: "Utilities", label: "Utilities" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Basic Materials", label: "Basic Materials" },
  ];

  const marketCapRanges = [
    { value: "all", label: "All Cap Sizes" },
    { value: "mega", label: "Mega Cap ($200B+)" },
    { value: "large", label: "Large Cap ($10B-$200B)" },
    { value: "mid", label: "Mid Cap ($2B-$10B)" },
    { value: "small", label: "Small Cap ($300M-$2B)" },
    { value: "micro", label: "Micro Cap (<$300M)" },
  ];

  const sortOptions = [
    { value: "marketCap", label: "Market Cap" },
    { value: "price", label: "Price" },
    { value: "volume", label: "Volume" },
    { value: "change", label: "Change %" },
    { value: "name", label: "Name" },
  ];

  // Display symbols (search results or popular symbols)
  const displaySymbols =
    searchQuery.length > 0 ? searchResults : popularSymbols;
  const isLoading = searchQuery.length > 0 ? searchLoading : popularLoading;

  const handleSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
    setViewMode("chart");
  };

  const renderSymbolList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!displaySymbols || displaySymbols.length === 0) {
      return (
        <div className="text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchQuery ? "No symbols found" : "No symbols available"}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Popular symbols will appear here"}
          </p>
        </div>
      );
    }

    if (viewMode === "list") {
      return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displaySymbols.map((symbol) => (
                  <SymbolTableRow
                    key={symbol.symbol}
                    symbol={symbol}
                    onSymbolClick={handleSymbolClick}
                    isInWatchlist={watchlist?.includes(symbol.symbol)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <SymbolGrid
        symbols={displaySymbols.map((s) => s.symbol)}
        variant="default"
        onSymbolClick={handleSymbolClick}
      />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Symbol Explorer</h1>
          <p className="text-gray-600">Search and explore market symbols</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`p-2 rounded transition-colors ${
                viewMode === "chart" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
              title="Chart view"
            >
              <ChartBarIcon className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/dashboard/market-data/sectors"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Sector Analysis
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols (e.g., AAPL, Tesla, technology stocks)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {(filterExchange !== "all" ||
                filterSector !== "all" ||
                filterMarketCap !== "all") && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {displaySymbols && displaySymbols.length > 0 && (
              <span className="text-sm text-gray-600">
                {displaySymbols.length} symbol
                {displaySymbols.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exchange
                </label>
                <select
                  value={filterExchange}
                  onChange={(e) => setFilterExchange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {exchanges.map((exchange) => (
                    <option key={exchange.value} value={exchange.value}>
                      {exchange.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Cap
                </label>
                <select
                  value={filterMarketCap}
                  onChange={(e) => setFilterMarketCap(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {marketCapRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  setFilterExchange("all");
                  setFilterSector("all");
                  setFilterMarketCap("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {viewMode === "chart" && selectedSymbol ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PriceChart
              symbol={selectedSymbol}
              height={500}
              period="1D"
              realTime={true}
              showVolume={true}
              showIndicators={true}
            />
          </div>
          <div>
            <SymbolCard
              symbol={selectedSymbol}
              variant="detailed"
              showActions={true}
            />
          </div>
        </div>
      ) : (
        <div>{renderSymbolList()}</div>
      )}

      {/* Quick Actions */}
      {searchQuery.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSearchQuery("AAPL MSFT GOOGL AMZN TSLA")}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-1">FAANG Stocks</h4>
              <p className="text-sm text-gray-600">Search major tech stocks</p>
            </button>

            <button
              onClick={() => {
                setFilterSector("Technology");
                setSearchQuery("technology");
              }}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-1">Tech Sector</h4>
              <p className="text-sm text-gray-600">
                Explore technology companies
              </p>
            </button>

            <button
              onClick={() => {
                setFilterMarketCap("small");
                setSearchQuery("small cap");
              }}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-1">Small Cap</h4>
              <p className="text-sm text-gray-600">
                Find small cap opportunities
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Symbol table row component
const SymbolTableRow = ({ symbol, onSymbolClick, isInWatchlist = false }) => {
  const { data: marketData } = useMarketData(symbol.symbol);

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume?.toLocaleString();
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return marketCap?.toLocaleString();
  };

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onSymbolClick(symbol.symbol)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center">
              {symbol.symbol}
              {isInWatchlist && (
                <StarIconSolid className="h-4 w-4 text-yellow-500 ml-2" />
              )}
            </div>
            <div className="text-sm text-gray-500">{symbol.name}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          ${marketData?.price?.toFixed(2) || symbol.price?.toFixed(2) || "—"}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-sm font-medium ${
            (marketData?.change || symbol.change) >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {(marketData?.change || symbol.change) >= 0 ? "+" : ""}
          {(marketData?.changePercent || symbol.changePercent)?.toFixed(2)}%
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatVolume(marketData?.volume || symbol.volume)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatMarketCap(marketData?.marketCap || symbol.marketCap)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSymbolClick(symbol.symbol);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="View chart"
          >
            <ChartBarIcon className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle watchlist toggle
            }}
            className="text-gray-400 hover:text-yellow-500"
            title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist ? (
              <StarIconSolid className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};
