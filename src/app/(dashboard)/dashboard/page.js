/**
 * Dashboard Page - HARDCODED TOKEN TEST
 * Tests with hardcoded valid JWT to isolate problem
 */

"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [tokenDebug, setTokenDebug] = useState({});

  useEffect(() => {
    const debugAndTest = async () => {
      try {
        setLoading(true);

        // 1. DEBUG localStorage
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user");

        console.log("🔍 DEBUGGING TOKENS:");
        console.log("Raw stored token:", storedToken);
        console.log("Token type:", typeof storedToken);
        console.log("Token is null:", storedToken === null);
        console.log("Token is undefined:", storedToken === undefined);
        console.log("Token length:", storedToken?.length);

        const debug = {
          stored: storedToken
            ? `${storedToken.substring(0, 30)}...`
            : "NULL/UNDEFINED",
          type: typeof storedToken,
          length: storedToken?.length || 0,
          isNull: storedToken === null,
          isUndefined: storedToken === undefined,
        };

        setTokenDebug(debug);

        // 2. Parse user if available
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("✅ User data:", userData.name);
          } catch (e) {
            console.error("❌ Failed to parse user:", e);
          }
        }

        // 3. TEST with different tokens
        console.log("🔍 Testing different token scenarios...");

        // Test 1: Use stored token (if exists and valid)
        if (
          storedToken &&
          storedToken !== "undefined" &&
          storedToken.length > 20
        ) {
          console.log("🔍 Test 1: Using stored token");
          const result1 = await testApiCall("Stored Token", storedToken);
          if (result1.success) {
            console.log("✅ Stored token works!");
            setLoading(false);
            return;
          }
        }

        // Test 2: Try to get fresh token via re-login API call
        console.log("🔍 Test 2: Getting fresh token");
        try {
          // Simulate a fresh login to get new token
          const loginResponse = await fetch("/api/proxy/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken || "test"}`,
              "Content-Type": "application/json",
            },
          });

          if (loginResponse.ok) {
            console.log("✅ /auth/me worked with current token");
          } else {
            console.log("❌ /auth/me failed, token may be invalid");
            setError("Token appears to be invalid. Please login again.");

            // Clear invalid auth and redirect
            setTimeout(() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }, 3000);
          }
        } catch (error) {
          console.error("❌ Auth test failed:", error);
          setError("Failed to validate authentication. Please login again.");
        }
      } catch (error) {
        console.error("❌ Debug error:", error);
        setError("Failed to initialize dashboard: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    debugAndTest();
  }, []);

  // Test API call function
  const testApiCall = async (testName, token) => {
    try {
      console.log(`🔍 ${testName} - Testing API call`);
      console.log(
        `🔍 ${testName} - Token:`,
        token ? `${token.substring(0, 30)}...` : "MISSING"
      );

      const response = await fetch("/api/proxy/positions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`🔍 ${testName} - Response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testName} - SUCCESS:`, data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log(`❌ ${testName} - FAILED:`, response.status, errorText);
        return { success: false, error: errorText, status: response.status };
      }
    } catch (error) {
      console.error(`❌ ${testName} - ERROR:`, error);
      return { success: false, error: error.message };
    }
  };

  if (loading) {
    return <LoadingSpinner message="Debugging authentication..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard - Token Debug Mode
        </h1>
        <p className="text-gray-600">Welcome back, {user?.name || "Trader"}!</p>
      </div>

      {/* Token Debug Info */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-3">🔍 Token Debug Information:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Stored Token:</strong> {tokenDebug.stored}
          </div>
          <div>
            <strong>Type:</strong> {tokenDebug.type}
          </div>
          <div>
            <strong>Length:</strong> {tokenDebug.length}
          </div>
          <div>
            <strong>Is Null:</strong> {tokenDebug.isNull ? "YES" : "NO"}
          </div>
          <div>
            <strong>Is Undefined:</strong>{" "}
            {tokenDebug.isUndefined ? "YES" : "NO"}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" className="mb-6" title="Authentication Error">
          {error}
        </Alert>
      )}

      {/* Debug Actions */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-3">🔧 Debug Actions:</h3>
        <div className="space-x-2">
          <button
            onClick={() => {
              const token = localStorage.getItem("auth_token");
              console.log("Manual token check:", token);
              alert(
                `Token: ${
                  token ? token.substring(0, 50) + "..." : "NULL/UNDEFINED"
                }`
              );
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
          >
            Check Token
          </button>

          <button
            onClick={async () => {
              const token = localStorage.getItem("auth_token");
              if (token && token !== "undefined") {
                await testApiCall("Manual Test", token);
              } else {
                alert("No valid token found!");
              }
            }}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded"
          >
            Test API Call
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded"
          >
            Clear & Re-login
          </button>
        </div>
      </div>

      {/* Mock Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            $124,563.89
          </div>
          <div className="text-sm text-gray-600">Total Portfolio (Mock)</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-2">
            +$2,341.22
          </div>
          <div className="text-sm text-gray-600">Todays P&L (Mock)</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">23</div>
          <div className="text-sm text-gray-600">Open Positions (Mock)</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            $15,234.50
          </div>
          <div className="text-sm text-gray-600">Cash Available (Mock)</div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>Dashboard running in TOKEN DEBUG MODE</p>
        <p>Check console for detailed token analysis</p>
      </div>
    </div>
  );
}
