/**
 * QueryProvider - React Query Configuration
 * Prevents infinite retries and proper error handling
 */

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Limit retries to prevent infinite loops
      retry: (failureCount, error) => {
        console.log(`🔍 Query retry attempt ${failureCount}:`, error);

        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          console.log("❌ Auth error - not retrying");
          return false;
        }

        // Only retry 3 times maximum
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache time - 5 minutes
      staleTime: 5 * 60 * 1000,

      // Refetch settings
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,

      // Error handling
      onError: (error) => {
        console.error("❌ Query error:", error);
      },
    },
    mutations: {
      // No retries for mutations
      retry: false,

      onError: (error) => {
        console.error("❌ Mutation error:", error);
      },
    },
  },
});

// Query error handler
const handleQueryError = (error, query) => {
  console.error("🔍 Query Error Details:", {
    queryKey: query.queryKey,
    error: error,
    status: error?.status,
    message: error?.message,
  });

  // Handle specific errors
  if (error?.status === 401) {
    console.log("🔍 Unauthorized - clearing auth");
    // Clear auth and redirect to login
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// Set global error handlers
queryClient.setQueryDefaults(["positions"], {
  onError: handleQueryError,
});

queryClient.setQueryDefaults(["analytics"], {
  onError: handleQueryError,
});

queryClient.setQueryDefaults(["dashboard"], {
  onError: handleQueryError,
});

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

// Export queryClient for debugging
if (typeof window !== "undefined") {
  window.queryClient = queryClient;
}
