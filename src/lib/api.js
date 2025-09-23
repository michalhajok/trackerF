/**
 * API Client Configuration for Portfolio Manager
 * HTTP client setup with proper error handling and proxy support
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

// Response interceptor
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
          data: response.data,
        }
      );
    }

    // Return response data directly
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

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
        case 429:
          console.warn("Rate limit exceeded");
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error("Server error:", data);
          break;
      }

      // Return structured error
      return Promise.reject({
        message: data?.message || `Request failed with status ${status}`,
        status,
        data,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error - no response received");
      return Promise.reject({
        message: "Network error - please check your connection",
        type: "network",
      });
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
      return Promise.reject({
        message: error.message || "Request failed",
        type: "setup",
      });
    }
  }
);

// Generate unique request ID
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// API Endpoints
export const apiEndpoints = {
  // Authentication endpoints
  auth: {
    login: (credentials) => apiClient.post("/auth/login", credentials),
    register: (userData) => apiClient.post("/auth/register", userData),
    logout: () => apiClient.post("/auth/logout"),
    me: () => apiClient.get("/auth/me"),
    refresh: () => apiClient.post("/auth/refresh"),
    changePassword: (data) => apiClient.post("/auth/change-password", data),
  },

  // Positions endpoints
  positions: {
    getAll: (params = {}) => apiClient.get("/positions", { params }),
    getById: (id) => apiClient.get(`/positions/${id}`),
    create: (data) => apiClient.post("/positions", data),
    update: (id, data) => apiClient.put(`/positions/${id}`, data),
    delete: (id) => apiClient.delete(`/positions/${id}`),
    close: (id, data) => apiClient.post(`/positions/${id}/close`, data),
    getSummary: (params = {}) =>
      apiClient.get("/positions/summary", { params }),
    getPerformance: (id, params = {}) =>
      apiClient.get(`/positions/${id}/performance`, { params }),
  },

  // Cash operations endpoints
  cashOperations: {
    getAll: (params = {}) => apiClient.get("/cash-operations", { params }),
    getById: (id) => apiClient.get(`/cash-operations/${id}`),
    create: (data) => apiClient.post("/cash-operations", data),
    update: (id, data) => apiClient.put(`/cash-operations/${id}`, data),
    delete: (id) => apiClient.delete(`/cash-operations/${id}`),
    getSummary: (params = {}) =>
      apiClient.get("/cash-operations/summary", { params }),
    getCashFlow: (params = {}) =>
      apiClient.get("/cash-operations/cash-flow", { params }),
    getBalanceHistory: (params = {}) =>
      apiClient.get("/cash-operations/balance-history", { params }),
  },

  // Orders endpoints
  orders: {
    getAll: (params = {}) => apiClient.get("/orders", { params }),
    getById: (id) => apiClient.get(`/orders/${id}`),
    create: (data) => apiClient.post("/orders", data),
    update: (id, data) => apiClient.put(`/orders/${id}`, data),
    delete: (id) => apiClient.delete(`/orders/${id}`),
    cancel: (id) => apiClient.post(`/orders/${id}/cancel`),
    execute: (id, data) => apiClient.post(`/orders/${id}/execute`, data),
    getSummary: (params = {}) => apiClient.get("/orders/summary", { params }),
    getByPosition: (positionId) =>
      apiClient.get(`/orders/position/${positionId}`),
  },

  // Analytics endpoints
  analytics: {
    getDashboardStats: (params = {}) =>
      apiClient.get("/analytics/dashboard", { params }),
    getPortfolioChart: (params = {}) =>
      apiClient.get("/analytics/portfolio-chart", { params }),
    getAllocation: (params = {}) =>
      apiClient.get("/analytics/allocation", { params }),
    getPerformanceChart: (params = {}) =>
      apiClient.get("/analytics/performance-chart", { params }),
    getPerformanceStats: (params = {}) =>
      apiClient.get("/analytics/performance-stats", { params }),
    getStatsSummary: (params = {}) =>
      apiClient.get("/analytics/stats-summary", { params }),
    getMetrics: (params = {}) =>
      apiClient.get("/analytics/metrics", { params }),
    getRiskAnalysis: (params = {}) =>
      apiClient.get("/analytics/risk-analysis", { params }),
  },

  // Import/Export endpoints
  import: {
    uploadFile: (file, type) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      return apiClient.post("/import/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    getHistory: () => apiClient.get("/import/history"),
    getTemplate: (type) => apiClient.get(`/import/template/${type}`),
    getStatus: (id) => apiClient.get(`/import/${id}/status`),
  },

  // Settings endpoints
  settings: {
    getProfile: () => apiClient.get("/settings/profile"),
    updateProfile: (data) => apiClient.put("/settings/profile", data),
    getPreferences: () => apiClient.get("/settings/preferences"),
    updatePreferences: (data) => apiClient.put("/settings/preferences", data),
    changePassword: (data) => apiClient.post("/settings/change-password", data),
    exportData: (params = {}) =>
      apiClient.get("/settings/export-data", { params }),
    deleteAccount: (data) => apiClient.delete("/settings/account", { data }),
  },
};

// Export the axios instance as default
export default apiClient;
