/**
 * Cash Operations Query Hooks
 * React Query hooks for cash operations data
 */

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";

// Get all cash operations with optional filters
export function useCashOperations(params = {}) {
  return useQuery({
    queryKey: ["cash-operations", params],
    queryFn: () => apiEndpoints.cashOperations.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get a single cash operation by ID
export function useCashOperation(id) {
  return useQuery({
    queryKey: ["cash-operation", id],
    queryFn: () => apiEndpoints.cashOperations.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get cash operations by type
export function useCashOperationsByType(type, params = {}) {
  return useQuery({
    queryKey: ["cash-operations", { type, ...params }],
    queryFn: () => apiEndpoints.cashOperations.getAll({ type, ...params }),
    enabled: !!type,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Get cash operations summary/statistics
export function useCashOperationsSummary(params = {}) {
  return useQuery({
    queryKey: ["cash-operations-summary", params],
    queryFn: () => apiEndpoints.cashOperations.getSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get cash flow data for charts
export function useCashFlow(params = {}) {
  return useQuery({
    queryKey: ["cash-flow", params],
    queryFn: () => apiEndpoints.cashOperations.getCashFlow(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get account balance history
export function useBalanceHistory(params = {}) {
  return useQuery({
    queryKey: ["balance-history", params],
    queryFn: () => apiEndpoints.cashOperations.getBalanceHistory(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
