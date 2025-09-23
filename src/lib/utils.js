/**
 * Utility Functions
 * Common helper functions for the application
 */

import { clsx } from "clsx";
import { format, parseISO, isValid } from "date-fns";

/**
 * Combine class names with clsx
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format currency values
 */
export function formatCurrency(value, currency = "USD", locale = "en-US") {
  if (value === null || value === undefined || isNaN(value)) {
    return `${getCurrencySymbol(currency)}0.00`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }

  const formatted = value.toFixed(decimals);
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatted}%`;
}

/**
 * Format numbers with thousand separators
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format dates
 */
export function formatDate(date, pattern = "MMM dd, yyyy") {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    return format(dateObj, pattern);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}

/**
 * Format relative time
 */
export function formatRelativeTime(date) {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "";
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency) {
  const symbols = {
    USD: "$",
    EUR: "€",
    PLN: "zł",
    GBP: "£",
  };
  return symbols[currency] || currency;
}

/**
 * Calculate P&L percentage
 */
export function calculatePLPercentage(openPrice, currentPrice, type = "BUY") {
  if (!openPrice || !currentPrice || openPrice === 0) return 0;

  if (type === "BUY") {
    return ((currentPrice - openPrice) / openPrice) * 100;
  } else {
    return ((openPrice - currentPrice) / openPrice) * 100;
  }
}

/**
 * Calculate P&L amount
 */
export function calculatePLAmount(
  openPrice,
  currentPrice,
  volume,
  type = "BUY"
) {
  if (!openPrice || !currentPrice || !volume) return 0;

  if (type === "BUY") {
    return (currentPrice - openPrice) * volume;
  } else {
    return (openPrice - currentPrice) * volume;
  }
}

/**
 * Generate color for charts/visualizations
 */
export function getColorForIndex(index, opacity = 1) {
  const colors = [
    `rgba(33, 128, 153, ${opacity})`, // primary-500
    `rgba(50, 184, 197, ${opacity})`, // primary-400
    `rgba(94, 237, 216, ${opacity})`, // primary-300
    `rgba(153, 246, 228, ${opacity})`, // primary-200
    `rgba(100, 116, 139, ${opacity})`, // slate-500
    `rgba(148, 163, 184, ${opacity})`, // slate-400
    `rgba(203, 213, 225, ${opacity})`, // slate-300
    `rgba(226, 232, 240, ${opacity})`, // slate-200
  ];
  return colors[index % colors.length];
}

/**
 * Debounce function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function
 */
export function throttle(func, wait) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const cloned = {};
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * Generate random ID
 */
export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 100, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Download data as file
 */
export function downloadAsFile(data, filename, type = "text/plain") {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Get nested object property safely
 */
export function get(obj, path, defaultValue = undefined) {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * Set nested object property safely
 */
export function set(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}
