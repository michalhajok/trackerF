// src/components/providers/AuthProvider.jsx - FIXED TOKEN EXTRACTION
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
  switch (action.type) {
    case "INIT_START":
      return { ...state, loading: true, initialized: false };
    case "INIT_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      };
    case "INIT_COMPLETE":
      return { ...state, loading: false, initialized: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) {
      console.log("⚠️ AuthProvider already initialized, skipping...");
      return;
    }

    initializationRef.current = true;
    console.log("🔄 AuthProvider: SINGLE initialization starting");

    const initAuth = () => {
      dispatch({ type: "INIT_START" });

      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        console.log("🔍 Checking localStorage:", {
          hasToken: !!token,
          hasUser: !!userStr,
          tokenValue:
            token === null
              ? "NULL"
              : token === "undefined"
              ? "UNDEFINED_STRING"
              : "VALID",
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
          console.log("✅ Found valid token and user, setting authenticated");

          dispatch({
            type: "INIT_SUCCESS",
            payload: { user },
          });
        } else {
          console.log("❌ Invalid auth data found, clearing localStorage");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          dispatch({ type: "INIT_COMPLETE" });
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        dispatch({ type: "INIT_COMPLETE" });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log("🔐 AuthProvider: Starting login process");
      const response = await apiEndpoints.auth.login(credentials);

      console.log("🔐 AuthProvider: Login response received", response);

      if (response?.success && response?.data) {
        // 🔧 CRITICAL FIX: Handle both 'token' and 'accessToken' fields
        const user = response.data.user;
        const token = response.data.token || response.data.accessToken; // ✅ Support both formats

        console.log("🔍 Validating login response data:");
        console.log("  User:", user ? "EXISTS" : "MISSING");
        console.log(
          "  Token (from token field):",
          response.data.token ? "EXISTS" : "MISSING"
        );
        console.log(
          "  Token (from accessToken field):",
          response.data.accessToken ? "EXISTS" : "MISSING"
        );
        console.log(
          "  Final token:",
          token ? `EXISTS (length: ${token.length})` : "MISSING"
        );
        console.log("  Token type:", typeof token);
        console.log(
          "  Token preview:",
          token ? token.substring(0, 30) + "..." : "NULL"
        );

        // Validation checks
        if (!user) {
          throw new Error("Login response missing user data");
        }

        if (!token) {
          throw new Error(
            "Login response missing token (checked both 'token' and 'accessToken' fields)"
          );
        }

        if (typeof token !== "string") {
          throw new Error(
            `Invalid token type: expected string, got ${typeof token}`
          );
        }

        if (token.length < 20) {
          throw new Error(`Token too short: ${token.length} characters`);
        }

        // Validate JWT format (should have 3 parts separated by dots)
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          throw new Error(
            `Invalid JWT format: expected 3 parts, got ${tokenParts.length}`
          );
        }

        console.log("✅ All validations passed, saving to localStorage");

        // Save to localStorage ONLY after validation
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ Auth data saved successfully");

        // Verify what was actually saved
        const savedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("user");

        console.log("🔍 Verification of saved data:");
        console.log(
          "  Saved token:",
          savedToken ? `${savedToken.substring(0, 30)}...` : "NULL"
        );
        console.log("  Saved user:", savedUser ? "EXISTS" : "NULL");

        dispatch({ type: "LOGIN_SUCCESS", payload: { user } });

        return { success: true, data: { user, token } };
      } else {
        console.error("❌ Invalid login response format:", response);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("❌ AuthProvider login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  const logout = () => {
    console.log("🔐 AuthProvider: Logging out");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const value = { ...state, login, logout };

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
