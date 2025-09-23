/**
 * Authentication Utilities
 * Helper functions for authentication and authorization
 */

import { authStorage } from "./storage";

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  return !!(token && user);
}

/**
 * Get current user from storage
 */
export function getCurrentUser() {
  return authStorage.getUser();
}

/**
 * Get current auth token
 */
export function getAuthToken() {
  return authStorage.getToken();
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token = null) {
  const authToken = token || getAuthToken();

  if (!authToken) {
    return true;
  }

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = authToken.split(".");
    if (parts.length !== 3) {
      return true;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }

    return false;
  } catch (error) {
    console.warn("Error checking token expiration:", error);
    return true;
  }
}

/**
 * Get token payload
 */
export function getTokenPayload(token = null) {
  const authToken = token || getAuthToken();

  if (!authToken) {
    return null;
  }

  try {
    const parts = authToken.split(".");
    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(atob(parts[1]));
  } catch (error) {
    console.warn("Error parsing token payload:", error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role) {
  const user = getCurrentUser();

  if (!user || !user.roles) {
    return false;
  }

  if (Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }

  return user.roles === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles) {
  if (!Array.isArray(roles)) {
    return hasRole(roles);
  }

  return roles.some((role) => hasRole(role));
}

/**
 * Check if user has all specified roles
 */
export function hasAllRoles(roles) {
  if (!Array.isArray(roles)) {
    return hasRole(roles);
  }

  return roles.every((role) => hasRole(role));
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission) {
  const user = getCurrentUser();

  if (!user || !user.permissions) {
    return false;
  }

  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  return user.permissions === permission;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissions) {
  if (!Array.isArray(permissions)) {
    return hasPermission(permissions);
  }

  return permissions.some((permission) => hasPermission(permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return hasPermission(permissions);
  }

  return permissions.every((permission) => hasPermission(permission));
}

/**
 * Check if user is admin
 */
export function isAdmin() {
  return hasRole("admin");
}

/**
 * Get user initials for avatar
 */
export function getUserInitials() {
  const user = getCurrentUser();

  if (!user) {
    return "?";
  }

  if (user.name) {
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return "?";
}

/**
 * Get user display name
 */
export function getUserDisplayName() {
  const user = getCurrentUser();

  if (!user) {
    return "Unknown User";
  }

  return user.name || user.email || "User";
}

/**
 * Get authorization header
 */
export function getAuthHeader() {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Handle authentication error
 */
export function handleAuthError(error) {
  // Check if it's an authentication error
  const isAuthError =
    error.response?.status === 401 ||
    error.response?.status === 403 ||
    error.response?.data?.code === "TOKEN_EXPIRED" ||
    error.response?.data?.code === "UNAUTHORIZED";

  if (isAuthError) {
    // Clear auth data
    authStorage.clearAuth();

    // Redirect to login if not already there
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }

    return true; // Indicates this was an auth error
  }

  return false; // Not an auth error
}

/**
 * Refresh token if needed
 */
export async function refreshTokenIfNeeded() {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const payload = getTokenPayload(token);

    if (!payload || !payload.exp) {
      return false;
    }

    // Check if token expires within next 5 minutes
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    const tokenExpiresAt = payload.exp * 1000;

    if (tokenExpiresAt < fiveMinutesFromNow) {
      // Token needs refresh - this would typically call a refresh endpoint
      console.log("Token needs refresh");
      // TODO: Implement refresh logic when backend supports it
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Error checking token refresh:", error);
    return false;
  }
}

/**
 * Logout and clear all auth data
 */
export function logout() {
  authStorage.clearAuth();

  // Clear any other user-specific data
  // This could include clearing cache, preferences, etc.

  // Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Set up auth state from response
 */
export function setAuthState(authData) {
  if (!authData || !authData.token || !authData.user) {
    throw new Error("Invalid auth data");
  }

  authStorage.setToken(authData.token);
  authStorage.setUser(authData.user);
}

/**
 * Check if current session is valid
 */
export function isValidSession() {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return false;
  }

  if (isTokenExpired(token)) {
    return false;
  }

  return true;
}

/**
 * Get time until token expires
 */
export function getTimeUntilExpiration() {
  const token = getAuthToken();

  if (!token) {
    return 0;
  }

  try {
    const payload = getTokenPayload(token);

    if (!payload || !payload.exp) {
      return 0;
    }

    const expiresAt = payload.exp * 1000;
    const now = Date.now();

    return Math.max(0, expiresAt - now);
  } catch (error) {
    console.warn("Error calculating time until expiration:", error);
    return 0;
  }
}

/**
 * Format time until expiration
 */
export function formatTimeUntilExpiration() {
  const timeMs = getTimeUntilExpiration();

  if (timeMs === 0) {
    return "Expired";
  }

  const minutes = Math.floor(timeMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

// Development helpers
export const authDebug = {
  logCurrentAuth: () => {
    console.group("Current Auth State");
    console.log("Authenticated:", isAuthenticated());
    console.log("Token:", getAuthToken());
    console.log("User:", getCurrentUser());
    console.log("Token Expired:", isTokenExpired());
    console.log("Time Until Expiration:", formatTimeUntilExpiration());
    console.groupEnd();
  },

  logPermissions: () => {
    const user = getCurrentUser();
    console.group("User Permissions");
    console.log("User:", user);
    console.log("Roles:", user?.roles);
    console.log("Permissions:", user?.permissions);
    console.log("Is Admin:", isAdmin());
    console.groupEnd();
  },
};

// Export all auth utilities
export default {
  isAuthenticated,
  getCurrentUser,
  getAuthToken,
  isTokenExpired,
  getTokenPayload,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  getUserInitials,
  getUserDisplayName,
  getAuthHeader,
  handleAuthError,
  refreshTokenIfNeeded,
  logout,
  setAuthState,
  isValidSession,
  getTimeUntilExpiration,
  formatTimeUntilExpiration,
  debug: authDebug,
};
