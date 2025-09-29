/**
 * ROZSZERZONA WERSJA API CLIENT dla Portfolio Manager
 * Dodano wszystkie nowe endpoints po implementacji nowego backendu
 */

import axios from "axios";

// API Configuration - Use Next.js proxy to avoid CORS issues
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/proxy";
const API_TIMEOUT = 30000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Disable to avoid CORS preflight issues
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for debugging
    config.headers["X-Request-ID"] = generateRequestId();

    // Add auth token if available (only in browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced debugging
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          headers: response.headers,
          data: response.data,
        }
      );
    }

    // ENHANCED: Check response format before returning
    if (response.data && typeof response.data === "object") {
      // Check if it's a valid API response format
      if (
        response.data.hasOwnProperty("success") ||
        response.data.hasOwnProperty("data")
      ) {
        console.log("📄 Valid API response format detected");
        return response.data;
      } else {
        console.log("📄 Response data (raw object):", response.data);
        return response.data;
      }
    } else {
      console.warn(
        "⚠️ Unexpected response format:",
        typeof response.data,
        response.data
      );
      // Try to parse if it's a string
      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          console.log("📄 Parsed string response:", parsed);
          return parsed;
        } catch (parseError) {
          console.error("❌ Failed to parse response as JSON:", parseError);
          return {
            success: false,
            error: "Invalid response format",
            message: "Server returned invalid JSON response",
            rawResponse: response.data,
          };
        }
      }
      return response.data;
    }
  },
  (error) => {
    console.error("API Error:", error);

    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data, headers } = error.response;

      console.error("Response error details:", {
        status,
        data,
        headers: Object.fromEntries(Object.entries(headers)),
      });

      // Check if error response has expected format
      let errorMessage = "Request failed";
      let errorData = data;

      if (data && typeof data === "object") {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map((e) => e.msg || e.message).join(", ");
        }
      } else if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          errorMessage = parsed.message || parsed.error || errorMessage;
          errorData = parsed;
        } catch (parseError) {
          console.warn("Failed to parse error response:", parseError);
          errorMessage = data;
        }
      }

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            // Only redirect if not already on auth pages
            if (
              !window.location.pathname.includes("/login") &&
              !window.location.pathname.includes("/register")
            ) {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          console.warn("Access forbidden to resource");
          break;
        case 404:
          console.warn("Resource not found");
          break;
        case 422:
          console.warn("Validation error:", errorData);
          break;
        case 429:
          console.warn("Rate limit exceeded");
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error("Server error:", errorData);
          break;
      }

      // Return structured error
      return Promise.reject({
        message: errorMessage,
        status,
        data: errorData,
        type: "response_error",
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error - no response received");
      return Promise.reject({
        message: "Network error - please check your connection",
        type: "network_error",
        details: error.message,
      });
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
      return Promise.reject({
        message: error.message || "Request failed",
        type: "setup_error",
      });
    }
  }
);

