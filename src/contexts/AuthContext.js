/**
 * AuthContext - EMERGENCY FIX for undefined token
 * Handles multiple token response formats from backend
 */

"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { apiEndpoints } from "@/lib/api";

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_LOADING: "SET_LOADING",
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

// Initial State
const initialState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === "undefined") return;

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        console.log("🔍 Initializing auth with:", {
          token: token?.substring(0, 20) + "...",
          userStr,
        });

        if (token && userStr) {
          // Validate token format
          if (isValidJWTFormat(token)) {
            const user = JSON.parse(userStr);
            console.log("✅ Valid token found, setting authenticated state");

            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token },
            });

            // Optionally verify token with backend
            try {
              const response = await apiEndpoints.auth.me();
              if (response.success && response.data) {
                console.log("✅ Token verified with backend");
                dispatch({
                  type: AUTH_ACTIONS.SET_USER,
                  payload: response.data.user,
                });
              }
            } catch (verifyError) {
              console.warn("⚠️ Token verification failed:", verifyError);
              // Token might be expired, clear it
              logout();
            }
          } else {
            console.error("❌ Invalid JWT format in localStorage:", token);
            // Clear invalid token
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        // Clear corrupted data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function - FIXED to handle multiple response formats
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log("🔐 Attempting login...");
      const response = await apiEndpoints.auth.login(credentials);

      console.log("🔐 Full login response:", JSON.stringify(response, null, 2));

      // EMERGENCY FIX: Handle multiple possible response formats
      let user, token;

      if (response && response.success && response.data) {
        console.log("✅ Response has success and data");
        console.log("🔍 Response.data:", response.data);

        // Try multiple ways to extract token and user
        if (response.data.token) {
          // Standard format: { success: true, data: { user: {...}, token: "..." } }
          token = response.data.token;
          user = response.data.user;
          console.log("✅ Found token in data.token");
        } else if (response.data.accessToken) {
          // Alternative format: { success: true, data: { user: {...}, accessToken: "..." } }
          token = response.data.accessToken;
          user = response.data.user;
          console.log("✅ Found token in data.accessToken");
        } else if (response.token) {
          // Direct format: { success: true, token: "...", user: {...} }
          token = response.token;
          user = response.user || response.data.user;
          console.log("✅ Found token in response.token");
        } else if (response.accessToken) {
          // Alternative direct format
          token = response.accessToken;
          user = response.user || response.data.user;
          console.log("✅ Found token in response.accessToken");
        }

        console.log("🔍 Extracted values:", {
          user: user ? "Present" : "Missing",
          token: token ? token.substring(0, 20) + "..." : "Missing/Undefined",
          tokenType: typeof token,
        });

        // Check if we have both user and token
        if (!user || !token) {
          console.error("❌ Missing user or token after extraction");
          console.error("❌ User:", user);
          console.error("❌ Token:", token);
          throw new Error(
            `Missing required data - User: ${user ? "OK" : "Missing"}, Token: ${
              token ? "OK" : "Missing"
            }`
          );
        }

        // Validate token format (only if token is not undefined/null)
        if (token && !isValidJWTFormat(token)) {
          console.error("❌ Backend returned invalid JWT format:", token);
          console.error("❌ Token type:", typeof token);
          console.error("❌ Token length:", token?.length);
          throw new Error("Backend returned invalid token format");
        }

        console.log("✅ Valid token received from backend");

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
          console.log("✅ Token stored in localStorage");
        }

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true, data: { user, token } };
      } else {
        console.error("❌ Invalid response format:", response);
        throw new Error("Invalid response format from login");
      }
    } catch (error) {
      console.error("🔐 Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log("🔐 Attempting registration...");
      const response = await apiEndpoints.auth.register(userData);

      console.log("🔐 Register response received:", response);

      if (response && response.success && response.data) {
        const { user, token } = response.data;

        // Validate token format
        if (!isValidJWTFormat(token)) {
          console.error("❌ Backend returned invalid JWT format:", token);
          throw new Error("Backend returned invalid token format");
        }

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true, data: { user, token } };
      } else {
        throw new Error("Invalid response format from registration");
      }
    } catch (error) {
      console.error("🔐 Registration error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";

      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout if authenticated
      if (state.isAuthenticated) {
        await apiEndpoints.auth.logout();
      }
    } catch (error) {
      console.warn("Logout API call failed:", error);
      // Continue with local logout even if API fails
    }

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await apiEndpoints.auth.updateProfile(profileData);

      if (response && response.success && response.data) {
        const updatedUser = response.data.user;

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: updatedUser,
        });

        return { success: true, data: updatedUser };
      } else {
        throw new Error("Invalid response format from profile update");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      return { success: false, error: errorMessage };
    }
  };

  // Helper function to validate JWT format
  function isValidJWTFormat(token) {
    if (!token || typeof token !== "string") {
      console.log("🔍 JWT validation failed: not a string or null/undefined", {
        token,
        type: typeof token,
      });
      return false;
    }

    // JWT should have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("🔍 JWT validation failed: not 3 parts", {
        partsCount: parts.length,
        parts,
      });
      return false;
    }

    // Each part should be base64url encoded
    try {
      for (const part of parts) {
        if (!part) {
          console.log("🔍 JWT validation failed: empty part");
          return false;
        }
        // Try to decode as base64
        atob(part.replace(/-/g, "+").replace(/_/g, "/"));
      }
      console.log("🔍 JWT validation passed");
      return true;
    } catch (error) {
      console.log(
        "🔍 JWT validation failed: base64 decode error",
        error.message
      );
      return false;
    }
  }

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
