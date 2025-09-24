/**
 * ProtectedRoute - FIXED VERSION
 * No infinite loops, simple auth check
 */

"use client";

import React, { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("🔍 ProtectedRoute: Checking auth (ONE TIME ONLY)");

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          // Basic validation
          const user = JSON.parse(userStr);
          if (user && user.id) {
            console.log("✅ ProtectedRoute: User is authenticated");
            setIsAuthenticated(true);
          } else {
            console.log("❌ ProtectedRoute: Invalid user data");
            setIsAuthenticated(false);
          }
        } else {
          console.log("❌ ProtectedRoute: No auth tokens found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ ProtectedRoute: Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        console.log("✅ ProtectedRoute: Auth check complete");
        setAuthChecked(true); // 🔥 ALWAYS set to true to end loading
      }
    };

    // Run auth check
    checkAuth();
  }, []); // 🔥 EMPTY DEPS - run only once

  // Show loading while checking
  if (!authChecked) {
    console.log("🔍 ProtectedRoute: Still checking auth...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("❌ ProtectedRoute: Redirecting to login");

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Not authenticated. Redirecting to login...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log("✅ ProtectedRoute: Rendering protected content");
  return children;
}