// Generate unique request ID
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// COMPLETE API ENDPOINTS - EXISTING + ALL NEW ENDPOINTS
export const apiEndpoints = {
  // 🔐 AUTHENTICATION ENDPOINTS (EXISTING)
  auth: {
    login: async (credentials) => {
      console.log("🔐 Attempting login with:", { email: credentials.email });
      try {
        const response = await apiClient.post("/auth/login", credentials);
        console.log("🔐 Login response received:", response);
        return response;
      } catch (error) {
        console.error("🔐 Login error:", error);
        throw error;
      }
    },
    register: async (userData) => {
      console.log("🔐 Attempting registration with:", {
        name: userData.name,
        email: userData.email,
      });
      try {
        const response = await apiClient.post("/auth/register", userData);
        console.log("🔐 Register response received:", response);
        return response;
      } catch (error) {
        console.error("🔐 Register error:", error);
        throw error;
      }
    },
    logout: () => apiClient.post("/auth/logout"),
    me: () => apiClient.get("/auth/me"),
    refresh: () => apiClient.post("/auth/refresh"),
    changePassword: (data) => apiClient.post("/auth/change-password", data),
    updateProfile: (data) => apiClient.put("/auth/profile", data),
  },

  // 📈 POSITIONS ENDPOINTS (EXISTING)
  positions: {
    // Get all positions with filtering
    getAll: (params = {}) => {
      console.log("📈 Getting positions with params:", params);
      return apiClient.get("/positions", { params });
    },

    // Get position by ID
    getById: (id) => {
      console.log("📈 Getting position by ID:", id);
      return apiClient.get(`/positions/${id}`);
    },

    // Create new position
    create: (data) => {
      console.log("📈 Creating position:", data);
      return apiClient.post("/positions", data);
    },

    // Update position
    update: (id, data) => {
      console.log("📈 Updating position:", id, data);
      return apiClient.put(`/positions/${id}`, data);
    },

    // Delete position
    delete: (id) => {
      console.log("📈 Deleting position:", id);
      return apiClient.delete(`/positions/${id}`);
    },

    // Close position
    close: (id, data) => {
      console.log("📈 Closing position:", id, data);
      return apiClient.put(`/positions/${id}/close`, data);
    },

    // Update market price
    updatePrice: (id, price) => {
      console.log("📈 Updating position price:", id, price);
      return apiClient.patch(`/positions/${id}/price`, { marketPrice: price });
    },

    // Get positions by status
    getByStatus: (status) => {
      console.log("📈 Getting positions by status:", status);
      return apiClient.get("/positions", { params: { status } });
    },

    // Get positions by symbol
    getBySymbol: (symbol) => {
      console.log("📈 Getting positions by symbol:", symbol);
      return apiClient.get("/positions", { params: { symbol } });
    },
  },

  // 💰 CASH OPERATIONS ENDPOINTS (EXISTING)
  cashOperations: {
    // Get all cash operations
    getAll: (params = {}) => {
      console.log("💰 Getting cash operations with params:", params);
      return apiClient.get("/cash-operations", { params });
    },

    // Get cash operation by ID
    getById: (id) => {
      console.log("💰 Getting cash operation by ID:", id);
      return apiClient.get(`/cash-operations/${id}`);
    },

    // Create new cash operation
    create: (data) => {
      console.log("💰 Creating cash operation:", data);
      return apiClient.post("/cash-operations", data);
    },

    // Update cash operation
    update: (id, data) => {
      console.log("💰 Updating cash operation:", id, data);
      return apiClient.put(`/cash-operations/${id}`, data);
    },

    // Delete cash operation
    delete: (id) => {
      console.log("💰 Deleting cash operation:", id);
      return apiClient.delete(`/cash-operations/${id}`);
    },

    // Get operations by type
    getByType: (type, params = {}) => {
      console.log("💰 Getting cash operations by type:", type, params);
      return apiClient.get(`/cash-operations/type/${type}`, { params });
    },

    // Get cash balance
    getBalance: (params = {}) => {
      console.log("💰 Getting cash balance:", params);
      return apiClient.get("/cash-operations/balance", { params });
    },

    // Get cash flow summary
    getCashFlow: (params = {}) => {
      console.log("💰 Getting cash flow summary:", params);
      return apiClient.get("/cash-operations/cash-flow", { params });
    },

    // Get monthly summary
    getMonthlySummary: (year, month) => {
      console.log("💰 Getting monthly summary:", year, month);
      return apiClient.get(`/cash-operations/monthly/${year}/${month}`);
    },
  },

  // 📋 PENDING ORDERS ENDPOINTS (EXISTING)
  pendingOrders: {
    // Get all pending orders
    getAll: (params = {}) => {
      console.log("📋 Getting pending orders with params:", params);
      return apiClient.get("/pending-orders", { params });
    },

    // Get pending order by ID
    getById: (id) => {
      console.log("📋 Getting pending order by ID:", id);
      return apiClient.get(`/pending-orders/${id}`);
    },

    // Create new pending order
    create: (data) => {
      console.log("📋 Creating pending order:", data);
      return apiClient.post("/pending-orders", data);
    },

    // Update pending order
    update: (id, data) => {
      console.log("📋 Updating pending order:", id, data);
      return apiClient.put(`/pending-orders/${id}`, data);
    },

    // Delete pending order
    delete: (id) => {
      console.log("📋 Deleting pending order:", id);
      return apiClient.delete(`/pending-orders/${id}`);
    },

    // Execute pending order
    execute: (id, data) => {
      console.log("📋 Executing pending order:", id, data);
      return apiClient.post(`/pending-orders/${id}/execute`, data);
    },

    // Cancel pending order
    cancel: (id) => {
      console.log("📋 Cancelling pending order:", id);
      return apiClient.patch(`/pending-orders/${id}/cancel`);
    },

    // Get orders by status
    getByStatus: (status) => {
      console.log("📋 Getting pending orders by status:", status);
      return apiClient.get("/pending-orders", { params: { status } });
    },

    // Get orders by symbol
    getBySymbol: (symbol) => {
      console.log("📋 Getting pending orders by symbol:", symbol);
      return apiClient.get("/pending-orders", { params: { symbol } });
    },
  },

  // 📊 ANALYTICS ENDPOINTS (EXISTING)
  analytics: {
    // Get dashboard data
    getDashboard: (params = {}) => {
      console.log("📊 Getting dashboard analytics:", params);
      return apiClient.get("/analytics/dashboard", { params });
    },

    // Get performance data
    getPerformance: (params = {}) => {
      console.log("📊 Getting performance analytics:", params);
      return apiClient.get("/analytics/performance", { params });
    },

    // Get portfolio allocation
    getAllocation: (params = {}) => {
      console.log("📊 Getting allocation analytics:", params);
      return apiClient.get("/analytics/allocation", { params });
    },

    // Get detailed statistics
    getStatistics: (params = {}) => {
      console.log("📊 Getting detailed statistics:", params);
      return apiClient.get("/analytics/statistics", { params });
    },

    // Get P&L chart data
    getPLChart: (params = {}) => {
      console.log("📊 Getting P&L chart data:", params);
      return apiClient.get("/analytics/pl-chart", { params });
    },

    // Get portfolio value history
    getValueHistory: (params = {}) => {
      console.log("📊 Getting portfolio value history:", params);
      return apiClient.get("/analytics/value-history", { params });
    },

    // Get risk metrics
    getRiskMetrics: (params = {}) => {
      console.log("📊 Getting risk metrics:", params);
      return apiClient.get("/analytics/risk", { params });
    },

    // Get portfolio comparison
    getComparison: (params = {}) => {
      console.log("📊 Getting portfolio comparison:", params);
      return apiClient.get("/analytics/comparison", { params });
    },
  },

  // 📁 FILE IMPORT ENDPOINTS (EXISTING)
  fileImport: {
    // Upload file
    upload: (file, options = {}) => {
      console.log("📁 Uploading file:", file.name, options);
      const formData = new FormData();
      formData.append("file", file);

      // Add additional options
      Object.keys(options).forEach((key) => {
        formData.append(key, options[key]);
      });

      return apiClient.post("/import/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    // Get import history
    getHistory: (params = {}) => {
      console.log("📁 Getting import history:", params);
      return apiClient.get("/import/history", { params });
    },

    // Get import status
    getStatus: (id) => {
      console.log("📁 Getting import status:", id);
      return apiClient.get(`/import/${id}/status`);
    },

    // Get import details
    getDetails: (id) => {
      console.log("📁 Getting import details:", id);
      return apiClient.get(`/import/${id}`);
    },

    // Delete import
    delete: (id) => {
      console.log("📁 Deleting import:", id);
      return apiClient.delete(`/import/${id}`);
    },

    // Retry failed import
    retry: (id) => {
      console.log("📁 Retrying import:", id);
      return apiClient.post(`/import/${id}/retry`);
    },

    // Get import template
    getTemplate: (type = "positions") => {
      console.log("📁 Getting import template:", type);
      return apiClient.get("/import/template", { params: { type } });
    },
  },

  // ====================================================================
  // 🚀 NOWE ENDPOINTS - DODANE PO IMPLEMENTACJI ROZSZERZONEGO BACKENDU
  // ====================================================================

  // 🔔 NOTIFICATIONS ENDPOINTS - ZUPEŁNIE NOWE!
  notifications: {
    // Get all notifications
    getAll: (params = {}) => {
      console.log("🔔 Getting notifications with params:", params);
      return apiClient.get("/notifications", { params });
    },

    // Get notification by ID
    getById: (id) => {
      console.log("🔔 Getting notification by ID:", id);
      return apiClient.get(`/notifications/${id}`);
    },

    // Create new notification
    create: (data) => {
      console.log("🔔 Creating notification:", data);
      return apiClient.post("/notifications", data);
    },

    // Mark notification as read
    markAsRead: (id) => {
      console.log("🔔 Marking notification as read:", id);
      return apiClient.put(`/notifications/${id}/read`);
    },

    // Mark multiple notifications as read
    markMultipleAsRead: (notificationIds) => {
      console.log(
        "🔔 Marking multiple notifications as read:",
        notificationIds
      );
      return apiClient.put("/notifications/mark-read", { notificationIds });
    },

    // Delete notification
    delete: (id) => {
      console.log("🔔 Deleting notification:", id);
      return apiClient.delete(`/notifications/${id}`);
    },

    // Get unread notifications
    getUnread: (params = {}) => {
      console.log("🔔 Getting unread notifications:", params);
      return apiClient.get("/notifications/unread", { params });
    },

    // Get notifications by type
    getByType: (type, params = {}) => {
      console.log("🔔 Getting notifications by type:", type, params);
      return apiClient.get(`/notifications/type/${type}`, { params });
    },

    // Record notification click
    recordClick: (id) => {
      console.log("🔔 Recording notification click:", id);
      return apiClient.post(`/notifications/${id}/click`);
    },

    // Create system notification (Admin only)
    createSystem: (data) => {
      console.log("🔔 Creating system notification:", data);
      return apiClient.post("/notifications/system", data);
    },

    // Cleanup old notifications (Admin only)
    cleanup: (params = {}) => {
      console.log("🔔 Cleaning up old notifications:", params);
      return apiClient.delete("/notifications/cleanup", { params });
    },
  },

  // 📊 WATCHLISTS ENDPOINTS - ZUPEŁNIE NOWE!
  watchlists: {
    // Get all watchlists
    getAll: (params = {}) => {
      console.log("📊 Getting watchlists:", params);
      return apiClient.get("/watchlists", { params });
    },

    // Get watchlist by ID
    getById: (id) => {
      console.log("📊 Getting watchlist by ID:", id);
      return apiClient.get(`/watchlists/${id}`);
    },

    // Create new watchlist
    create: (data) => {
      console.log("📊 Creating watchlist:", data);
      return apiClient.post("/watchlists", data);
    },

    // Update watchlist
    update: (id, data) => {
      console.log("📊 Updating watchlist:", id, data);
      return apiClient.put(`/watchlists/${id}`, data);
    },

    // Delete watchlist
    delete: (id) => {
      console.log("📊 Deleting watchlist:", id);
      return apiClient.delete(`/watchlists/${id}`);
    },

    // Add symbol to watchlist
    addSymbol: (id, symbolData) => {
      console.log("📊 Adding symbol to watchlist:", id, symbolData);
      return apiClient.post(`/watchlists/${id}/symbols`, symbolData);
    },

    // Remove symbol from watchlist
    removeSymbol: (id, symbol) => {
      console.log("📊 Removing symbol from watchlist:", id, symbol);
      return apiClient.delete(`/watchlists/${id}/symbols/${symbol}`);
    },

    // Add price alert to symbol
    addPriceAlert: (id, symbol, alertData) => {
      console.log("📊 Adding price alert:", id, symbol, alertData);
      return apiClient.post(
        `/watchlists/${id}/symbols/${symbol}/alerts`,
        alertData
      );
    },

    // Remove price alert
    removePriceAlert: (id, symbol, alertId) => {
      console.log("📊 Removing price alert:", id, symbol, alertId);
      return apiClient.delete(
        `/watchlists/${id}/symbols/${symbol}/alerts/${alertId}`
      );
    },

    // Update market data for watchlist
    updateMarketData: (id, marketData) => {
      console.log("📊 Updating watchlist market data:", id, marketData);
      return apiClient.put(`/watchlists/${id}/market-data`, { marketData });
    },

    // Get public watchlists
    getPublic: (params = {}) => {
      console.log("📊 Getting public watchlists:", params);
      return apiClient.get("/watchlists/public", { params });
    },

    // Get watchlist statistics
    getStatistics: () => {
      console.log("📊 Getting watchlist statistics");
      return apiClient.get("/watchlists/statistics");
    },
  },

  // 💹 MARKET DATA ENDPOINTS - ZUPEŁNIE NOWE!
  marketData: {
    // Get market data for symbol
    getSymbol: (symbol) => {
      console.log("💹 Getting market data for symbol:", symbol);
      return apiClient.get(`/market-data/${symbol}`);
    },

    // Get batch market data for multiple symbols
    getBatch: (symbols) => {
      console.log("💹 Getting batch market data:", symbols);
      return apiClient.post("/market-data/batch", { symbols });
    },

    // Update market data for symbol (Admin/System)
    update: (symbol, data) => {
      console.log("💹 Updating market data:", symbol, data);
      return apiClient.put(`/market-data/${symbol}`, data);
    },

    // Bulk update market data (Admin/System)
    bulkUpdate: (priceUpdates) => {
      console.log("💹 Bulk updating market data:", priceUpdates);
      return apiClient.put("/market-data/bulk-update", { priceUpdates });
    },

    // Get active symbols
    getActive: (params = {}) => {
      console.log("💹 Getting active symbols:", params);
      return apiClient.get("/market-data/symbols", { params });
    },

    // Get market summary
    getSummary: (params = {}) => {
      console.log("💹 Getting market summary:", params);
      return apiClient.get("/market-data/summary", { params });
    },

    // Get top movers
    getTopMovers: (params = {}) => {
      console.log("💹 Getting top movers:", params);
      return apiClient.get("/market-data/movers", { params });
    },

    // Search symbols
    search: (query, params = {}) => {
      console.log("💹 Searching symbols:", query, params);
      return apiClient.get("/market-data/search", {
        params: { q: query, ...params },
      });
    },

    // Get historical data for symbol
    getHistorical: (symbol, params = {}) => {
      console.log("💹 Getting historical data:", symbol, params);
      return apiClient.get(`/market-data/${symbol}/history`, { params });
    },

    // Get symbols by sector
    getBySector: (sector, params = {}) => {
      console.log("💹 Getting symbols by sector:", sector, params);
      return apiClient.get(`/market-data/sectors/${sector}`, { params });
    },

    // Record data source error (System)
    recordError: (symbol, errorMessage) => {
      console.log("💹 Recording market data error:", symbol, errorMessage);
      return apiClient.post(`/market-data/${symbol}/error`, { errorMessage });
    },

    // Get symbols needing update (System)
    getNeedingUpdate: () => {
      console.log("💹 Getting symbols needing update");
      return apiClient.get("/market-data/update-needed");
    },

    // Create new market data entry (Admin)
    create: (data) => {
      console.log("💹 Creating market data entry:", data);
      return apiClient.post("/market-data", data);
    },

    // Cleanup old data (Admin)
    cleanup: (params = {}) => {
      console.log("💹 Cleaning up old market data:", params);
      return apiClient.delete("/market-data/cleanup", { params });
    },
  },

  // 📄 REPORTS ENDPOINTS - ZUPEŁNIE NOWE!
  reports: {
    // Get all reports
    getAll: (params = {}) => {
      console.log("📄 Getting reports:", params);
      return apiClient.get("/reports", { params });
    },

    // Get report by ID
    getById: (id) => {
      console.log("📄 Getting report by ID:", id);
      return apiClient.get(`/reports/${id}`);
    },

    // Create new report
    create: (data) => {
      console.log("📄 Creating report:", data);
      return apiClient.post("/reports", data);
    },

    // Download report file
    download: (id) => {
      console.log("📄 Downloading report:", id);
      return apiClient.get(`/reports/${id}/download`, {
        responseType: "blob", // Important for file downloads
      });
    },

    // Create tax report
    createTax: (data) => {
      console.log("📄 Creating tax report:", data);
      return apiClient.post("/reports/tax", data);
    },

    // Get scheduled reports (Admin)
    getScheduled: () => {
      console.log("📄 Getting scheduled reports");
      return apiClient.get("/reports/scheduled");
    },

    // Get report status/progress
    getStatus: (id) => {
      console.log("📄 Getting report status:", id);
      return apiClient.get(`/reports/${id}/status`);
    },

    // Delete report
    delete: (id) => {
      console.log("📄 Deleting report:", id);
      return apiClient.delete(`/reports/${id}`);
    },

    // Retry failed report generation
    retry: (id) => {
      console.log("📄 Retrying report generation:", id);
      return apiClient.post(`/reports/${id}/retry`);
    },
  },

  // 🔒 AUDIT LOGS ENDPOINTS - ZUPEŁNIE NOWE!
  auditLogs: {
    // Get all audit logs (Admin only)
    getAll: (params = {}) => {
      console.log("🔒 Getting audit logs:", params);
      return apiClient.get("/audit-logs", { params });
    },

    // Get user activity summary
    getUserActivity: (userId, params = {}) => {
      console.log("🔒 Getting user activity:", userId, params);
      return apiClient.get(`/audit-logs/user/${userId}/summary`, { params });
    },

    // Get system activity overview (Admin)
    getSystemActivity: (params = {}) => {
      console.log("🔒 Getting system activity:", params);
      return apiClient.get("/audit-logs/system/activity", { params });
    },

    // Get suspicious activities (Admin)
    getSuspicious: (params = {}) => {
      console.log("🔒 Getting suspicious activities:", params);
      return apiClient.get("/audit-logs/suspicious", { params });
    },

    // Get failed login attempts (Admin)
    getFailedLogins: (params = {}) => {
      console.log("🔒 Getting failed logins:", params);
      return apiClient.get("/audit-logs/failed-logins", { params });
    },

    // Get logs by IP address (Admin)
    getByIP: (ipAddress, params = {}) => {
      console.log("🔒 Getting logs by IP:", ipAddress, params);
      return apiClient.get(`/audit-logs/ip/${ipAddress}`, { params });
    },

    // Detect unusual activity for user
    detectUnusual: (userId, params = {}) => {
      console.log("🔒 Detecting unusual activity:", userId, params);
      return apiClient.get(`/audit-logs/user/${userId}/unusual`, { params });
    },

    // Export compliance logs (Admin)
    exportCompliance: (data) => {
      console.log("🔒 Exporting compliance logs:", data);
      return apiClient.post("/audit-logs/export-compliance", data);
    },

    // Cleanup old logs (Admin)
    cleanup: () => {
      console.log("🔒 Cleaning up old audit logs");
      return apiClient.delete("/audit-logs/cleanup");
    },
  },

  // 🏥 HEALTH & SYSTEM ENDPOINTS (EXISTING - ROZSZERZONE)
  system: {
    // Get system health
    getHealth: () => {
      console.log("🏥 Getting system health");
      return apiClient.get("/health");
    },

    // Get API info
    getInfo: () => {
      console.log("🏥 Getting API info");
      return apiClient.get("/");
    },

    // Get user statistics
    getUserStats: () => {
      console.log("🏥 Getting user statistics");
      return apiClient.get("/analytics/user-stats");
    },

    // Health check for specific services
    checkNotifications: () => {
      console.log("🏥 Checking notifications health");
      return apiClient.get("/notifications/health");
    },

    checkWatchlists: () => {
      console.log("🏥 Checking watchlists health");
      return apiClient.get("/watchlists/health");
    },

    checkMarketData: () => {
      console.log("🏥 Checking market data health");
      return apiClient.get("/market-data/health");
    },

    checkReports: () => {
      console.log("🏥 Checking reports health");
      return apiClient.get("/reports/health");
    },

    checkAuditLogs: () => {
      console.log("🏥 Checking audit logs health");
      return apiClient.get("/audit-logs/health");
    },

    checkCashOperations: () => {
      console.log("🏥 Checking cash operations health");
      return apiClient.get("/cash-operations/health");
    },
  },

  // 🔍 SEARCH ENDPOINTS (EXISTING - ROZSZERZONE)
  search: {
    // Global search
    global: (query, params = {}) => {
      console.log("🔍 Global search:", query, params);
      return apiClient.get("/search", { params: { q: query, ...params } });
    },

    // Search symbols (enhanced with market data)
    symbols: (query, params = {}) => {
      console.log("🔍 Symbol search:", query, params);
      return apiClient.get("/market-data/search", {
        params: { q: query, ...params },
      });
    },

    // Search positions
    positions: (query, params = {}) => {
      console.log("🔍 Position search:", query, params);
      return apiClient.get("/search/positions", {
        params: { q: query, ...params },
      });
    },

    // Search notifications
    notifications: (query, params = {}) => {
      console.log("🔍 Notification search:", query, params);
      return apiClient.get("/notifications", {
        params: { q: query, ...params },
      });
    },

    // Search watchlists
    watchlists: (query, params = {}) => {
      console.log("🔍 Watchlist search:", query, params);
      return apiClient.get("/watchlists", {
        params: { q: query, ...params },
      });
    },

    // Search reports
    reports: (query, params = {}) => {
      console.log("🔍 Report search:", query, params);
      return apiClient.get("/reports", {
        params: { q: query, ...params },
      });
    },
  },
};

// Helper functions for common operations
export const apiHelpers = {
  // Format API error for user display
  formatError: (error) => {
    if (error.message) return error.message;
    if (error.data?.message) return error.data.message;
    if (error.data?.error) return error.data.error;
    return "An unexpected error occurred";
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error.status === 401 || error.type === "auth_error";
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return error.type === "network_error";
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error.status === 422 || error.status === 400;
  },

  // Get validation errors array
  getValidationErrors: (error) => {
    if (error.data?.errors && Array.isArray(error.data.errors)) {
      return error.data.errors;
    }
    return [];
  },
};

// Export the axios instance as default
export default apiClient;
