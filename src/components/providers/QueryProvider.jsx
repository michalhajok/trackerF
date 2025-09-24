/**
 * QueryProvider - React Query setup for Next.js 15
 * src/components/providers/QueryProvider.jsx
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false, // Disable auto refetch
            refetchOnReconnect: false, // Disable auto refetch
            refetchOnMount: false, // Disable auto refetch
            retry: (failureCount, error) => {
              // Don't retry on 401/403 (auth errors)
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              return failureCount < 2; // Max 2 retries
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
