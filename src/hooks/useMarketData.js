/**
 * useMarketData.js - Dedicated hook for market data management
 * Handles all market data operations with real-time updates
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const QUERY_KEYS = {
  marketData: "market-data",
  symbol: "market-data-symbol",
  batch: "market-data-batch",
  summary: "market-data-summary",
  movers: "market-data-movers",
  search: "market-data-search",
  historical: "market-data-historical",
  sectors: "market-data-sectors",
  active: "market-data-active",
};

export const useMarketData = (symbol) => {
  return useQuery({
    queryKey: [QUERY_KEYS.symbol, symbol],
    queryFn: () => apiEndpoints.marketData.getSymbol(symbol),
    enabled: !!symbol,
    staleTime: 30000, // 30 seconds for individual symbols
    refetchInterval: 60000, // Auto-refresh every minute
    refetchIntervalInBackground: true,
  });
};

export const useBatchMarketData = (symbols = []) => {
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute default

  const query = useQuery({
    queryKey: [QUERY_KEYS.batch, symbols],
    queryFn: () => apiEndpoints.marketData.getBatch(symbols),
    enabled: symbols && symbols.length > 0,
    staleTime: 15000, // 15 seconds for batch data
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });

  // Dynamic refresh rate based on number of symbols
  useEffect(() => {
    if (symbols.length <= 10) {
      setRefreshInterval(30000); // 30 seconds for small batches
    } else if (symbols.length <= 50) {
      setRefreshInterval(60000); // 1 minute for medium batches
    } else {
      setRefreshInterval(120000); // 2 minutes for large batches
    }
  }, [symbols.length]);

  return {
    ...query,
    symbols: query.data?.data || [],
    refreshInterval,
    setRefreshInterval,
  };
};

export const useMarketSummary = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.summary, params],
    queryFn: () => apiEndpoints.marketData.getSummary(params),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // 2 minutes
  });
};

export const useTopMovers = (params = { limit: 10, timeframe: "1d" }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.movers, params],
    queryFn: () => apiEndpoints.marketData.getTopMovers(params),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
};

export const useSymbolSearch = (query, params = {}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const searchQuery = useQuery({
    queryKey: [QUERY_KEYS.search, query, params],
    queryFn: () => apiEndpoints.marketData.search(query, params),
    enabled: query && query.length >= 2, // Minimum 2 characters
    staleTime: 600000, // 10 minutes (search results don't change often)
  });

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query && query.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchQuery.refetch().finally(() => setIsSearching(false));
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchQuery]);

  useEffect(() => {
    setSearchResults(searchQuery.data?.data || []);
  }, [searchQuery.data]);

  return {
    ...searchQuery,
    searchResults,
    isSearching: isSearching || searchQuery.isFetching,
    clearSearch: () => {
      setSearchResults([]);
      setIsSearching(false);
    },
  };
};

export const useHistoricalData = (symbol, params = {}) => {
  const [timeframe, setTimeframe] = useState(params.timeframe || "1M"); // 1M, 3M, 6M, 1Y, 5Y
  const [interval, setInterval] = useState(params.interval || "1d"); // 1m, 5m, 15m, 1h, 1d

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.historical,
      symbol,
      { ...params, timeframe, interval },
    ],
    queryFn: () =>
      apiEndpoints.marketData.getHistorical(symbol, {
        ...params,
        timeframe,
        interval,
      }),
    enabled: !!symbol,
    staleTime: 300000, // 5 minutes for historical data
    keepPreviousData: true, // Keep previous data while loading new timeframe
  });

  // Process historical data for charts
  const chartData = useMemo(() => {
    const rawData = query.data?.data?.prices || [];

    return {
      labels: rawData.map((item) =>
        new Date(item.timestamp).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Price",
          data: rawData.map((item) => item.close),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
        },
      ],
      ohlc: rawData.map((item) => ({
        x: new Date(item.timestamp),
        o: item.open,
        h: item.high,
        l: item.low,
        c: item.close,
        v: item.volume,
      })),
    };
  }, [query.data]);

  return {
    ...query,
    chartData,
    timeframe,
    setTimeframe,
    interval,
    setInterval,
    prices: query.data?.data?.prices || [],
    statistics: query.data?.data?.statistics || {},
  };
};

export const useSymbolsBySector = (sector, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.sectors, sector, params],
    queryFn: () => apiEndpoints.marketData.getBySector(sector, params),
    enabled: !!sector,
    staleTime: 600000, // 10 minutes
  });
};

export const useActiveSymbols = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.active, params],
    queryFn: () => apiEndpoints.marketData.getActive(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useMarketDataUpdates = () => {
  const queryClient = useQueryClient();

  const updateSymbolData = useMutation({
    mutationFn: ({ symbol, data }) =>
      apiEndpoints.marketData.update(symbol, data),
    onSuccess: (updatedData, { symbol }) => {
      // Update individual symbol cache
      queryClient.setQueryData([QUERY_KEYS.symbol, symbol], updatedData);

      // Update batch caches that might contain this symbol
      queryClient.invalidateQueries([QUERY_KEYS.batch]);
      queryClient.invalidateQueries([QUERY_KEYS.summary]);
      queryClient.invalidateQueries([QUERY_KEYS.movers]);
    },
  });

  const bulkUpdateData = useMutation({
    mutationFn: (updates) => apiEndpoints.marketData.bulkUpdate(updates),
    onSuccess: () => {
      // Invalidate all market data caches
      queryClient.invalidateQueries([QUERY_KEYS.marketData]);
    },
  });

  return {
    updateSymbolData,
    bulkUpdateData,
  };
};

export const useMarketDataAnalytics = (symbols = []) => {
  const { data: batchData } = useBatchMarketData(symbols);

  const [analytics, setAnalytics] = useState({
    totalMarketCap: 0,
    averageChange: 0,
    volatilityIndex: 0,
    sectorsBreakdown: {},
    topGainers: [],
    topLosers: [],
    mostActive: [],
    marketSentiment: "neutral", // bullish, bearish, neutral
  });

  useEffect(() => {
    if (batchData && batchData.length > 0) {
      const totalMarketCap = batchData.reduce(
        (sum, symbol) => sum + (symbol.marketCap || 0),
        0
      );

      const totalChange = batchData.reduce(
        (sum, symbol) => sum + (symbol.changePercent || 0),
        0
      );
      const averageChange = totalChange / batchData.length;

      // Calculate volatility (standard deviation of changes)
      const variance =
        batchData.reduce(
          (sum, symbol) =>
            sum + Math.pow((symbol.changePercent || 0) - averageChange, 2),
          0
        ) / batchData.length;
      const volatilityIndex = Math.sqrt(variance);

      // Sector breakdown
      const sectorsBreakdown = batchData.reduce((sectors, symbol) => {
        const sector = symbol.sector || "Unknown";
        if (!sectors[sector]) {
          sectors[sector] = { count: 0, totalChange: 0, marketCap: 0 };
        }
        sectors[sector].count++;
        sectors[sector].totalChange += symbol.changePercent || 0;
        sectors[sector].marketCap += symbol.marketCap || 0;
        return sectors;
      }, {});

      // Top gainers/losers
      const sortedByChange = [...batchData].sort(
        (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
      );
      const topGainers = sortedByChange.slice(0, 5);
      const topLosers = sortedByChange.slice(-5).reverse();

      // Most active by volume
      const mostActive = [...batchData]
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 5);

      // Market sentiment
      const bullishCount = batchData.filter(
        (s) => (s.changePercent || 0) > 0
      ).length;
      const bearishCount = batchData.filter(
        (s) => (s.changePercent || 0) < 0
      ).length;
      const neutralCount = batchData.length - bullishCount - bearishCount;

      let marketSentiment = "neutral";
      if (bullishCount > bearishCount + neutralCount)
        marketSentiment = "bullish";
      else if (bearishCount > bullishCount + neutralCount)
        marketSentiment = "bearish";

      setAnalytics({
        totalMarketCap,
        averageChange,
        volatilityIndex,
        sectorsBreakdown,
        topGainers,
        topLosers,
        mostActive,
        marketSentiment,
      });
    }
  }, [batchData]);

  return analytics;
};

export const useMarketDataSubscription = (symbols = [], options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!symbols || symbols.length === 0) return;

    // Mock WebSocket connection (replace with actual WebSocket implementation)
    console.log("Connecting to market data feed for symbols:", symbols);
    setIsConnected(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const mockUpdate = {
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        price: Math.random() * 1000,
        change: (Math.random() - 0.5) * 10,
        timestamp: new Date().toISOString(),
      };

      // Update cache with new data
      queryClient.setQueryData(
        [QUERY_KEYS.symbol, mockUpdate.symbol],
        (oldData) => ({
          ...oldData,
          data: {
            ...oldData?.data,
            currentPrice: mockUpdate.price,
            change: mockUpdate.change,
            lastUpdated: mockUpdate.timestamp,
          },
        })
      );

      setLastUpdate(mockUpdate);
    }, options.updateInterval || 5000);

    wsRef.current = interval;

    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current);
      }
    };
  }, [symbols, queryClient, options.updateInterval]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      clearInterval(wsRef.current);
      wsRef.current = null;
    }
    setIsConnected(false);
    console.log("Disconnected from market data feed");
  }, []);

  useEffect(() => {
    if (options.autoConnect && symbols.length > 0) {
      return connect();
    }
  }, [symbols, connect, options.autoConnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
  };
};

export const useMarketDataFilters = () => {
  const [filters, setFilters] = useState({
    sector: "all",
    marketCap: "all", // small, mid, large, all
    priceRange: { min: null, max: null },
    volumeThreshold: null,
    changeThreshold: null,
    sortBy: "marketCap", // marketCap, volume, change, name
    sortOrder: "desc",
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sector: "all",
      marketCap: "all",
      priceRange: { min: null, max: null },
      volumeThreshold: null,
      changeThreshold: null,
      sortBy: "marketCap",
      sortOrder: "desc",
    });
  }, []);

  const applyFilters = useCallback(
    (data) => {
      if (!data || !Array.isArray(data)) return [];

      let filtered = [...data];

      // Sector filter
      if (filters.sector !== "all") {
        filtered = filtered.filter((item) => item.sector === filters.sector);
      }

      // Market cap filter
      if (filters.marketCap !== "all") {
        filtered = filtered.filter((item) => {
          const marketCap = item.marketCap || 0;
          switch (filters.marketCap) {
            case "small":
              return marketCap < 2000000000; // < 2B
            case "mid":
              return marketCap >= 2000000000 && marketCap < 10000000000; // 2B-10B
            case "large":
              return marketCap >= 10000000000; // > 10B
            default:
              return true;
          }
        });
      }

      // Price range filter
      if (filters.priceRange.min !== null) {
        filtered = filtered.filter(
          (item) => (item.currentPrice || 0) >= filters.priceRange.min
        );
      }
      if (filters.priceRange.max !== null) {
        filtered = filtered.filter(
          (item) => (item.currentPrice || 0) <= filters.priceRange.max
        );
      }

      // Volume threshold
      if (filters.volumeThreshold !== null) {
        filtered = filtered.filter(
          (item) => (item.volume || 0) >= filters.volumeThreshold
        );
      }

      // Change threshold
      if (filters.changeThreshold !== null) {
        filtered = filtered.filter(
          (item) => Math.abs(item.changePercent || 0) >= filters.changeThreshold
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy] || 0;
        const bValue = b[filters.sortBy] || 0;

        if (filters.sortOrder === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });

      return filtered;
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    applyFilters,
  };
};

export default useMarketData;
