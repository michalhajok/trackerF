/**
 * Orders Query Hooks
 * React Query hooks for orders data
 */

import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";

// Get all orders with optional filters
export function useOrders(params = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => apiEndpoints.orders.getAll(params),
    staleTime: 1000 * 60 * 1, // 1 minute - orders change frequently
  });
}

// Get a single order by ID
export function useOrder(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiEndpoints.orders.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get pending orders
export function usePendingOrders(params = {}) {
  return useQuery({
    queryKey: ["orders", { status: "pending", ...params }],
    queryFn: () => apiEndpoints.orders.getAll({ status: "pending", ...params }),
    staleTime: 1000 * 30, // 30 seconds - pending orders change very frequently
    refetchInterval: 1000 * 60, // Refetch every minute for pending orders
  });
}

// Get executed orders
export function useExecutedOrders(params = {}) {
  return useQuery({
    queryKey: ["orders", { status: "executed", ...params }],
    queryFn: () =>
      apiEndpoints.orders.getAll({ status: "executed", ...params }),
    staleTime: 1000 * 60 * 5, // 5 minutes - executed orders don't change
  });
}

// Get cancelled orders
export function useCancelledOrders(params = {}) {
  return useQuery({
    queryKey: ["orders", { status: "cancelled", ...params }],
    queryFn: () =>
      apiEndpoints.orders.getAll({ status: "cancelled", ...params }),
    staleTime: 1000 * 60 * 10, // 10 minutes - cancelled orders don't change
  });
}

// Get orders by symbol
export function useOrdersBySymbol(symbol, params = {}) {
  return useQuery({
    queryKey: ["orders", { symbol, ...params }],
    queryFn: () => apiEndpoints.orders.getAll({ symbol, ...params }),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get orders summary/statistics
export function useOrdersSummary(params = {}) {
  return useQuery({
    queryKey: ["orders-summary", params],
    queryFn: () => apiEndpoints.orders.getSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get order history for a specific position
export function usePositionOrderHistory(positionId) {
  return useQuery({
    queryKey: ["position-orders", positionId],
    queryFn: () => apiEndpoints.orders.getByPosition(positionId),
    enabled: !!positionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
