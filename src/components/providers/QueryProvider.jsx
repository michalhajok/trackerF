// src/components/providers/QueryProvider.jsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // 🔥 DISABLE auto refetch
            refetchOnReconnect: false, // 🔥 DISABLE auto refetch
            refetchOnMount: false, // 🔥 DISABLE auto refetch
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1, // Only 1 retry
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
