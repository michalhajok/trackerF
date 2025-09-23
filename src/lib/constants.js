/**
 * Application Constants
 * Central place for all app constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "Portfolio Manager",
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  DESCRIPTION: "Professional investment portfolio management and tracking",
  SUPPORT_EMAIL: "support@portfoliomanager.com",
  COMPANY_NAME: "Portfolio Manager",
};

// Feature Flags
export const FEATURES = {
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
  DARK_MODE: true,
  EXPORT_DATA: true,
  IMPORT_DATA: true,
  REAL_TIME_UPDATES: true,
};

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE:
    parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE) || 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ],
  ALLOWED_EXTENSIONS: [".xlsx", ".xls", ".csv"],
};

// Position Types
export const POSITION_TYPES = {
  BUY: "BUY",
  SELL: "SELL",
};

export const POSITION_STATUSES = {
  OPEN: "open",
  CLOSED: "closed",
};

// Cash Operation Types
export const CASH_OPERATION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  DIVIDEND: "dividend",
  FEE: "fee",
};

// Order Types
export const ORDER_TYPES = {
  MARKET: "market",
  LIMIT: "limit",
  STOP: "stop",
  STOP_LIMIT: "stop_limit",
};

export const ORDER_SIDES = {
  BUY: "BUY",
  SELL: "SELL",
};

export const ORDER_STATUSES = {
  PENDING: "pending",
  EXECUTED: "executed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

// Currencies
export const CURRENCIES = {
  USD: "USD",
  EUR: "EUR",
  PLN: "PLN",
  GBP: "GBP",
};

export const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
  GBP: "£",
};

// Date and Time Formats
export const DATE_FORMATS = {
  SHORT: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy",
  WITH_TIME: "MMM dd, yyyy HH:mm",
  ISO: "yyyy-MM-dd",
  TIME_ONLY: "HH:mm",
  FULL: "MMM dd, yyyy HH:mm:ss",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// Query Configuration
export const QUERY_CONFIG = {
  STALE_TIME: {
    SHORT: 1000 * 60 * 2, // 2 minutes
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 10, // 10 minutes
  },
  CACHE_TIME: 1000 * 60 * 10, // 10 minutes
  RETRY_ATTEMPTS: 3,
  REFETCH_INTERVAL: {
    DASHBOARD: 1000 * 60 * 5, // 5 minutes
    POSITIONS: 1000 * 60 * 2, // 2 minutes
    ORDERS: 1000 * 60 * 1, // 1 minute
  },
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 7000,
  },
  MAX_TOASTS: 5,
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eedd8",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
    },
  },
  BREAKPOINTS: {
    SM: "640px",
    MD: "768px",
    LG: "1024px",
    XL: "1280px",
    "2XL": "1536px",
  },
};

// Analytics Time Periods
export const ANALYTICS_PERIODS = {
  "1M": { label: "1 Month", days: 30 },
  "3M": { label: "3 Months", days: 90 },
  "6M": { label: "6 Months", days: 180 },
  "1Y": { label: "1 Year", days: 365 },
  ALL: { label: "All Time", days: null },
};

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: [
    "#14b8a6", // primary-500
    "#06b6d4", // cyan-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
  ],
  ANIMATION_DURATION: 750,
  GRID_COLOR: "#e2e8f0",
  TEXT_COLOR: "#64748b",
};

// Navigation Menu Items
export const NAVIGATION = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "Home",
  },
  {
    name: "Positions",
    href: "/dashboard/positions",
    icon: "TrendingUp",
  },
  {
    name: "Cash Operations",
    href: "/dashboard/cash-operations",
    icon: "DollarSign",
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: "ClipboardList",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
  },
  {
    name: "Import",
    href: "/dashboard/import",
    icon: "Upload",
  },
];

// User Roles and Permissions
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export const PERMISSIONS = {
  READ_POSITIONS: "read:positions",
  WRITE_POSITIONS: "write:positions",
  DELETE_POSITIONS: "delete:positions",
  READ_ANALYTICS: "read:analytics",
  IMPORT_DATA: "import:data",
  EXPORT_DATA: "export:data",
  ADMIN_PANEL: "admin:panel",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  TIMEOUT: "Request timeout. Please try again.",
  GENERIC: "Something went wrong. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  POSITION_CREATED: "Position created successfully!",
  POSITION_UPDATED: "Position updated successfully!",
  POSITION_DELETED: "Position deleted successfully!",
  CASH_OPERATION_CREATED: "Cash operation created successfully!",
  ORDER_CREATED: "Order created successfully!",
  ORDER_CANCELLED: "Order cancelled successfully!",
  FILE_UPLOADED: "File uploaded successfully!",
  DATA_EXPORTED: "Data exported successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  PREFERENCES: "user_preferences",
  DASHBOARD_LAYOUT: "dashboard_layout",
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SYMBOL: /^[A-Z0-9]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
};

// Export all constants as a default object
export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURES,
  FILE_UPLOAD,
  POSITION_TYPES,
  POSITION_STATUSES,
  CASH_OPERATION_TYPES,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUSES,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  DATE_FORMATS,
  PAGINATION,
  QUERY_CONFIG,
  TOAST_CONFIG,
  THEME,
  ANALYTICS_PERIODS,
  CHART_CONFIG,
  NAVIGATION,
  USER_ROLES,
  PERMISSIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  REGEX,
};
