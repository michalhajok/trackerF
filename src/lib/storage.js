/**
 * Local Storage Utilities
 * Safe localStorage access with fallbacks and type checking
 */

import { safeJsonParse } from "./utils";

// Storage keys from constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  PREFERENCES: "user_preferences",
  DASHBOARD_LAYOUT: "dashboard_layout",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  TABLE_SETTINGS: "table_settings",
  FILTERS: "filters",
};

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    if (typeof window === "undefined") return false;

    const test = "__localStorage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from localStorage
 */
export function getStorageItem(key, defaultValue = null) {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    // Try to parse JSON, fall back to string
    const parsed = safeJsonParse(item, item);
    return parsed !== null ? parsed : defaultValue;
  } catch (error) {
    console.warn(`Error getting localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 */
export function setStorageItem(key, value) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Clear all localStorage
 */
export function clearStorage() {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.warn("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Get all localStorage keys
 */
export function getStorageKeys() {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    return Object.keys(window.localStorage);
  } catch (error) {
    console.warn("Error getting localStorage keys:", error);
    return [];
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo() {
  if (!isLocalStorageAvailable()) {
    return { available: false, used: 0, keys: 0 };
  }

  try {
    const keys = Object.keys(window.localStorage);
    let used = 0;

    keys.forEach((key) => {
      const item = window.localStorage.getItem(key);
      if (item) {
        used += item.length + key.length;
      }
    });

    return {
      available: true,
      used: used,
      keys: keys.length,
      usedKB: Math.round((used / 1024) * 100) / 100,
    };
  } catch (error) {
    console.warn("Error getting storage info:", error);
    return { available: true, used: 0, keys: 0 };
  }
}

// Auth-specific storage functions
export const authStorage = {
  getToken: () => getStorageItem(STORAGE_KEYS.AUTH_TOKEN),
  setToken: (token) => setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token),
  removeToken: () => removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),

  getUser: () => getStorageItem(STORAGE_KEYS.USER),
  setUser: (user) => setStorageItem(STORAGE_KEYS.USER, user),
  removeUser: () => removeStorageItem(STORAGE_KEYS.USER),

  clearAuth: () => {
    removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeStorageItem(STORAGE_KEYS.USER);
  },
};

// Theme storage functions
export const themeStorage = {
  getTheme: () => getStorageItem(STORAGE_KEYS.THEME, "light"),
  setTheme: (theme) => setStorageItem(STORAGE_KEYS.THEME, theme),
};

// Preferences storage functions
export const preferencesStorage = {
  getPreferences: () => getStorageItem(STORAGE_KEYS.PREFERENCES, {}),
  setPreferences: (preferences) =>
    setStorageItem(STORAGE_KEYS.PREFERENCES, preferences),
  updatePreference: (key, value) => {
    const current = preferencesStorage.getPreferences();
    const updated = { ...current, [key]: value };
    preferencesStorage.setPreferences(updated);
    return updated;
  },
  removePreference: (key) => {
    const current = preferencesStorage.getPreferences();
    const { [key]: removed, ...remaining } = current;
    preferencesStorage.setPreferences(remaining);
    return remaining;
  },
};

// Dashboard layout storage
export const layoutStorage = {
  getDashboardLayout: () => getStorageItem(STORAGE_KEYS.DASHBOARD_LAYOUT, {}),
  setDashboardLayout: (layout) =>
    setStorageItem(STORAGE_KEYS.DASHBOARD_LAYOUT, layout),

  getSidebarCollapsed: () =>
    getStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  setSidebarCollapsed: (collapsed) =>
    setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed),
};

// Table settings storage
export const tableStorage = {
  getTableSettings: (tableId) => {
    const allSettings = getStorageItem(STORAGE_KEYS.TABLE_SETTINGS, {});
    return allSettings[tableId] || {};
  },

  setTableSettings: (tableId, settings) => {
    const allSettings = getStorageItem(STORAGE_KEYS.TABLE_SETTINGS, {});
    const updated = { ...allSettings, [tableId]: settings };
    setStorageItem(STORAGE_KEYS.TABLE_SETTINGS, updated);
    return updated;
  },

  updateTableSetting: (tableId, key, value) => {
    const current = tableStorage.getTableSettings(tableId);
    const updated = { ...current, [key]: value };
    return tableStorage.setTableSettings(tableId, updated);
  },
};

// Filters storage
export const filtersStorage = {
  getFilters: (page) => {
    const allFilters = getStorageItem(STORAGE_KEYS.FILTERS, {});
    return allFilters[page] || {};
  },

  setFilters: (page, filters) => {
    const allFilters = getStorageItem(STORAGE_KEYS.FILTERS, {});
    const updated = { ...allFilters, [page]: filters };
    setStorageItem(STORAGE_KEYS.FILTERS, updated);
    return updated;
  },

  clearFilters: (page) => {
    const allFilters = getStorageItem(STORAGE_KEYS.FILTERS, {});
    const { [page]: removed, ...remaining } = allFilters;
    setStorageItem(STORAGE_KEYS.FILTERS, remaining);
    return remaining;
  },
};

// Cache storage with expiration
export const cacheStorage = {
  setCache: (key, data, expirationMinutes = 60) => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: expirationMinutes * 60 * 1000, // Convert to milliseconds
    };
    setStorageItem(`cache_${key}`, cacheItem);
  },

  getCache: (key) => {
    const cacheItem = getStorageItem(`cache_${key}`);
    if (!cacheItem || !cacheItem.timestamp) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - cacheItem.timestamp > cacheItem.expiration;

    if (isExpired) {
      removeStorageItem(`cache_${key}`);
      return null;
    }

    return cacheItem.data;
  },

  clearCache: (key) => {
    if (key) {
      removeStorageItem(`cache_${key}`);
    } else {
      // Clear all cache items
      const keys = getStorageKeys();
      keys.forEach((k) => {
        if (k.startsWith("cache_")) {
          removeStorageItem(k);
        }
      });
    }
  },

  clearExpiredCache: () => {
    const keys = getStorageKeys();
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith("cache_")) {
        const cacheItem = getStorageItem(key);
        if (cacheItem && cacheItem.timestamp) {
          const isExpired = now - cacheItem.timestamp > cacheItem.expiration;
          if (isExpired) {
            removeStorageItem(key);
          }
        }
      }
    });
  },
};

// Utility functions for debugging
export const storageDebug = {
  logAll: () => {
    if (!isLocalStorageAvailable()) {
      console.log("localStorage is not available");
      return;
    }

    console.group("LocalStorage Contents");
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      const value = window.localStorage.getItem(key);
      console.log(`${key}:`, safeJsonParse(value, value));
    });
    console.groupEnd();
  },

  logInfo: () => {
    const info = getStorageInfo();
    console.log("Storage Info:", info);
  },

  clearAll: () => {
    if (
      window.confirm(
        "Are you sure you want to clear all localStorage? This cannot be undone."
      )
    ) {
      clearStorage();
      console.log("All localStorage cleared");
    }
  },
};

// Export all storage utilities
export default {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageKeys,
  getStorageInfo,
  isLocalStorageAvailable,

  auth: authStorage,
  theme: themeStorage,
  preferences: preferencesStorage,
  layout: layoutStorage,
  table: tableStorage,
  filters: filtersStorage,
  cache: cacheStorage,
  debug: storageDebug,
};
