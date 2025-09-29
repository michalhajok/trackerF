"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Hook for dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.analytics.getDashboardStats(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Hook for portfolio performance over time
 */
export function usePortfolioPerformance(period = "1y") {
  return useQuery({
    queryKey: ["analytics", "portfolio-performance", period],
    queryFn: () => api.analytics.getPortfolioPerformance(period),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for portfolio allocation (pie chart data)
 */
export function usePortfolioAllocation() {
  return useQuery({
    queryKey: ["analytics", "portfolio-allocation"],
    queryFn: () => api.analytics.getPortfolioAllocation(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for P&L analysis over time
 */
export function useProfitLossAnalysis(period = "1y") {
  return useQuery({
    queryKey: ["analytics", "pnl-analysis", period],
    queryFn: () => api.analytics.getProfitLossAnalysis(period),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook for monthly performance breakdown
 */
export function useMonthlyPerformance(year) {
  return useQuery({
    queryKey: ["analytics", "monthly-performance", year],
    queryFn: () => api.analytics.getMonthlyPerformance(year),
    select: (data) => data.data,
    enabled: !!year,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook for sector allocation analysis
 */
export function useSectorAllocation() {
  return useQuery({
    queryKey: ["analytics", "sector-allocation"],
    queryFn: () => api.analytics.getSectorAllocation(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook for top performing positions
 */
export function useTopPerformers(limit = 5) {
  return useQuery({
    queryKey: ["analytics", "top-performers", limit],
    queryFn: () => api.analytics.getTopPerformers(limit),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for worst performing positions
 */
export function useWorstPerformers(limit = 5) {
  return useQuery({
    queryKey: ["analytics", "worst-performers", limit],
    queryFn: () => api.analytics.getWorstPerformers(limit),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for recent activity feed
 */
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["analytics", "recent-activity", limit],
    queryFn: () => api.analytics.getRecentActivity(limit),
    select: (data) => data.data,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}

/**
 * Hook for dividend tracking
 */
export function useDividendStats(period = "1y") {
  return useQuery({
    queryKey: ["analytics", "dividend-stats", period],
    queryFn: () => api.analytics.getDividendStats(period),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook for risk metrics
 */
export function useRiskMetrics() {
  return useQuery({
    queryKey: ["analytics", "risk-metrics"],
    queryFn: () => api.analytics.getRiskMetrics(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook for comparing periods
 */
export function usePeriodComparison(currentPeriod, previousPeriod) {
  return useQuery({
    queryKey: ["analytics", "period-comparison", currentPeriod, previousPeriod],
    queryFn: () => api.analytics.comparePeriods(currentPeriod, previousPeriod),
    select: (data) => data.data,
    enabled: !!(currentPeriod && previousPeriod),
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
}

export default useDashboardStats;
