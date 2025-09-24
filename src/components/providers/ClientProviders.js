/**
 * Client-side Providers Wrapper
 * Fix for SSR/hydration issues with AppProviders
 */

"use client";

import { useState, useEffect } from "react";
import AuthProvider from "./AuthProvider";
import QueryProvider from "./QueryProvider";
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
    // <QueryProvider>
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
    // </QueryProvider>
  );
}
