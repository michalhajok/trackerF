"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

/**
 * Query hook for fetching pending orders
 */
export function useOrders(filters = {}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => api.orders.getAll(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes (orders change frequently)
  });
}

/**
 * Query hook for fetching pending orders only
 */
export function usePendingOrders() {
  return useOrders({ status: "pending" });
}

/**
 * Query hook for fetching executed orders
 */
export function useExecutedOrders() {
  return useOrders({ status: "executed" });
}

/**
 * Query hook for fetching cancelled orders
 */
export function useCancelledOrders() {
  return useOrders({ status: "cancelled" });
}

/**
 * Query hook for fetching a single order
 */
export function useOrder(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.orders.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orderData) => api.orders.create(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });

      const typeMap = {
        buy: "Zlecenie kupna zostało utworzone",
        sell: "Zlecenie sprzedaży zostało utworzone",
      };

      toast.success(typeMap[data.data.type] || "Zlecenie zostało utworzone");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas tworzenia zlecenia"
      );
    },
  });
}

/**
 * Mutation hook for updating an order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.orders.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      toast.success("Zlecenie zostało zaktualizowane");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas aktualizacji zlecenia"
      );
    },
  });
}

/**
 * Mutation hook for executing an order
 */
export function useExecuteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, executionData }) =>
      api.orders.execute(id, executionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["positions"] }); // May create new position
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      toast.success("Zlecenie zostało zrealizowane");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas realizacji zlecenia"
      );
    },
  });
}

/**
 * Mutation hook for cancelling an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => api.orders.cancel(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables] });
      toast.success("Zlecenie zostało anulowane");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas anulowania zlecenia"
      );
    },
  });
}

/**
 * Mutation hook for deleting an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => api.orders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Zlecenie zostało usunięte");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas usuwania zlecenia"
      );
    },
  });
}

/**
 * Hook for order statistics
 */
export function useOrderStats() {
  return useQuery({
    queryKey: ["orders", "stats"],
    queryFn: () => api.orders.getStats(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useOrders;
