/**
 * Protected Route Component
 * Simple route protection using Context API (JavaScript only)
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/login",
}) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth is initialized
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, redirectTo]);

  // Show loading while initializing auth
  if (!isInitialized || isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-surface-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-surface-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-600">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
