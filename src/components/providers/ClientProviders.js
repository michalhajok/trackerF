/**
 * ClientProviders - FIXED with QueryClient
 * src/components/providers/ClientProviders.js
 */

"use client";

import { useState, useEffect } from "react";
import AuthProvider from "./AuthProvider";
import QueryProvider from "./QueryProvider"; // ✅ Ensure import exists
import ToastProvider from "./ToastProvider";

export default function ClientProviders({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <QueryProvider>
      {" "}
      {/* ✅ MUST be outer wrapper for useQuery */}
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
