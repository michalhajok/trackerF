/**
 * API Client with Enhanced Response Debugging
 * Fixed response parsing and error handling
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

// API Endpoints
export const apiEndpoints = {
  // Authentication endpoints
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
  },

  // Other endpoints remain the same...
  positions: {
    getAll: (params = {}) => apiClient.get("/positions", { params }),
    getById: (id) => apiClient.get(`/positions/${id}`),
    create: (data) => apiClient.post("/positions", data),
    update: (id, data) => apiClient.put(`/positions/${id}`, data),
    delete: (id) => apiClient.delete(`/positions/${id}`),
  },
};

// Export the axios instance as default
export default apiClient;
