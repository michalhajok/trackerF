/**
 * Toast Provider Component
 * Individual provider for toast notifications
 */

"use client";

import { ToastProvider as ToastContextProvider } from "@/contexts/ToastContext";

export default function ToastProvider({ children }) {
  return <ToastContextProvider>{children}</ToastContextProvider>;
}
