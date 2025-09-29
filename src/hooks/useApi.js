/**
 * Custom React Hook do zarządzania API calls
 * Obsługuje wszystkie nowe endpoints z rozszerzonego backendu
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints, apiHelpers } from "../lib/api-extended";

// Hook do obsługi API loading states
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
  };
};

// ====================================================================
// 🔔 NOTIFICATIONS HOOKS
// ====================================================================

export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => apiEndpoints.notifications.getAll(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useNotification = (id) => {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: () => apiEndpoints.notifications.getById(id),
    enabled: !!id,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.markMultipleAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.notifications.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

export const useUnreadNotifications = (params = {}) => {
  return useQuery({
    queryKey: ["notifications", "unread", params],
    queryFn: () => apiEndpoints.notifications.getUnread(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// ====================================================================
// 📊 WATCHLISTS HOOKS
// ====================================================================

export const useWatchlists = (params = {}) => {
  return useQuery({
    queryKey: ["watchlists", params],
    queryFn: () => apiEndpoints.watchlists.getAll(params),
  });
};

export const useWatchlist = (id) => {
  return useQuery({
    queryKey: ["watchlist", id],
    queryFn: () => apiEndpoints.watchlists.getById(id),
    enabled: !!id,
  });
};

export const useCreateWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.watchlists.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["watchlists"]);
    },
  });
};

export const useUpdateWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiEndpoints.watchlists.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["watchlist", id]);
      queryClient.invalidateQueries(["watchlists"]);
    },
  });
};

export const useDeleteWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.watchlists.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["watchlists"]);
    },
  });
};

export const useAddSymbolToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, symbolData }) =>
      apiEndpoints.watchlists.addSymbol(id, symbolData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["watchlist", id]);
    },
  });
};

export const useRemoveSymbolFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, symbol }) =>
      apiEndpoints.watchlists.removeSymbol(id, symbol),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["watchlist", id]);
    },
  });
};

export const useAddPriceAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, symbol, alertData }) =>
      apiEndpoints.watchlists.addPriceAlert(id, symbol, alertData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["watchlist", id]);
    },
  });
};

export const usePublicWatchlists = (params = {}) => {
  return useQuery({
    queryKey: ["watchlists", "public", params],
    queryFn: () => apiEndpoints.watchlists.getPublic(params),
  });
};

export const useWatchlistStatistics = () => {
  return useQuery({
    queryKey: ["watchlists", "statistics"],
    queryFn: () => apiEndpoints.watchlists.getStatistics(),
    staleTime: 300000, // 5 minutes
  });
};

// ====================================================================
// 💹 MARKET DATA HOOKS
// ====================================================================

export const useMarketData = (symbol) => {
  return useQuery({
    queryKey: ["marketData", symbol],
    queryFn: () => apiEndpoints.marketData.getSymbol(symbol),
    enabled: !!symbol,
    staleTime: 60000, // 1 minute
  });
};

export const useBatchMarketData = (symbols) => {
  return useQuery({
    queryKey: ["marketData", "batch", symbols],
    queryFn: () => apiEndpoints.marketData.getBatch(symbols),
    enabled: symbols && symbols.length > 0,
    staleTime: 60000, // 1 minute
  });
};

export const useActiveSymbols = (params = {}) => {
  return useQuery({
    queryKey: ["marketData", "active", params],
    queryFn: () => apiEndpoints.marketData.getActive(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useMarketSummary = (params = {}) => {
  return useQuery({
    queryKey: ["marketData", "summary", params],
    queryFn: () => apiEndpoints.marketData.getSummary(params),
    staleTime: 60000, // 1 minute
  });
};

export const useTopMovers = (params = {}) => {
  return useQuery({
    queryKey: ["marketData", "movers", params],
    queryFn: () => apiEndpoints.marketData.getTopMovers(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useSymbolSearch = (query, params = {}) => {
  return useQuery({
    queryKey: ["marketData", "search", query, params],
    queryFn: () => apiEndpoints.marketData.search(query, params),
    enabled: query && query.length > 0,
    staleTime: 300000, // 5 minutes
  });
};

export const useHistoricalData = (symbol, params = {}) => {
  return useQuery({
    queryKey: ["marketData", "historical", symbol, params],
    queryFn: () => apiEndpoints.marketData.getHistorical(symbol, params),
    enabled: !!symbol,
    staleTime: 300000, // 5 minutes
  });
};

export const useSymbolsBySector = (sector, params = {}) => {
  return useQuery({
    queryKey: ["marketData", "sector", sector, params],
    queryFn: () => apiEndpoints.marketData.getBySector(sector, params),
    enabled: !!sector,
    staleTime: 300000, // 5 minutes
  });
};

export const useUpdateMarketData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, data }) =>
      apiEndpoints.marketData.update(symbol, data),
    onSuccess: (_, { symbol }) => {
      queryClient.invalidateQueries(["marketData", symbol]);
      queryClient.invalidateQueries(["marketData", "summary"]);
    },
  });
};

// ====================================================================
// 📄 REPORTS HOOKS
// ====================================================================

export const useReports = (params = {}) => {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => apiEndpoints.reports.getAll(params),
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => apiEndpoints.reports.getById(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useCreateTaxReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.createTax,
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useDownloadReport = () => {
  const [downloading, setDownloading] = useState(false);

  const downloadReport = useCallback(async (id, filename) => {
    try {
      setDownloading(true);
      const response = await apiEndpoints.reports.download(id);

      // Create blob and download
      const blob = new Blob([response], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error("Download error:", error);
      return { success: false, error: apiHelpers.formatError(error) };
    } finally {
      setDownloading(false);
    }
  }, []);

  return { downloadReport, downloading };
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ["reports", "scheduled"],
    queryFn: () => apiEndpoints.reports.getScheduled(),
    staleTime: 300000, // 5 minutes
  });
};

// ====================================================================
// 🔒 AUDIT LOGS HOOKS
// ====================================================================

export const useAuditLogs = (params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => apiEndpoints.auditLogs.getAll(params),
  });
};

export const useUserActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "user", userId, params],
    queryFn: () => apiEndpoints.auditLogs.getUserActivity(userId, params),
    enabled: !!userId,
  });
};

export const useSystemActivity = (params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "system", params],
    queryFn: () => apiEndpoints.auditLogs.getSystemActivity(params),
    staleTime: 60000, // 1 minute
  });
};

export const useSuspiciousActivities = (params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "suspicious", params],
    queryFn: () => apiEndpoints.auditLogs.getSuspicious(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useFailedLogins = (params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "failedLogins", params],
    queryFn: () => apiEndpoints.auditLogs.getFailedLogins(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useLogsByIP = (ipAddress, params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "ip", ipAddress, params],
    queryFn: () => apiEndpoints.auditLogs.getByIP(ipAddress, params),
    enabled: !!ipAddress,
  });
};

export const useDetectUnusualActivity = (userId, params = {}) => {
  return useQuery({
    queryKey: ["auditLogs", "unusual", userId, params],
    queryFn: () => apiEndpoints.auditLogs.detectUnusual(userId, params),
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  });
};

export const useExportComplianceLogs = () => {
  const [exporting, setExporting] = useState(false);

  const exportLogs = useCallback(async (data) => {
    try {
      setExporting(true);
      const response = await apiEndpoints.auditLogs.exportCompliance(data);
      return { success: true, data: response };
    } catch (error) {
      console.error("Export error:", error);
      return { success: false, error: apiHelpers.formatError(error) };
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportLogs, exporting };
};

// ====================================================================
// 🔄 EXISTING HOOKS - ENHANCED (for cash operations etc)
// ====================================================================

export const useCashOperations = (params = {}) => {
  return useQuery({
    queryKey: ["cashOperations", params],
    queryFn: () => apiEndpoints.cashOperations.getAll(params),
  });
};

export const useCashBalance = (params = {}) => {
  return useQuery({
    queryKey: ["cashOperations", "balance", params],
    queryFn: () => apiEndpoints.cashOperations.getBalance(params),
    staleTime: 60000, // 1 minute
  });
};

export const useCashFlow = (params = {}) => {
  return useQuery({
    queryKey: ["cashOperations", "cashFlow", params],
    queryFn: () => apiEndpoints.cashOperations.getCashFlow(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useMonthlyCashSummary = (year, month) => {
  return useQuery({
    queryKey: ["cashOperations", "monthly", year, month],
    queryFn: () => apiEndpoints.cashOperations.getMonthlySummary(year, month),
    enabled: !!(year && month),
    staleTime: 3600000, // 1 hour
  });
};

export const useCreateCashOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.cashOperations.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["cashOperations"]);
      queryClient.invalidateQueries(["cashOperations", "balance"]);
    },
  });
};

// ====================================================================
// 🏥 SYSTEM HEALTH HOOKS
// ====================================================================

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: () => apiEndpoints.system.getHealth(),
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  });
};

export const useServiceHealth = () => {
  return useQuery({
    queryKey: ["system", "services"],
    queryFn: async () => {
      const services = await Promise.allSettled([
        apiEndpoints.system.checkNotifications(),
        apiEndpoints.system.checkWatchlists(),
        apiEndpoints.system.checkMarketData(),
        apiEndpoints.system.checkReports(),
        apiEndpoints.system.checkAuditLogs(),
        apiEndpoints.system.checkCashOperations(),
      ]);

      return services.map((service, index) => ({
        name: [
          "notifications",
          "watchlists",
          "marketData",
          "reports",
          "auditLogs",
          "cashOperations",
        ][index],
        status: service.status === "fulfilled" ? "healthy" : "unhealthy",
        data: service.status === "fulfilled" ? service.value : service.reason,
      }));
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
  });
};

// ====================================================================
// 🔍 ENHANCED SEARCH HOOKS
// ====================================================================

export const useGlobalSearch = (query, params = {}) => {
  return useQuery({
    queryKey: ["search", "global", query, params],
    queryFn: () => apiEndpoints.search.global(query, params),
    enabled: query && query.length > 2,
    staleTime: 300000, // 5 minutes
  });
};

// ====================================================================
// 💡 HELPER HOOKS
// ====================================================================

// Hook for handling API errors consistently
export const useApiError = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error("API Error:", error);

    if (apiHelpers.isAuthError(error)) {
      // Handle auth errors
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    setError(apiHelpers.formatError(error));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    error,
    handleError,
    clearError,
    isAuthError: apiHelpers.isAuthError,
  };
};

// Hook for optimistic updates
export const useOptimisticUpdate = (queryKey) => {
  const queryClient = useQueryClient();

  const updateOptimistically = useCallback(
    (updateFn) => {
      queryClient.setQueryData(queryKey, updateFn);
    },
    [queryClient, queryKey]
  );

  const revert = useCallback(() => {
    queryClient.invalidateQueries(queryKey);
  }, [queryClient, queryKey]);

  return { updateOptimistically, revert };
};

// Hook for real-time updates (can be extended with WebSocket later)
export const useRealTimeUpdates = (queryKeys, interval = 30000) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const intervalId = setInterval(() => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries(queryKey);
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [queryClient, queryKeys, interval]);
};
