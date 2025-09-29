/**
 * Analytics Query Hooks
 * React Query hooks for analytics data
 */

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";

// Get portfolio performance chart data
export function usePortfolioChart(params = {}) {
  return useQuery({
    queryKey: ["portfolio-chart", params],
    queryFn: () => apiEndpoints.analytics.getPortfolioChart(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!params,
  });
}

// Get portfolio allocation data
export function usePortfolioAllocation(params = {}) {
  return useQuery({
    queryKey: ["portfolio-allocation", params],
    queryFn: () => apiEndpoints.analytics.getAllocation(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get performance statistics
export function usePerformanceStats(params = {}) {
  return useQuery({
    queryKey: ["performance-stats", params],
    queryFn: () => apiEndpoints.analytics.getPerformanceStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get stats summary
export function useStatsSummary(params = {}) {
  return useQuery({
    queryKey: ["stats-summary", params],
    queryFn: () => apiEndpoints.analytics.getStatsSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get portfolio metrics
export function usePortfolioMetrics(period = "1Y") {
  return useQuery({
    queryKey: ["portfolio-metrics", period],
    queryFn: () => apiEndpoints.analytics.getMetrics({ period }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get risk analysis
export function useRiskAnalysis(params = {}) {
  return useQuery({
    queryKey: ["risk-analysis", params],
    queryFn: () => apiEndpoints.analytics.getRiskAnalysis(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
