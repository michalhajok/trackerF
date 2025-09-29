/**
 * Update Position Mutation
 * Individual mutation hook for updating positions
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

// Update Position Mutation (individual file as per spec)
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
      queryClient.invalidateQueries({ queryKey: ["portfolio-metrics"] });

      success("Position updated successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Update position error:", error);
      error(error.message || "Failed to update position");
    },
  });
}
