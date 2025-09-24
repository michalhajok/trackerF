// src/components/providers/AuthProvider.jsx
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
  const initializationRef = useRef(false); // 🔥 GUARD against multiple init

  useEffect(() => {
    // 🔥 PREVENT MULTIPLE INITIALIZATIONS
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

        if (token && userStr) {
          const user = JSON.parse(userStr);
          console.log("✅ Found valid token and user, setting authenticated");

          dispatch({
            type: "INIT_SUCCESS",
            payload: { user },
          });
        } else {
          console.log("❌ No valid auth data, staying unauthenticated");
          dispatch({ type: "INIT_COMPLETE" });
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        dispatch({ type: "INIT_COMPLETE" });
      }
    };

    // 🔥 NO BACKEND VERIFICATION ON INIT to prevent loops
    initAuth();
  }, []); // 🔥 EMPTY DEPENDENCY ARRAY

  const login = async (credentials) => {
    try {
      const response = await apiEndpoints.auth.login(credentials);

      if (response?.success && response?.data) {
        const { user, token } = response.data;
        console.log(user, token);

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: "LOGIN_SUCCESS", payload: { user } });

        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
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
