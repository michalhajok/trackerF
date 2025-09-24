/**
 * API Proxy Route - DISABLED MOCK RESPONSES
 * Routes API calls from Next.js frontend to Express backend
 * Fixed to always use real backend, never mock responses
 */

import { NextRequest, NextResponse } from "next/server";

// Import node-fetch for better compatibility
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6000/api";
const BACKEND_TIMEOUT = 10000; // 10 seconds

// DISABLED MOCK - Always try real backend
const ENABLE_FALLBACK_MOCK = false; // ❌ DISABLED - no more mock responses!

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
  console.log(`🌐 API_BASE_URL: ${API_BASE_URL}`);

  // Read request body once and store it
  let requestBody = null;
  let requestBodyString = "";

  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      requestBodyString = await request.text();
      if (requestBodyString) {
        requestBody = JSON.parse(requestBodyString);
        console.log(`📝 Request body:`, requestBody);
      }
    } catch (error) {
      console.error("Error reading request body:", error);
    }
  }

  try {
    // Always try to connect to real backend
    const backendResponse = await forwardToBackend(
      pathString,
      method,
      requestBodyString,
      request
    );

    console.log(`✅ Backend response successful: ${method} /${pathString}`);
    return backendResponse;
  } catch (error) {
    console.error(`❌ Backend connection failed: ${error.message}`);

    // REMOVED MOCK FALLBACK - Always return backend error
    console.error(`❌ No fallback - returning backend error`);
    return createErrorResponse(error, 503);
  }
}

async function forwardToBackend(
  pathString,
  method,
  requestBodyString,
  request
) {
  // Construct target URL
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const cleanPath = pathString.startsWith("/")
    ? pathString.slice(1)
    : pathString;
  const targetUrl = `${baseUrl}/${cleanPath}`;

  console.log(`🔗 Target URL: ${targetUrl}`);

  // Prepare headers
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "NextJS-Proxy/1.0",
  };

  // Add authorization header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
    console.log(
      `📤 Added Authorization header: ${authHeader.substring(0, 20)}...`
    );
  }

  console.log(`📤 Final headers:`, headers);

  try {
    console.log(`🚀 Making node-fetch request to: ${targetUrl}`);
    console.log(`🚀 Method: ${method}`);
    console.log(`🚀 Body: ${requestBodyString || "undefined"}`);

    // Use node-fetch with explicit configuration
    const fetchOptions = {
      method: method,
      headers: headers,
      timeout: BACKEND_TIMEOUT,
    };

    // Only add body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method) && requestBodyString) {
      fetchOptions.body = requestBodyString;
    }

    console.log(`🚀 Fetch options:`, fetchOptions);

    // Make the request using node-fetch
    const response = await fetch(targetUrl, fetchOptions);

    console.log(`📬 Backend responded with status: ${response.status}`);

    // Get response data
    const responseText = await response.text();
    console.log(
      `📄 Response text:`,
      responseText.substring(0, 200) + (responseText.length > 200 ? "..." : "")
    );

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log(`📄 Parsed response success`);
    } catch (parseError) {
      console.warn(`⚠️ Failed to parse response as JSON:`, parseError.message);
      responseData = { message: responseText };
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
        "X-Backend-Status": response.status.toString(),
      },
    });
  } catch (error) {
    console.error(`❌ node-fetch error:`, {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    if (error.name === "FetchError") {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          `Connection refused: Backend not running on ${targetUrl}`
        );
      }
      if (error.code === "ETIMEDOUT") {
        throw new Error(
          `Connection timeout: Backend did not respond within ${BACKEND_TIMEOUT}ms`
        );
      }
    }

    throw new Error(`Backend connection failed: ${error.message}`);
  }
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
