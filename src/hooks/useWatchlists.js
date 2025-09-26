/**
 * useWatchlists.js - Dedicated hook for watchlists management
 * Handles all watchlist-related operations with market data integration
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const QUERY_KEYS = {
  watchlists: "watchlists",
  watchlist: "watchlist",
  public: "watchlists-public",
  statistics: "watchlists-statistics",
  symbols: "watchlist-symbols",
  alerts: "price-alerts",
};

export const useWatchlists = (params = {}) => {
  const [filters, setFilters] = useState({
    sortBy: "recent", // recent, name, symbols, performance
    filterBy: "all", // all, favorites, public, private
    search: "",
    ...params,
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.watchlists, filters],
    queryFn: () => apiEndpoints.watchlists.getAll(filters),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: "recent",
      filterBy: "all",
      search: "",
    });
  }, []);

  // Process and enrich watchlists data
  const enrichedWatchlists = useMemo(() => {
    const watchlists = query.data?.data || [];

    return watchlists.map((watchlist) => ({
      ...watchlist,
      symbolCount: watchlist.symbols?.length || 0,
      alertCount:
        watchlist.symbols?.reduce(
          (count, symbol) =>
            count +
            (symbol.priceAlerts?.filter((alert) => alert.isActive)?.length ||
              0),
          0
        ) || 0,
      totalValue:
        watchlist.symbols?.reduce(
          (total, symbol) =>
            total + (symbol.currentPrice || 0) * (symbol.quantity || 1),
          0
        ) || 0,
      totalChange:
        watchlist.symbols?.reduce(
          (total, symbol) => total + (symbol.dayChange || 0),
          0
        ) || 0,
      performance: watchlist.performance || 0, // This would come from backend calculation
      lastActivity: watchlist.lastUpdated || watchlist.createdAt,
    }));
  }, [query.data]);

  return {
    ...query,
    filters,
    updateFilters,
    clearFilters,
    watchlists: enrichedWatchlists,
    totalCount: query.data?.pagination?.totalCount || enrichedWatchlists.length,
  };
};

export const useWatchlist = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.watchlist, id],
    queryFn: () => apiEndpoints.watchlists.getById(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute for live data
  });
};

export const usePublicWatchlists = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.public, params],
    queryFn: () => apiEndpoints.watchlists.getPublic(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useWatchlistStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.statistics],
    queryFn: () => apiEndpoints.watchlists.getStatistics(),
    staleTime: 600000, // 10 minutes
  });
};

export const useCreateWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.watchlists.create,
    onSuccess: (newWatchlist) => {
      // Add to cache optimistically
      queryClient.setQueryData([QUERY_KEYS.watchlists], (oldData) => {
        if (!oldData) return { data: [newWatchlist.data] };
        return {
          ...oldData,
          data: [newWatchlist.data, ...(oldData.data || [])],
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
      queryClient.invalidateQueries([QUERY_KEYS.statistics]);
    },
  });
};

export const useUpdateWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiEndpoints.watchlists.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries([QUERY_KEYS.watchlists]);
      await queryClient.cancelQueries([QUERY_KEYS.watchlist, id]);

      const previousWatchlists = queryClient.getQueryData([
        QUERY_KEYS.watchlists,
      ]);
      const previousWatchlist = queryClient.getQueryData([
        QUERY_KEYS.watchlist,
        id,
      ]);

      // Update in list
      queryClient.setQueryData([QUERY_KEYS.watchlists], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data:
            oldData.data?.map((watchlist) =>
              watchlist._id === id ? { ...watchlist, ...data } : watchlist
            ) || [],
        };
      });

      // Update single watchlist
      queryClient.setQueryData([QUERY_KEYS.watchlist, id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: { ...oldData.data, ...data },
        };
      });

      return { previousWatchlists, previousWatchlist };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousWatchlists) {
        queryClient.setQueryData(
          [QUERY_KEYS.watchlists],
          context.previousWatchlists
        );
      }
      if (context?.previousWatchlist) {
        queryClient.setQueryData(
          [QUERY_KEYS.watchlist, id],
          context.previousWatchlist
        );
      }
    },
    onSettled: ({ id }) => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
      queryClient.invalidateQueries([QUERY_KEYS.watchlist, id]);
    },
  });
};

export const useDeleteWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.watchlists.delete,
    onMutate: async (watchlistId) => {
      await queryClient.cancelQueries([QUERY_KEYS.watchlists]);

      const previousData = queryClient.getQueryData([QUERY_KEYS.watchlists]);

      queryClient.setQueryData([QUERY_KEYS.watchlists], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.filter((w) => w._id !== watchlistId) || [],
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEYS.watchlists], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
      queryClient.invalidateQueries([QUERY_KEYS.statistics]);
    },
  });
};

export const useAddSymbolToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, symbolData }) =>
      apiEndpoints.watchlists.addSymbol(watchlistId, symbolData),
    onSuccess: (_, { watchlistId }) => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlist, watchlistId]);
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });
};

export const useRemoveSymbolFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ watchlistId, symbol }) =>
      apiEndpoints.watchlists.removeSymbol(watchlistId, symbol),
    onSuccess: (_, { watchlistId }) => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlist, watchlistId]);
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });
};

export const useWatchlistPerformance = (watchlistId) => {
  const { data: watchlistData } = useWatchlist(watchlistId);

  const [performance, setPerformance] = useState({
    totalValue: 0,
    totalChange: 0,
    changePercent: 0,
    topPerformers: [],
    bottomPerformers: [],
    sectorBreakdown: {},
  });

  useEffect(() => {
    if (watchlistData?.data?.symbols) {
      const symbols = watchlistData.data.symbols;

      const totalValue = symbols.reduce(
        (sum, symbol) =>
          sum + (symbol.currentPrice || 0) * (symbol.quantity || 1),
        0
      );

      const totalChange = symbols.reduce(
        (sum, symbol) => sum + (symbol.dayChange || 0),
        0
      );

      const changePercent =
        totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

      // Sort by performance
      const sortedSymbols = [...symbols].sort(
        (a, b) => (b.dayChangePercent || 0) - (a.dayChangePercent || 0)
      );

      const topPerformers = sortedSymbols.slice(0, 3);
      const bottomPerformers = sortedSymbols.slice(-3).reverse();

      // Sector breakdown
      const sectorBreakdown = symbols.reduce((sectors, symbol) => {
        const sector = symbol.sector || "Unknown";
        if (!sectors[sector]) {
          sectors[sector] = { count: 0, value: 0, change: 0 };
        }
        sectors[sector].count++;
        sectors[sector].value +=
          (symbol.currentPrice || 0) * (symbol.quantity || 1);
        sectors[sector].change += symbol.dayChange || 0;
        return sectors;
      }, {});

      setPerformance({
        totalValue,
        totalChange,
        changePercent,
        topPerformers,
        bottomPerformers,
        sectorBreakdown,
      });
    }
  }, [watchlistData]);

  return performance;
};

export const useWatchlistActions = () => {
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: ({ watchlistId, isFavorite }) =>
      apiEndpoints.watchlists.update(watchlistId, { isFavorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ watchlistId, isPublic }) =>
      apiEndpoints.watchlists.update(watchlistId, { isPublic: !isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
      queryClient.invalidateQueries([QUERY_KEYS.public]);
    },
  });

  const updateColor = useMutation({
    mutationFn: ({ watchlistId, color }) =>
      apiEndpoints.watchlists.update(watchlistId, { color }),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });

  const updateIcon = useMutation({
    mutationFn: ({ watchlistId, icon }) =>
      apiEndpoints.watchlists.update(watchlistId, { icon }),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });

  return {
    toggleFavorite,
    toggleVisibility,
    updateColor,
    updateIcon,
  };
};

export const useBulkWatchlistOperations = () => {
  const queryClient = useQueryClient();

  const addSymbolsToMultipleWatchlists = useMutation({
    mutationFn: async ({ watchlistIds, symbols }) => {
      const promises = watchlistIds.map((watchlistId) =>
        Promise.all(
          symbols.map((symbol) =>
            apiEndpoints.watchlists.addSymbol(watchlistId, symbol)
          )
        )
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
    },
  });

  const deleteMultipleWatchlists = useMutation({
    mutationFn: async (watchlistIds) => {
      const promises = watchlistIds
        .filter((id) => id) // Filter out null/undefined
        .map((id) => apiEndpoints.watchlists.delete(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.watchlists]);
      queryClient.invalidateQueries([QUERY_KEYS.statistics]);
    },
  });

  return {
    addSymbolsToMultipleWatchlists,
    deleteMultipleWatchlists,
  };
};

export const useWatchlistSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { watchlists } = useWatchlists();

  const searchWatchlists = useCallback(
    async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const filtered = watchlists.filter(
          (watchlist) =>
            watchlist.name.toLowerCase().includes(term.toLowerCase()) ||
            watchlist.description?.toLowerCase().includes(term.toLowerCase()) ||
            watchlist.symbols?.some(
              (symbol) =>
                symbol.symbol.toLowerCase().includes(term.toLowerCase()) ||
                symbol.companyName?.toLowerCase().includes(term.toLowerCase())
            )
        );

        setSearchResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [watchlists]
  );

  useEffect(() => {
    const debounced = setTimeout(() => {
      searchWatchlists(searchTerm);
    }, 300);

    return () => clearTimeout(debounced);
  }, [searchTerm, searchWatchlists]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    clearSearch: () => {
      setSearchTerm("");
      setSearchResults([]);
    },
  };
};

export default useWatchlists;
