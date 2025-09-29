/**
 * Delete Position Mutation
 * Individual mutation hook for deleting positions
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

// Delete Position Mutation (individual file as per spec)
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
      queryClient.invalidateQueries({ queryKey: ["portfolio-metrics"] });

      success("Position deleted successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Delete position error:", error);
      error(error.message || "Failed to delete position");
    },
  });
}
