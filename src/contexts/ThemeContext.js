"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Theme values
const THEMES = {
  light: {
    name: "light",
    colors: {
      primary: "#218099",
      primaryHover: "#1D7480",
      secondary: "#32B8C5",
      surface: "#FFFCFD",
      surfaceAlt: "#FCFCF9",
      text: "#134252",
      textMuted: "#64748B",
      border: "#E2E8F0",
      success: "#218099",
      error: "#C0152F",
      warning: "#A84B2F",
    },
  },
  dark: {
    name: "dark",
    colors: {
      primary: "#32B8C5",
      primaryHover: "#28A3B0",
      secondary: "#218099",
      surface: "#0F172A",
      surfaceAlt: "#1E293B",
      text: "#F8FAFC",
      textMuted: "#94A3B8",
      border: "#334155",
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
    },
  },
};

// Initial state
const initialState = {
  theme: "light",
  themeConfig: THEMES.light,
  isLoading: true,
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: "SET_THEME",
  SET_LOADING: "SET_LOADING",
  TOGGLE_THEME: "TOGGLE_THEME",
};

// Reducer
function themeReducer(state, action) {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
        themeConfig: THEMES[action.payload],
        isLoading: false,
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      const newTheme = state.theme === "light" ? "dark" : "light";
      return {
        ...state,
        theme: newTheme,
        themeConfig: THEMES[newTheme],
      };

    case THEME_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const ThemeContext = createContext();

// Theme Provider Component
export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  const [storedTheme, setStoredTheme] = useLocalStorage("theme", "light");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      let initialTheme = storedTheme;

      // If no stored theme, check system preference
      if (!storedTheme && typeof window !== "undefined") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        initialTheme = systemPrefersDark ? "dark" : "light";
      }

      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: initialTheme,
      });
    };

    initializeTheme();
  }, [storedTheme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== "undefined" && !state.isLoading) {
      document.documentElement.setAttribute("data-theme", state.theme);
      document.documentElement.className = state.theme;
    }
  }, [state.theme, state.isLoading]);

  // Set theme function
  const setTheme = (theme) => {
    if (THEMES[theme]) {
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: theme,
      });
      setStoredTheme(theme);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    dispatch({
      type: THEME_ACTIONS.TOGGLE_THEME,
    });
    setStoredTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually set a theme
      if (!localStorage.getItem("theme")) {
        const systemTheme = e.matches ? "dark" : "light";
        dispatch({
          type: THEME_ACTIONS.SET_THEME,
          payload: systemTheme,
        });
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const value = {
    ...state,
    setTheme,
    toggleTheme,
    themes: Object.keys(THEMES),
    isDark: state.theme === "dark",
    isLight: state.theme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
