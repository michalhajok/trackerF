/**
 * Positions Query Hooks
 * React Query hooks for positions data
 */

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";

// Get all positions with optional filters
export function usePositions(params = {}) {
  return useQuery({
    queryKey: ["positions", params],
    queryFn: () => apiEndpoints.positions.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get a single position by ID
export function usePosition(id) {
  return useQuery({
    queryKey: ["position", id],
    queryFn: () => apiEndpoints.positions.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get open positions
export function useOpenPositions(params = {}) {
  return useQuery({
    queryKey: ["positions", { status: "open", ...params }],
    queryFn: () => apiEndpoints.positions.getAll({ status: "open", ...params }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get closed positions
export function useClosedPositions(params = {}) {
  return useQuery({
    queryKey: ["positions", { status: "closed", ...params }],
    queryFn: () =>
      apiEndpoints.positions.getAll({ status: "closed", ...params }),
    staleTime: 1000 * 60 * 5, // 5 minutes - closed positions change less frequently
  });
}

// Get positions summary/statistics
export function usePositionsSummary(params = {}) {
  return useQuery({
    queryKey: ["positions-summary", params],
    queryFn: () => apiEndpoints.positions.getSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get position performance data
export function usePositionPerformance(id, params = {}) {
  return useQuery({
    queryKey: ["position-performance", id, params],
    queryFn: () => apiEndpoints.positions.getPerformance(id, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
