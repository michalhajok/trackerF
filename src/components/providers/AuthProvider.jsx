// src/components/providers/AuthProvider.jsx - COMPLETE WITH MISSING useEffect
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { apiEndpoints } from "@/lib/api";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
};

const authReducer = (state, action) => {
  console.log("🔧 AuthProvider Reducer:", action.type, action.payload);

  switch (action.type) {
    case "INIT_START":
      console.log("🔄 Reducer: INIT_START - setting loading: true");
      return { ...state, loading: true, initialized: false };

    case "INIT_SUCCESS":
      console.log(
        "✅ Reducer: INIT_SUCCESS - setting loading: false, isAuthenticated: true"
      );
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
        error: null,
      };

    case "INIT_COMPLETE":
      console.log("✅ Reducer: INIT_COMPLETE - setting loading: false");
      return { ...state, loading: false, initialized: true };

    case "LOGIN_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationRef = useRef(false);

  // ✅ THE MISSING useEffect - THIS WAS THE PROBLEM!
  useEffect(() => {
    console.log("🔄 AuthProvider useEffect: Starting initialization");
    console.log("🔍 initializationRef.current:", initializationRef.current);

    if (initializationRef.current) {
      console.log("⚠️ AuthProvider already initialized, skipping...");
      return;
    }

    initializationRef.current = true;
    console.log("🔄 AuthProvider: SINGLE initialization starting");

    const initAuth = () => {
      console.log("🔧 AuthProvider: initAuth() called");
      dispatch({ type: "INIT_START" });

      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        console.log("🔍 AuthProvider localStorage check:", {
          hasToken: !!token,
          hasUser: !!userStr,
          tokenValue:
            token === null
              ? "NULL"
              : token === "undefined"
              ? "UNDEFINED_STRING"
              : "VALID",
          tokenLength: token?.length || 0,
        });

        if (
          token &&
          token !== "undefined" &&
          token !== "null" &&
          token.length > 10 &&
          userStr &&
          userStr !== "undefined"
        ) {
          const user = JSON.parse(userStr);
          console.log(
            "✅ AuthProvider: Found valid token and user, setting authenticated"
          );

          dispatch({
            type: "INIT_SUCCESS",
            payload: { user },
          });
        } else {
          console.log(
            "❌ AuthProvider: Invalid auth data found, clearing localStorage"
          );
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          dispatch({ type: "INIT_COMPLETE" });
        }
      } catch (error) {
        console.error("❌ AuthProvider: Auth init error:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        dispatch({ type: "INIT_COMPLETE" });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "LOGIN_START" });
      console.log("🔐 AuthProvider: Starting login process");

      const response = await apiEndpoints.auth.login(credentials);
      console.log("🔐 AuthProvider: Login response received", response);

      if (response?.success && response?.data) {
        const user = response.data.user;
        const token = response.data.token || response.data.accessToken;

        console.log("🔍 Validating login response data:");
        console.log("  User:", user ? "EXISTS" : "MISSING");
        console.log(
          "  Token:",
          token ? `EXISTS (length: ${token.length})` : "MISSING"
        );

        if (!user) {
          throw new Error("Login response missing user data");
        }

        if (!token) {
          throw new Error("Login response missing token");
        }

        if (typeof token !== "string") {
          throw new Error(
            `Invalid token type: expected string, got ${typeof token}`
          );
        }

        if (token.length < 20) {
          throw new Error(`Token too short: ${token.length} characters`);
        }

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
        return { success: true, data: { user, token } };
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ AuthProvider login error:", error);
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.message || "Login failed",
      });

      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "LOGIN_START" });
      console.log("🔐 AuthProvider: Starting registration");

      const response = await apiEndpoints.auth.register(userData);
      console.log("🔐 AuthProvider: Register response received", response);

      if (response?.success && response?.data) {
        const user = response.data.user;
        const token = response.data.token || response.data.accessToken;

        if (!user) {
          throw new Error("Registration response missing user data");
        }

        if (!token) {
          throw new Error("Registration response missing token");
        }

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
        return { success: true, data: { user, token } };
      } else {
        throw new Error("Invalid registration response format");
      }
    } catch (error) {
      console.error("❌ AuthProvider register error:", error);
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.message || "Registration failed",
      });

      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    console.log("🔐 AuthProvider: Logging out");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const setError = (errorMessage) => {
    dispatch({ type: "SET_ERROR", payload: errorMessage });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
