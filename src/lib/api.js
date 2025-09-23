/**
 * API Client for Portfolio Manager Frontend
 * Central HTTP client with axios configuration
 */

import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = generateRequestId();

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);

    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.warn("Access denied to resource");
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Generate unique request ID
function generateRequestId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (userData) => api.post("/auth/register", userData),
    logout: () => api.post("/auth/logout"),
    refresh: () => api.post("/auth/refresh"),
    me: () => api.get("/auth/me"),
  },

  // Positions
  positions: {
    getAll: (params) => api.get("/positions", { params }),
    getById: (id) => api.get(`/positions/${id}`),
    create: (data) => api.post("/positions", data),
    update: (id, data) => api.put(`/positions/${id}`, data),
    delete: (id) => api.delete(`/positions/${id}`),
    close: (id, data) => api.put(`/positions/${id}/close`, data),
  },

  // Cash Operations
  cashOperations: {
    getAll: (params) => api.get("/cash-operations", { params }),
    getById: (id) => api.get(`/cash-operations/${id}`),
    create: (data) => api.post("/cash-operations", data),
    update: (id, data) => api.put(`/cash-operations/${id}`, data),
    delete: (id) => api.delete(`/cash-operations/${id}`),
  },

  // Pending Orders
  orders: {
    getAll: (params) => api.get("/pending-orders", { params }),
    getById: (id) => api.get(`/pending-orders/${id}`),
    create: (data) => api.post("/pending-orders", data),
    update: (id, data) => api.put(`/pending-orders/${id}`, data),
    delete: (id) => api.delete(`/pending-orders/${id}`),
    execute: (id, data) => api.put(`/pending-orders/${id}/execute`, data),
  },

  // Analytics
  analytics: {
    getDashboard: () => api.get("/analytics/dashboard"),
    getPerformance: (params) => api.get("/analytics/performance", { params }),
    getAllocation: (params) => api.get("/analytics/allocation", { params }),
    getStatistics: (params) => api.get("/analytics/statistics", { params }),
  },

  // File Import
  import: {
    upload: (formData) =>
      api.post("/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    getHistory: () => api.get("/import/history"),
    getStatus: (id) => api.get(`/import/${id}/status`),
  },
};

export default api;
