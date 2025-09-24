/**
 * EMERGENCY AuthContext Fix - Stops infinite /auth/me loop
 * Fixed useEffect dependencies and token verification logic
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { apiEndpoints } from "@/lib/api";

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  SET_LOADING: "SET_LOADING",
  INIT_COMPLETE: "INIT_COMPLETE",
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
        initialized: true,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
        initialized: true,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        initialized: true,
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

    case AUTH_ACTIONS.INIT_COMPLETE:
      return {
        ...state,
        loading: false,
        initialized: true,
      };

    default:
      return state;
  }
}

// Initial State
const initialState = {
  loading: true, // Start with loading true
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  initialized: false, // ✅ Track initialization
};

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isInitializing = useRef(false); // ✅ Prevent multiple initializations

  // ✅ Initialize auth state ONLY ONCE
  useEffect(() => {
    // Prevent multiple initialization runs
    if (isInitializing.current || state.initialized) {
      return;
    }

    isInitializing.current = true;

    const initializeAuth = async () => {
      if (typeof window === "undefined") {
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
        return;
      }

      console.log("🔄 AuthContext: Initializing auth (ONE TIME ONLY)");

      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        console.log("🔍 Found in localStorage:", {
          hasToken: !!token,
          hasUser: !!userStr,
        });

        if (token && userStr && isValidJWTFormat(token)) {
          const user = JSON.parse(userStr);
          console.log(
            "✅ Valid token and user found - setting authenticated state"
          );

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token },
          });

          // ✅ OPTIONAL: Verify token with backend (NO LOOP - only once!)
          // Commented out to prevent the infinite loop
          /*
          try {
            const response = await apiEndpoints.auth.me();
            if (response.success && response.data) {
              console.log('✅ Token verified with backend');
              dispatch({
                type: AUTH_ACTIONS.SET_USER,
                payload: response.data.user
              });
            }
          } catch (verifyError) {
            console.warn('⚠️ Token verification failed:', verifyError);
            // Token might be expired, clear it
            logout();
          }
          */
        } else {
          console.log("❌ No valid token/user found - staying unauthenticated");
          dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        // Clear corrupted data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
      }
    };

    initializeAuth();
  }, []); // ✅ EMPTY dependency array - run only once!

  // Login function - FIXED to handle multiple response formats
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log("🔐 Attempting login...");
      const response = await apiEndpoints.auth.login(credentials);

      console.log("🔐 Login response received");

      // Handle multiple possible response formats
      let user, token;

      if (response && response.success && response.data) {
        // Try multiple ways to extract token and user
        if (response.data.token) {
          token = response.data.token;
          user = response.data.user;
        } else if (response.data.accessToken) {
          token = response.data.accessToken;
          user = response.data.user;
        } else if (response.token) {
          token = response.token;
          user = response.user || response.data.user;
        } else if (response.accessToken) {
          token = response.accessToken;
          user = response.user || response.data.user;
        }

        // Check if we have both user and token
        if (!user || !token) {
          throw new Error(
            `Missing required data - User: ${user ? "OK" : "Missing"}, Token: ${
              token ? "OK" : "Missing"
            }`
          );
        }

        // Validate token format
        if (token && !isValidJWTFormat(token)) {
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

  // Logout function
  const logout = async (skipApiCall = false) => {
    try {
      // Call backend logout if authenticated (but don't wait for it)
      if (state.isAuthenticated && !skipApiCall) {
        apiEndpoints.auth.logout().catch((err) => {
          console.warn("Logout API call failed (ignored):", err);
        });
      }
    } catch (error) {
      console.warn("Logout API call failed:", error);
    }

    // Clear localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Helper function to validate JWT format
  function isValidJWTFormat(token) {
    if (!token || typeof token !== "string") {
      return false;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    try {
      for (const part of parts) {
        if (!part) return false;
        atob(part.replace(/-/g, "+").replace(/_/g, "/"));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Context value
  const value = {
    ...state,
    login,
    logout,
  };

  console.log("🔍 AuthContext render:", {
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    initialized: state.initialized,
    hasUser: !!state.user,
    hasToken: !!state.token,
  });

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
