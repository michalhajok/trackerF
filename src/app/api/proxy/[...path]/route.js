import { NextRequest, NextResponse } from "next/server";

// Import node-fetch for better compatibility
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:6000/api";
const BACKEND_TIMEOUT = 10000; // 10 seconds

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

  // 🔧 CRITICAL FIX: Detect FormData and handle properly
  const contentType = request.headers.get("content-type");
  const isFormData = contentType && contentType.includes("multipart/form-data");

  console.log(`🔍 Content-Type: ${contentType}`);
  console.log(`🔍 Is FormData: ${isFormData}`);

  // Handle different body types
  let requestBody = null;
  let requestBodyString = "";
  let requestBodyBuffer = null;

  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      if (isFormData) {
        // 🔧 CRITICAL FIX: For FormData, read as ArrayBuffer and convert to Buffer
        console.log(`📁 Processing FormData request`);
        const arrayBuffer = await request.arrayBuffer();
        requestBodyBuffer = Buffer.from(arrayBuffer);
        requestBodyString = "[FormData Buffer]";
        console.log(
          `📁 FormData converted to Buffer: ${requestBodyBuffer.length} bytes`
        );
      } else {
        // Existing JSON handling
        requestBodyString = await request.text();
        if (requestBodyString) {
          requestBody = JSON.parse(requestBodyString);
          console.log(`📝 Request body:`, requestBody);
        }
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
      requestBodyBuffer,
      request,
      isFormData
    );

    console.log(`✅ Backend response successful: ${method} /${pathString}`);
    return backendResponse;
  } catch (error) {
    console.error(`❌ Backend connection failed: ${error.message}`);
    return createErrorResponse(error, 503);
  }
}

async function forwardToBackend(
  pathString,
  method,
  requestBodyString,
  requestBodyBuffer,
  request,
  isFormData = false
) {
  // Construct target URL
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const cleanPath = pathString.startsWith("/")
    ? pathString.slice(1)
    : pathString;

  const urlObj = new URL(request.url);
  const queryString = urlObj.search; // np. "?page=1&limit=20&..."
  const targetUrl = `${baseUrl}/${cleanPath}${queryString}`;

  console.log(`🔗 Target URL: ${targetUrl}`);

  // 🔧 ENHANCED: Prepare headers based on content type
  const headers = {
    Accept: "application/json",
    "User-Agent": "NextJS-Proxy/1.0",
  };

  // 🔧 CRITICAL: Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    // For FormData, preserve the original Content-Type with boundary
    const originalContentType = request.headers.get("content-type");
    if (originalContentType) {
      headers["Content-Type"] = originalContentType;
      console.log(
        `📁 Preserving FormData Content-Type: ${originalContentType}`
      );
    }
  }

  // Add authorization header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
    console.log(
      `📤 Added Authorization header: ${authHeader.substring(0, 20)}...`
    );
  }

  console.log(`📤 Final headers:`, {
    ...headers,
    Authorization: headers.Authorization ? "Bearer ***" : "NONE",
  });

  try {
    console.log(`🚀 Making node-fetch request to: ${targetUrl}`);
    console.log(`🚀 Method: ${method}`);
    console.log(`🚀 Body type: ${isFormData ? "FormData Buffer" : "JSON"}`);

    // 🔧 ENHANCED: Use node-fetch with proper body handling
    const fetchOptions = {
      method: method,
      headers: headers,
      timeout: BACKEND_TIMEOUT,
    };

    // 🔧 CRITICAL FIX: Use Buffer for FormData instead of stream
    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (isFormData && requestBodyBuffer) {
        // For FormData, use the Buffer
        fetchOptions.body = requestBodyBuffer;
        console.log(
          `📁 Using FormData Buffer: ${requestBodyBuffer.length} bytes`
        );
      } else if (!isFormData && requestBodyString) {
        // For JSON, use the string body
        fetchOptions.body = requestBodyString;
        console.log(`📄 Using JSON body string`);
      }
    }

    console.log(`🚀 Fetch options prepared`);

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
