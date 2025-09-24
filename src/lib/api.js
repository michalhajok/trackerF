/**
 * Complete API Client for Portfolio Manager
 * All endpoints with enhanced debugging and error handling
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

// COMPLETE API ENDPOINTS
export const apiEndpoints = {
  // 🔐 AUTHENTICATION ENDPOINTS
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

  // 📈 POSITIONS ENDPOINTS
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

  // 💰 CASH OPERATIONS ENDPOINTS
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
    getByType: (type) => {
      console.log("💰 Getting cash operations by type:", type);
      return apiClient.get("/cash-operations", { params: { type } });
    },

    // Get cash balance
    getBalance: () => {
      console.log("💰 Getting cash balance");
      return apiClient.get("/cash-operations/balance");
    },

    // Get cash summary
    getSummary: (params = {}) => {
      console.log("💰 Getting cash summary:", params);
      return apiClient.get("/cash-operations/summary", { params });
    },
  },

  // 📋 PENDING ORDERS ENDPOINTS
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

  // 📊 ANALYTICS ENDPOINTS
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

  // 📁 FILE IMPORT ENDPOINTS
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

  // 🏥 HEALTH & SYSTEM ENDPOINTS
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
  },

  // 🔍 SEARCH ENDPOINTS
  search: {
    // Global search
    global: (query, params = {}) => {
      console.log("🔍 Global search:", query, params);
      return apiClient.get("/search", { params: { q: query, ...params } });
    },

    // Search symbols
    symbols: (query, params = {}) => {
      console.log("🔍 Symbol search:", query, params);
      return apiClient.get("/search/symbols", {
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
  },

  // 📱 NOTIFICATIONS ENDPOINTS
  notifications: {
    // Get all notifications
    getAll: (params = {}) => {
      console.log("📱 Getting notifications:", params);
      return apiClient.get("/notifications", { params });
    },

    // Mark as read
    markAsRead: (id) => {
      console.log("📱 Marking notification as read:", id);
      return apiClient.patch(`/notifications/${id}/read`);
    },

    // Mark all as read
    markAllAsRead: () => {
      console.log("📱 Marking all notifications as read");
      return apiClient.patch("/notifications/read-all");
    },

    // Delete notification
    delete: (id) => {
      console.log("📱 Deleting notification:", id);
      return apiClient.delete(`/notifications/${id}`);
    },

    // Get unread count
    getUnreadCount: () => {
      console.log("📱 Getting unread notification count");
      return apiClient.get("/notifications/unread-count");
    },
  },
};

// Export the axios instance as default
export default apiClient;
