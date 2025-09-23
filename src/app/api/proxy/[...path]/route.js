/**
 * API Proxy Route with Mock Fallback
 * Proxy route for backend API calls with CORS handling and mock responses
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const ENABLE_MOCK = process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== "false";

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
  try {
    const { path } = params;
    const pathString = Array.isArray(path) ? path.join("/") : path;

    console.log(`📡 Proxy Request: ${method} /${pathString}`);

    // Try to reach backend first
    if (process.env.NODE_ENV === "production" || !ENABLE_MOCK) {
      return await forwardToBackend(request, pathString, method);
    }

    // In development, try backend first, then fallback to mock
    try {
      return await forwardToBackend(request, pathString, method, 5000); // 5 second timeout
    } catch (error) {
      console.log(
        `🔄 Backend unavailable, using mock response for: ${method} /${pathString}`
      );
      return await getMockResponse(request, pathString, method);
    }
  } catch (error) {
    console.error("API Proxy Error:", error);
    return createErrorResponse(error);
  }
}

async function forwardToBackend(request, pathString, method, timeout = 30000) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE_URL}/${pathString}${url.search}`;

  // Prepare headers
  const headers = new Headers();
  const headersToProxy = [
    "authorization",
    "content-type",
    "accept",
    "user-agent",
    "x-requested-with",
    "x-request-id",
  ];

  headersToProxy.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

  // Get request body for POST/PUT/PATCH
  let body = undefined;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      body = await request.text();
      if (body && !headers.get("content-type")) {
        headers.set("content-type", "application/json");
      }
    } catch (error) {
      console.error("Error reading request body:", error);
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Make the proxied request
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Get response data
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Return response with CORS headers
    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Backend request timeout");
    }
    throw error;
  }
}

async function getMockResponse(request, pathString, method) {
  console.log(`🎭 Mock Response: ${method} /${pathString}`);

  // Auth endpoints
  if (pathString.includes("auth/register")) {
    const body = method === "POST" ? await request.json() : {};
    return createMockResponse({
      success: true,
      message: "User registered successfully (MOCK)",
      data: {
        user: {
          id: "mock_user_" + Date.now(),
          name: body.name || "Mock User",
          email: body.email || "mock@example.com",
          createdAt: new Date().toISOString(),
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 9),
      },
    });
  }

  if (pathString.includes("auth/login")) {
    const body = method === "POST" ? await request.json() : {};
    return createMockResponse({
      success: true,
      message: "Login successful (MOCK)",
      data: {
        user: {
          id: "mock_user_123",
          name: "Mock User",
          email: body.email || "mock@example.com",
          lastLoginAt: new Date().toISOString(),
        },
        token: "mock_jwt_token_" + Math.random().toString(36).substr(2, 9),
      },
    });
  }

  if (pathString.includes("auth/me")) {
    return createMockResponse({
      success: true,
      data: {
        id: "mock_user_123",
        name: "Mock User",
        email: "mock@example.com",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    });
  }

  if (pathString.includes("auth/logout")) {
    return createMockResponse({
      success: true,
      message: "Logged out successfully (MOCK)",
    });
  }

  // Dashboard stats
  if (pathString.includes("analytics/dashboard")) {
    return createMockResponse({
      success: true,
      data: {
        totalValue: 125000,
        totalReturn: 15.5,
        totalReturnAbsolute: 16875,
        openPositions: 8,
        cashBalance: 5000,
        dayChange: 2.3,
        dayChangeAbsolute: 2875,
      },
    });
  }

  // Positions
  if (pathString.includes("positions") && method === "GET") {
    return createMockResponse({
      success: true,
      data: [
        {
          _id: "pos_1",
          symbol: "AAPL",
          name: "Apple Inc.",
          type: "BUY",
          volume: 100,
          openPrice: 150.0,
          marketPrice: 165.0,
          currentValue: 16500,
          originalValue: 15000,
          grossPL: 1500,
          plPercentage: 10.0,
          status: "open",
          openTime: "2025-09-01T10:00:00.000Z",
        },
        {
          _id: "pos_2",
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          type: "BUY",
          volume: 50,
          openPrice: 2800.0,
          closePrice: 2950.0,
          saleValue: 147500,
          originalValue: 140000,
          grossPL: 7500,
          plPercentage: 5.36,
          status: "closed",
          openTime: "2025-08-15T14:30:00.000Z",
          closeTime: "2025-09-20T11:45:00.000Z",
        },
      ],
    });
  }

  // Cash operations
  if (pathString.includes("cash-operations") && method === "GET") {
    return createMockResponse({
      success: true,
      data: [
        {
          _id: "cash_1",
          type: "deposit",
          amount: 10000,
          currency: "USD",
          time: "2025-09-01T09:00:00.000Z",
          comment: "Initial deposit (MOCK)",
          category: "funding",
        },
        {
          _id: "cash_2",
          type: "dividend",
          amount: 250,
          currency: "USD",
          time: "2025-09-15T12:00:00.000Z",
          comment: "AAPL dividend payment (MOCK)",
          category: "dividend",
        },
      ],
    });
  }

  // Orders
  if (pathString.includes("orders") && method === "GET") {
    return createMockResponse({
      success: true,
      data: [
        {
          _id: "order_1",
          symbol: "TSLA",
          side: "BUY",
          type: "limit",
          volume: 25,
          price: 250.0,
          status: "pending",
          validUntil: "2025-09-30T23:59:59.000Z",
          createdAt: "2025-09-23T10:00:00.000Z",
        },
      ],
    });
  }

  // Generic create/update responses
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const body = await request.json().catch(() => ({}));
    return createMockResponse({
      success: true,
      message: `${method} operation successful (MOCK)`,
      data: {
        id: "mock_" + Date.now(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  // Generic DELETE response
  if (method === "DELETE") {
    return createMockResponse({
      success: true,
      message: "Resource deleted successfully (MOCK)",
    });
  }

  // Default response
  return createMockResponse({
    success: true,
    message: "Mock API response - Backend not available",
    data: {},
    mock: true,
    path: pathString,
    method: method,
  });
}

function createMockResponse(data, status = 200) {
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
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: "Internal server error",
      message: error.message || "Something went wrong",
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
