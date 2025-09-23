/**
 * API Proxy Route - FIXED for Next.js 15 Async Params
 * Routes API calls from Next.js frontend to Express backend
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6000/api";
const BACKEND_TIMEOUT = 10000; // 10 seconds
const ENABLE_FALLBACK_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== "false";

export async function GET(request, { params }) {
  return handleRequest(request, params, "GET");
}

export async function POST(request, { params }) {
  return handleRequest(request, params, "POST");
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, "PUT");
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, "DELETE");
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, "PATCH");
}

export async function OPTIONS(request) {
  console.log("🔧 OPTIONS request received");

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With, X-Request-ID",
      "Access-Control-Max-Age": "86400",
    },
  });
}

async function handleRequest(request, params, method) {
  // FIXED: Await params before using its properties (Next.js 15)
  const { path } = await params;
  const pathString = Array.isArray(path) ? path.join("/") : path;

  console.log(`📡 Proxy Request: ${method} /${pathString}`);

  try {
    // First, try to connect to backend
    const backendResponse = await forwardToBackend(request, pathString, method);
    console.log(`✅ Backend response successful: ${method} /${pathString}`);
    return backendResponse;
  } catch (error) {
    console.warn(`⚠️ Backend connection failed: ${error.message}`);

    // If backend fails and mock is enabled, use fallback
    if (ENABLE_FALLBACK_MOCK) {
      console.log(
        `🎭 Using fallback mock response for: ${method} /${pathString}`
      );
      return await getMockResponse(request, pathString, method);
    }

    // Otherwise, return the backend error
    return createErrorResponse(error, 503);
  }
}

async function forwardToBackend(request, pathString, method) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE_URL}/${pathString}${url.search}`;

  console.log(`🔗 Forwarding to backend: ${targetUrl}`);

  // Prepare headers for backend
  const headers = new Headers();
  const headersToProxy = [
    "authorization",
    "content-type",
    "accept",
    "user-agent",
    "x-requested-with",
    "x-request-id",
    "x-api-key", // Add API key header if needed
  ];

  headersToProxy.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

  // Add user-agent if not present (some backends require this)
  if (!headers.get("user-agent")) {
    headers.set("user-agent", "NextJS-Proxy/1.0");
  }

  // Get request body for non-GET requests
  let body = undefined;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      body = await request.text();
      if (body && !headers.get("content-type")) {
        headers.set("content-type", "application/json");
      }
      console.log(`📝 Request body:`, body ? JSON.parse(body) : "empty");
    } catch (error) {
      console.error("Error reading request body:", error);
    }
  }

  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, BACKEND_TIMEOUT);

  try {
    // Forward request to backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📬 Backend responded with status: ${response.status}`);

    // Get response data
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    console.log(`📄 Backend response:`, responseData);

    // Check if backend returned error status
    if (!response.ok) {
      throw new Error(
        `Backend returned ${response.status}: ${
          responseData.message || "Unknown error"
        }`
      );
    }

    // Return backend response with CORS headers
    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "X-Forwarded-To": "backend",
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(`Backend timeout after ${BACKEND_TIMEOUT}ms`);
    }

    throw new Error(`Backend connection failed: ${error.message}`);
  }
}

async function getMockResponse(request, pathString, method) {
  console.log(`🎭 Fallback Mock Response: ${method} /${pathString}`);

  // Handle request body for POST/PUT/PATCH
  let body = {};
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (error) {
      console.warn("⚠️ Failed to parse request body:", error);
    }
  }

  // Mock auth responses (matching backend format)
  if (pathString.includes("auth/register")) {
    return createMockResponse({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: "mock_" + Date.now(),
          name: body.name || "Mock User",
          email: body.email || "mock@example.com",
          createdAt: new Date().toISOString(),
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 9),
      },
    });
  }

  if (pathString.includes("auth/login")) {
    return createMockResponse({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: "mock_user_123",
          name: "Mock User",
          email: body.email || "mock@example.com",
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 9),
      },
    });
  }

  if (pathString.includes("auth/logout")) {
    return createMockResponse({
      success: true,
      message: "Logout successful",
    });
  }

  if (pathString.includes("auth/me")) {
    return createMockResponse({
      success: true,
      data: {
        _id: "mock_user_123",
        name: "Mock User",
        email: "mock@example.com",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    });
  }

  // Generic responses for other endpoints
  if (["POST", "PUT", "PATCH"].includes(method)) {
    return createMockResponse({
      success: true,
      message: `${method} operation successful`,
      data: {
        _id: "mock_" + Date.now(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (method === "DELETE") {
    return createMockResponse({
      success: true,
      message: "Resource deleted successfully",
    });
  }

  // Default GET response
  return createMockResponse({
    success: true,
    data: [],
    message: `Mock data for ${pathString}`,
  });
}

function createMockResponse(data, status = 200) {
  console.log(`✅ Returning mock response:`, data);

  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "X-Mock-Response": "true",
    },
  });
}

function createErrorResponse(error, status = 500) {
  console.error(`❌ Proxy error:`, error.message);

  return new NextResponse(
    JSON.stringify({
      success: false,
      error: "Service unavailable",
      message: error.message || "Backend service is currently unavailable",
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
