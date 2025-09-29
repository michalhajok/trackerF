/**
 * Cash Operations Mutations
 * React Query mutations for cash operation operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

// Create Cash Operation Mutation
export function useCreateCashOperation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (operationData) =>
      apiEndpoints.cashOperations.create(operationData),
    onSuccess: (data) => {
      // Invalidate and refetch cash operations
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({ queryKey: ["cash-operations-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Cash operation created successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Create cash operation error:", error);
      error(error.message || "Failed to create cash operation");
    },
  });
}

// Update Cash Operation Mutation
export function useUpdateCashOperation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => apiEndpoints.cashOperations.update(id, data),
    onSuccess: (data, variables) => {
      // Update specific operation in cache
      queryClient.setQueryData(["cash-operation", variables.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({ queryKey: ["cash-operations-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Cash operation updated successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Update cash operation error:", error);
      error(error.message || "Failed to update cash operation");
    },
  });
}

// Delete Cash Operation Mutation
export function useDeleteCashOperation() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => apiEndpoints.cashOperations.delete(id),
    onSuccess: (data, id) => {
      // Remove operation from cache
      queryClient.removeQueries({ queryKey: ["cash-operation", id] });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      queryClient.invalidateQueries({ queryKey: ["cash-operations-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Cash operation deleted successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Delete cash operation error:", error);
      error(error.message || "Failed to delete cash operation");
    },
  });
}

// Order Mutations
// Create Order Mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (orderData) => apiEndpoints.orders.create(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Order created successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Create order error:", error);
      error(error.message || "Failed to create order");
    },
  });
}

// Update Order Mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => apiEndpoints.orders.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["order", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      success("Order updated successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Update order error:", error);
      error(error.message || "Failed to update order");
    },
  });
}

// Cancel Order Mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => apiEndpoints.orders.cancel(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(["order", id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Order cancelled successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Cancel order error:", error);
      error(error.message || "Failed to cancel order");
    },
  });
}

// Delete Order Mutation
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => apiEndpoints.orders.delete(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      success("Order deleted successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Delete order error:", error);
      error(error.message || "Failed to delete order");
    },
  });
}
