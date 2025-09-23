/**
 * Individual Position Mutations
 * Separated mutation hooks for better modularity (as per spec)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

// Create Position Mutation (individual file as per spec)
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
      queryClient.invalidateQueries({ queryKey: ["portfolio-metrics"] });

      success("Position created successfully!");
      return data;
    },
    onError: (error) => {
      console.error("Create position error:", error);
      error(error.message || "Failed to create position");
    },
  });
}
