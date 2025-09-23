/**
 * Authentication Context
 * Simple Context API for auth state management (JavaScript only)
 */

"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { apiEndpoints } from "@/lib/api";

// Auth states
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  INITIALIZE: "INITIALIZE",
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.INITIALIZE:
      return {
        ...state,
        ...action.payload,
        isInitialized: true,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE,
            payload: {
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE,
            payload: {
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            },
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({
          type: AUTH_ACTIONS.INITIALIZE,
          payload: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await apiEndpoints.auth.login(credentials);

      if (response.data?.token && response.data?.user) {
        // Store in localStorage
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data,
        });

        return { success: true, data: response.data };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
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
      const response = await apiEndpoints.auth.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
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
      await apiEndpoints.auth.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      const response = await apiEndpoints.auth.me();
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    ...state,

    // Actions
    login,
    register,
    logout,
    clearError,
    getCurrentUser,
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
