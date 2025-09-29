"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";

/**
 * Custom hook for authentication operations
 * Provides a clean API for auth-related functionality
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuthContext();

  // Additional computed values
  const isAdmin = user?.role === "admin";
  const userName = user?.name || user?.email?.split("@")[0];

  // Enhanced login with error handling
  const handleLogin = async (credentials) => {
    clearError();
    const result = await login(credentials);
    return result;
  };

  // Enhanced register with error handling
  const handleRegister = async (userData) => {
    clearError();
    const result = await register(userData);
    return result;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || isAdmin;
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    userName,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout,
    clearError,
    hasPermission,
  };
}

export default useAuth;
