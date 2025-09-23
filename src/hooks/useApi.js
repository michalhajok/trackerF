"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/Toast";

/**
 * Generic API hook for making HTTP requests
 * Provides loading states, error handling, and toast notifications
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const { toast } = useToast();

  const request = useCallback(
    async (apiCall, options = {}) => {
      const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "Operacja zakończona pomyślnie",
        onSuccess,
        onError,
        transform,
      } = options;

      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        const data = transform ? transform(response.data) : response.data;

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(data);
        }

        setLoading(false);
        return { data, success: true };
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Wystąpił błąd";
        setError(errorMessage);

        // Handle 401 errors by logging out
        if (err.response?.status === 401) {
          logout();
          return { error: "Sesja wygasła", success: false };
        }

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        setLoading(false);
        return { error: errorMessage, success: false };
      }
    },
    [token, logout, toast]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    request,
    loading,
    error,
    clearError,
  };
}

/**
 * Hook for specific API endpoints
 */
export function useApiEndpoint(endpoint) {
  const { request } = useApi();

  const get = useCallback(
    (params, options) => {
      return request(() => api[endpoint].getAll(params), options);
    },
    [request, endpoint]
  );

  const getById = useCallback(
    (id, options) => {
      return request(() => api[endpoint].getById(id), options);
    },
    [request, endpoint]
  );

  const create = useCallback(
    (data, options) => {
      return request(() => api[endpoint].create(data), {
        showSuccessToast: true,
        successMessage: "Rekord został utworzony",
        ...options,
      });
    },
    [request, endpoint]
  );

  const update = useCallback(
    (id, data, options) => {
      return request(() => api[endpoint].update(id, data), {
        showSuccessToast: true,
        successMessage: "Rekord został zaktualizowany",
        ...options,
      });
    },
    [request, endpoint]
  );

  const remove = useCallback(
    (id, options) => {
      return request(() => api[endpoint].delete(id), {
        showSuccessToast: true,
        successMessage: "Rekord został usunięty",
        ...options,
      });
    },
    [request, endpoint]
  );

  return {
    get,
    getById,
    create,
    update,
    remove,
  };
}

export default useApi;
