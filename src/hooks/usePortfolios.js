"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const res = await api.get("/portfolios");
      return res.data.portfolios;
    },
    keepPreviousData: true,
  });
}

export function usePortfolioStats() {
  return useQuery({
    queryKey: ["portfolioStats"],
    queryFn: async () => {
      const res = await api.get("/portfolios/stats");
      // Zakładamy, że backend zwraca { success: true, data: { … } }
      return (
        res.data?.data || {
          totalPortfolios: 0,
          totalValue: 0,
          totalPL: 0,
          totalOpenPositions: 0,
          totalClosedPositions: 0,
          brokerStats: {},
          totalPLPercent: 0,
        }
      );
    },
    // Opcjonalnie, możesz ustawić placeholderData:
    placeholderData: {
      totalPortfolios: 0,
      totalValue: 0,
      totalPL: 0,
      totalOpenPositions: 0,
      totalClosedPositions: 0,
      brokerStats: {},
      totalPLPercent: 0,
    },
  });
}

export function useCreatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post("/portfolios", data).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}

export function useUpdatePortfolio(portfolioId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.put(`/portfolios/${portfolioId}`, data).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}

export function useDeletePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/portfolios/${id}`).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}

export function useSyncPortfolio(portfolioId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post(`/portfolios/${portfolioId}/sync`).then((res) => res.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}

export function usePositions(portfolioId, params = {}) {
  return useQuery({
    queryKey: ["positions", portfolioId, params],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/positions`)
        .then((res) => res.data.positions),
    enabled: !!portfolioId,
    keepPreviousData: true,
  });
}

export function useCashOperations(portfolioId, params = {}) {
  return useQuery({
    queryKey: ["cashOperations", portfolioId, params],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/cash-operations`, { params })
        .then((res) => res.data.operations),
    enabled: !!portfolioId,
    keepPreviousData: true,
  });
}

export function usePendingOrders(portfolioId, params = {}) {
  return useQuery({
    queryKey: ["pendingOrders", portfolioId, params],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/pending-orders`, { params })
        .then((res) => res.data.orders),
    enabled: !!portfolioId,
    keepPreviousData: true,
  });
}
export function useAnalytics(portfolioId, timeRange = "1M") {
  return useQuery({
    queryKey: ["analytics", portfolioId, timeRange],
    enabled: !!portfolioId,
    queryFn: async () => {
      const res = await api.get(`/portfolios/${portfolioId}/analytics`, {
        params: { timeRange },
      });
      // Jeśli backend nie zwróci data, zastąp pustą strukturą
      return res.data || { performance: [], allocation: [], summary: {} };
    },
  });
}

export function useMarketData(portfolioId, params = {}) {
  return useQuery({
    queryKey: ["marketData", portfolioId, params],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/market-data`, { params })
        .then((res) => res.data.quotes),
    enabled: !!portfolioId,
    keepPreviousData: true,
  });
}

export function useWatchlists(portfolioId) {
  return useQuery({
    queryKey: ["watchlists", portfolioId],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/watchlists`)
        .then((res) => res.data.watchlists),
    enabled: !!portfolioId,
    keepPreviousData: true,
  });
}
