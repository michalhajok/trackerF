/**
 * API Proxy Route
 * Proxy route for backend API calls with CORS handling
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

async function handleRequest(request, params, method) {
  try {
    const { path } = params;
    const pathString = Array.isArray(path) ? path.join("/") : path;

    // Construct the target URL
    const url = new URL(request.url);
    const targetUrl = `${API_BASE_URL}/${pathString}${url.search}`;

    // Get headers from the original request
    const headers = new Headers();

    // Copy important headers
    const headersToProxy = [
      "authorization",
      "content-type",
      "accept",
      "user-agent",
      "x-requested-with",
    ];

    headersToProxy.forEach((header) => {
      const value = request.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    });

    // Add CORS headers for preflight
    if (method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Get request body for POST/PUT/PATCH requests
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

    // Make the proxied request
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Get response data
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Create response with CORS headers
    const nextResponse = new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

    return nextResponse;
  } catch (error) {
    console.error("API Proxy Error:", error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Proxy request failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
