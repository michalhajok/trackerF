/**
 * SymbolSearch.js - Advanced symbol search component
 * Provides intelligent symbol search with suggestions and filters
 */

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useSymbolSearch, usePopularSymbols } from "../../hooks/useMarketData";
import { useRecentSymbols } from "../../hooks/useWatchlist";

const SymbolSearch = ({
  onSymbolSelect,
  onSymbolsSelect, // For multi-select
  excludeSymbols = [],
  placeholder = "Search stocks, ETFs, crypto...",
  allowMultiSelect = false,
  showRecent = true,
  showPopular = true,
  showFilters = false,
  maxResults = 10,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchFilters, setSearchFilters] = useState({
    assetType: "all", // all, stocks, etf, crypto, forex
    minPrice: null,
    maxPrice: null,
    sector: "all",
  });

  const searchRef = useRef(null);
  const resultRefs = useRef([]);

  // Hooks
  const {
    data: searchResults,
    isLoading,
    error,
  } = useSymbolSearch(query, {
    filters: searchFilters,
    limit: maxResults,
    enabled: query.length >= 2,
  });

  const { data: popularSymbols } = usePopularSymbols({ limit: 20 });
  const { data: recentSymbols } = useRecentSymbols({ limit: 10 });

  // Filtered results
  const filteredResults = useMemo(() => {
    if (!searchResults?.data) return [];

    return searchResults.data.filter(
      (symbol) => !excludeSymbols.includes(symbol.symbol)
    );
  }, [searchResults, excludeSymbols]);

  // Default suggestions when not searching
  const suggestions = useMemo(() => {
    const recent = showRecent ? (recentSymbols?.data || []).slice(0, 5) : [];
    const popular = showPopular ? (popularSymbols?.data || []).slice(0, 8) : [];

    return {
      recent: recent.filter((s) => !excludeSymbols.includes(s.symbol)),
      popular: popular.filter((s) => !excludeSymbols.includes(s.symbol)),
    };
  }, [recentSymbols, popularSymbols, excludeSymbols, showRecent, showPopular]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const results = filteredResults;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelectSymbol(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  // Scroll selected result into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSymbol = (symbol) => {
    if (allowMultiSelect) {
      onSymbolsSelect?.([symbol]);
    } else {
      onSymbolSelect?.(symbol.symbol);
    }

    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 1);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const getAssetTypeIcon = (type) => {
    const iconClass = "h-4 w-4";
    switch (type?.toLowerCase()) {
      case "stock":
        return <ChartBarIcon className={`${iconClass} text-blue-500`} />;
      case "etf":
        return <BuildingOfficeIcon className={`${iconClass} text-green-500`} />;
      case "crypto":
        return <BanknotesIcon className={`${iconClass} text-orange-500`} />;
      case "forex":
        return <GlobeAltIcon className={`${iconClass} text-purple-500`} />;
      default:
        return <ChartBarIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000)
      return price.toLocaleString("en-US", { minimumFractionDigits: 2 });
    return price?.toFixed(2) || "0.00";
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const renderResultItem = (symbol, index, isHighlighted = false) => (
    <div
      key={`${symbol.symbol}-${index}`}
      ref={(el) => (resultRefs.current[index] = el)}
      onClick={() => handleSelectSymbol(symbol)}
      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
        isHighlighted
          ? "bg-blue-50 border-l-2 border-blue-500"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {getAssetTypeIcon(symbol.assetType)}

          {/* Real-time indicator for stocks */}
          {symbol.assetType === "stock" && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">
              {symbol.symbol}
            </span>

            {symbol.isTrending && (
              <TrendingUpIcon className="h-3 w-3 text-orange-500" />
            )}
          </div>

          <div className="text-sm text-gray-600 truncate">
            {symbol.name || symbol.companyName}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {symbol.sector && <span>{symbol.sector}</span>}
            {symbol.exchange && <span>• {symbol.exchange}</span>}
            {symbol.assetType && (
              <span>• {symbol.assetType.toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Price info */}
      <div className="text-right">
        {symbol.currentPrice && (
          <>
            <div className="text-sm font-medium text-gray-900">
              ${formatPrice(symbol.currentPrice)}
            </div>
            {symbol.changePercent !== undefined && (
              <div
                className={`text-xs font-medium ${getChangeColor(
                  symbol.changePercent
                )}`}
              >
                {symbol.changePercent >= 0 ? "+" : ""}
                {symbol.changePercent.toFixed(2)}%
              </div>
            )}
          </>
        )}

        {symbol.marketCap && (
          <div className="text-xs text-gray-500">
            {symbol.marketCap >= 1e12
              ? `${(symbol.marketCap / 1e12).toFixed(1)}T`
              : symbol.marketCap >= 1e9
              ? `${(symbol.marketCap / 1e9).toFixed(1)}B`
              : `${(symbol.marketCap / 1e6).toFixed(1)}M`}{" "}
            cap
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder={placeholder}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Filters */}
      {showFilters && isOpen && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={searchFilters.assetType}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  assetType: e.target.value,
                }))
              }
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="stocks">Stocks</option>
              <option value="etf">ETFs</option>
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
            </select>

            <input
              type="number"
              value={searchFilters.minPrice || ""}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  minPrice: parseFloat(e.target.value) || null,
                }))
              }
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Min price"
            />

            <input
              type="number"
              value={searchFilters.maxPrice || ""}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  maxPrice: parseFloat(e.target.value) || null,
                }))
              }
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Max price"
            />

            <select
              value={searchFilters.sector}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  sector: e.target.value,
                }))
              }
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial</option>
              <option value="Consumer Cyclical">Consumer</option>
              <option value="Energy">Energy</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Results */}
          {query.length >= 2 && (
            <div>
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              )}

              {error && (
                <div className="p-4 text-center text-red-600">
                  <p className="text-sm">Search failed. Please try again.</p>
                </div>
              )}

              {!isLoading &&
                !error &&
                filteredResults.length === 0 &&
                query.length >= 2 && (
                  <div className="p-4 text-center text-gray-500">
                    <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No symbols found for {query}</p>
                    <p className="text-xs mt-1">
                      Try different search terms or check spelling
                    </p>
                  </div>
                )}

              {!isLoading && filteredResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        SEARCH RESULTS ({filteredResults.length})
                      </span>
                      {filteredResults.length === maxResults && (
                        <span className="text-xs text-blue-600">
                          More results available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {filteredResults.map((symbol, index) =>
                      renderResultItem(symbol, index, selectedIndex === index)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Symbols */}
          {query.length < 2 && suggestions.recent.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    RECENTLY VIEWED
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {suggestions.recent.map((symbol, index) => (
                  <div
                    key={symbol.symbol}
                    onClick={() => handleSelectSymbol(symbol)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getAssetTypeIcon(symbol.assetType)}
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {symbol.symbol}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {symbol.name}
                        </div>
                      </div>
                    </div>

                    {symbol.currentPrice && (
                      <div className="text-right text-xs text-gray-500">
                        ${formatPrice(symbol.currentPrice)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Symbols */}
          {query.length < 2 && suggestions.popular.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-600">
                    POPULAR SYMBOLS
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                {suggestions.popular.map((symbol) => (
                  <div
                    key={symbol.symbol}
                    onClick={() => handleSelectSymbol(symbol)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getAssetTypeIcon(symbol.assetType)}
                        {symbol.isTrending && (
                          <TrendingUpIcon className="h-3 w-3 text-orange-500" />
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {symbol.symbol}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {symbol.name}
                        </div>
                        {symbol.sector && (
                          <div className="text-xs text-gray-400">
                            {symbol.sector}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {symbol.currentPrice && (
                        <div className="text-sm font-medium text-gray-900">
                          ${formatPrice(symbol.currentPrice)}
                        </div>
                      )}
                      {symbol.changePercent !== undefined && (
                        <div
                          className={`text-xs font-medium ${getChangeColor(
                            symbol.changePercent
                          )}`}
                        >
                          {symbol.changePercent >= 0 ? "+" : ""}
                          {symbol.changePercent.toFixed(2)}%
                        </div>
                      )}
                      {symbol.volume && (
                        <div className="text-xs text-gray-500">
                          Vol:{" "}
                          {symbol.volume >= 1e6
                            ? `${(symbol.volume / 1e6).toFixed(1)}M`
                            : symbol.volume >= 1e3
                            ? `${(symbol.volume / 1e3).toFixed(1)}K`
                            : symbol.volume.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No suggestions */}
          {query.length < 2 &&
            suggestions.recent.length === 0 &&
            suggestions.popular.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Start typing to search for symbols</p>
                <p className="text-xs mt-1">
                  Search stocks, ETFs, crypto, and more
                </p>
              </div>
            )}

          {/* Search Tips */}
          {query.length >= 1 && query.length < 2 && (
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <div className="flex items-start space-x-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Search Tips:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Type at least 2 characters to search</li>
                    <li>• Search by symbol (AAPL) or company name (Apple)</li>
                    <li>• Use filters to narrow down results</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Multi-Select Symbol Search Component
export const MultiSelectSymbolSearch = ({
  onSymbolsSelected,
  selectedSymbols = [],
  maxSelections = 50,
  className = "",
}) => {
  const [internalSelected, setInternalSelected] = useState(
    new Set(selectedSymbols)
  );

  const handleSymbolSelect = (symbol) => {
    const newSelected = new Set(internalSelected);

    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else if (newSelected.size < maxSelections) {
      newSelected.add(symbol);
    }

    setInternalSelected(newSelected);
    onSymbolsSelected?.(Array.from(newSelected));
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <SymbolSearch
          onSymbolSelect={handleSymbolSelect}
          excludeSymbols={[]}
          placeholder="Search and select multiple symbols..."
          className="mb-3"
        />

        {/* Selected Symbols Tags */}
        {internalSelected.size > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Selected ({internalSelected.size}/{maxSelections})
              </span>
              <button
                type="button"
                onClick={() => {
                  setInternalSelected(new Set());
                  onSymbolsSelected?.([]);
                }}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(internalSelected).map((symbol) => (
                <span
                  key={symbol}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {symbol}
                  <button
                    type="button"
                    onClick={() => handleSymbolSelect(symbol)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Symbol Search for small spaces
export const CompactSymbolSearch = ({
  onSymbolSelect,
  placeholder = "Add symbol...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const { data: searchResults } = useSymbolSearch(query, { limit: 5 });

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
      />

      {query.length >= 2 && searchResults?.data && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {searchResults.data.slice(0, 5).map((symbol) => (
            <div
              key={symbol.symbol}
              onClick={() => {
                onSymbolSelect?.(symbol.symbol);
                setQuery("");
              }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium">{symbol.symbol}</div>
                <div className="text-xs text-gray-500 truncate">
                  {symbol.name}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                ${symbol.currentPrice?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;
