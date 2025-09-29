/**
 * App Providers Component
 * Main providers wrapper for the entire application
 */

"use client";

import AuthProvider from "./AuthProvider";
import QueryProvider from "./QueryProvider";
import ToastProvider from "./ToastProvider";

export default function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
