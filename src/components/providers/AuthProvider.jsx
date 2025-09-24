/**
 * AuthProvider - FIXED EXPORTS
 * Consistent export structure
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
      return { ...state, loading: true, error: null };
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
      return { ...state, user: action.payload };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.INIT_COMPLETE:
      return { ...state, loading: false, initialized: true };
    default:
      return state;
  }
}

// Initial State
const initialState = {
  loading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  initialized: false,
};

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current || state.initialized) return;
    isInitializing.current = true;

    const initializeAuth = async () => {
      if (typeof window === "undefined") {
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
        return;
      }

      console.log("🔄 AuthProvider: Initializing auth (ONE TIME ONLY)");

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
        } else {
          console.log("❌ No valid token/user found - staying unauthenticated");
          dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        dispatch({ type: AUTH_ACTIONS.INIT_COMPLETE });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log("🔐 Attempting login...");
      const response = await apiEndpoints.auth.login(credentials);

      console.log("🔐 Login response received");

      if (response && response.success && response.data) {
        let user, token;

        if (response.data.token) {
          token = response.data.token;
          user = response.data.user;
        } else if (response.data.accessToken) {
          token = response.data.accessToken;
          user = response.data.user;
        } else if (response.token) {
          token = response.token;
          user = response.user || response.data.user;
        }

        if (!user || !token) {
          throw new Error("Missing user or token in response");
        }

        if (token && !isValidJWTFormat(token)) {
          throw new Error("Invalid token format");
        }

        console.log("✅ Valid token received from backend");

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
        throw new Error("Invalid response format");
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

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  function isValidJWTFormat(token) {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

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

  const value = { ...state, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ NAMED EXPORT - useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ✅ DEFAULT EXPORT - AuthProvider
export default AuthProvider;
