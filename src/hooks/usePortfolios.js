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
