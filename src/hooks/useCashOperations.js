"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

/**
 * Query hook for fetching cash operations
 */
export function useCashOperations(filters = {}) {
  return useQuery({
    queryKey: ["cash-operations", filters],
    queryFn: () => api.cashOperations.getAll(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query hook for fetching cash operations by type
 */
export function useCashOperationsByType(type) {
  return useCashOperations({ type });
}

/**
 * Query hook for fetching a single cash operation
 */
export function useCashOperation(id) {
  return useQuery({
    queryKey: ["cash-operation", id],
    queryFn: () => api.cashOperations.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a new cash operation
 */
export function useCreateCashOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (operationData) => api.cashOperations.create(operationData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["cash", "balance"] });

      const typeMap = {
        deposit: "Wpłata została dodana",
        withdrawal: "Wypłata została dodana",
        dividend: "Dywidenda została dodana",
        fee: "Opłata została dodana",
      };

      toast.success(
        typeMap[data.data.type] || "Operacja gotówkowa została utworzona"
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas tworzenia operacji"
      );
    },
  });
}

/**
 * Mutation hook for updating a cash operation
 */
export function useUpdateCashOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.cashOperations.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({
        queryKey: ["cash-operation", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["cash", "balance"] });
      toast.success("Operacja została zaktualizowana");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas aktualizacji operacji"
      );
    },
  });
}

/**
 * Mutation hook for deleting a cash operation
 */
export function useDeleteCashOperation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => api.cashOperations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["cash", "balance"] });
      toast.success("Operacja została usunięta");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Błąd podczas usuwania operacji"
      );
    },
  });
}

/**
 * Hook for cash balance
 */
export function useCashBalance() {
  return useQuery({
    queryKey: ["cash", "balance"],
    queryFn: () => api.cashOperations.getBalance(),
    select: (data) => data.data,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for cash flow statistics
 */
export function useCashFlowStats(period = "1y") {
  return useQuery({
    queryKey: ["cash", "flow-stats", period],
    queryFn: () => api.cashOperations.getFlowStats(period),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for monthly cash flow
 */
export function useMonthlyCashFlow(year) {
  return useQuery({
    queryKey: ["cash", "monthly-flow", year],
    queryFn: () => api.cashOperations.getMonthlyFlow(year),
    select: (data) => data.data,
    enabled: !!year,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export default useCashOperations;
