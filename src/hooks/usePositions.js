# usePositions.js (React Query Hook)

```javascript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

/**
 * Query hook for fetching positions
 */
export function usePositions(filters = {}) {
  return useQuery({
    queryKey: ['positions', filters],
    queryFn: () => api.positions.getAll(filters),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query hook for fetching open positions
 */
export function useOpenPositions() {
  return usePositions({ status: 'open' });
}

/**
 * Query hook for fetching closed positions
 */
export function useClosedPositions() {
  return usePositions({ status: 'closed' });
}

/**
 * Query hook for fetching a single position
 */
export function usePosition(id) {
  return useQuery({
    queryKey: ['position', id],
    queryFn: () => api.positions.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a new position
 */
export function useCreatePosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (positionData) => api.positions.create(positionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Pozycja została utworzona pomyślnie');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Błąd podczas tworzenia pozycji');
    },
  });
}

/**
 * Mutation hook for updating a position
 */
export function useUpdatePosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.positions.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['position', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Pozycja została zaktualizowana');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Błąd podczas aktualizacji pozycji');
    },
  });
}

/**
 * Mutation hook for closing a position
 */
export function useClosePosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, closeData }) => api.positions.close(id, closeData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['position', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Pozycja została zamknięta');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Błąd podczas zamykania pozycji');
    },
  });
}

/**
 * Mutation hook for deleting a position
 */
export function useDeletePosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id) => api.positions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Pozycja została usunięta');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Błąd podczas usuwania pozycji');
    },
  });
}

/**
 * Hook for position statistics
 */
export function usePositionStats() {
  return useQuery({
    queryKey: ['positions', 'stats'],
    queryFn: () => api.positions.getStats(),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for position performance data
 */
export function usePositionPerformance(positionId) {
  return useQuery({
    queryKey: ['position', positionId, 'performance'],
    queryFn: () => api.positions.getPerformance(positionId),
    select: (data) => data.data,
    enabled: !!positionId,
  });
}

export default usePositions;
```