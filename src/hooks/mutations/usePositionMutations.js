/**
 * Position Mutations
 * React Query mutations for position operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

// Create Position Mutation
export function useCreatePosition() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (positionData) => apiEndpoints.positions.create(positionData),
    onSuccess: (data) => {
      // Invalidate and refetch positions
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Position created successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Create position error:", error);
      error(error.message || "Failed to create position");
    },
  });
}

// Update Position Mutation
export function useUpdatePosition() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => apiEndpoints.positions.update(id, data),
    onSuccess: (data, variables) => {
      // Update specific position in cache
      queryClient.setQueryData(["position", variables.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Position updated successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Update position error:", error);
      error(error.message || "Failed to update position");
    },
  });
}

// Delete Position Mutation
export function useDeletePosition() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => apiEndpoints.positions.delete(id),
    onSuccess: (data, id) => {
      // Remove position from cache
      queryClient.removeQueries({ queryKey: ["position", id] });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Position deleted successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Delete position error:", error);
      error(error.message || "Failed to delete position");
    },
  });
}

// Close Position Mutation
export function useClosePosition() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, closeData }) =>
      apiEndpoints.positions.close(id, closeData),
    onSuccess: (data, variables) => {
      // Update specific position in cache
      queryClient.setQueryData(["position", variables.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success("Position closed successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Close position error:", error);
      error(error.message || "Failed to close position");
    },
  });
}

// Bulk Update Positions Mutation
export function useBulkUpdatePositions() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (updates) => apiEndpoints.positions.bulkUpdate(updates),
    onSuccess: (data) => {
      // Invalidate all position-related queries
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      success(`${data.updated} positions updated successfully!`);
      return data;
    },
    onError: (error) => {
      console.error("Bulk update positions error:", error);
      error(error.message || "Failed to update positions");
    },
  });
}
