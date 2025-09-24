/**
 * STANDALONE Dashboard Page - NO AuthProvider dependency
 * Direct localStorage access, no context needed
 */

"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalValue: "$124,563.89",
    todayPL: "+$2,341.22",
    openPositions: 23,
    cashAvailable: "$15,234.50",
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Direct auth check - no context
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        console.log("🔍 Dashboard: Checking auth directly");

        if (!token || !userStr) {
          console.log("❌ No auth found - redirecting to login");
          window.location.href = "/login";
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        console.log("✅ Dashboard: User authenticated:", userData.name);

        // Simulate data loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("❌ Dashboard auth check failed:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    };

    checkAuthAndLoadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Portfolio Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user?.name || "Trader"}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {dashboardData.totalValue}
          </div>
          <div className="text-sm text-gray-600">Total Portfolio</div>
          <div className="flex items-center mt-3">
            <div className="flex items-center text-green-600 text-sm font-medium">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              +12.5%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {dashboardData.todayPL}
          </div>
          <div className="text-sm text-gray-600">Todays P&L</div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mt-3 inline-block">
            Profitable Day
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {dashboardData.openPositions}
          </div>
          <div className="text-sm text-gray-600">Open Positions</div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mt-3 inline-block">
            Active
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {dashboardData.cashAvailable}
          </div>
          <div className="text-sm text-gray-600">Cash Available</div>
          <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium mt-3 inline-block">
            Ready to Invest
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/dashboard/positions"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors block text-center"
            >
              View Positions
            </a>
            <a
              href="/dashboard/analytics"
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors block text-center"
            >
              View Analytics
            </a>
            <a
              href="/dashboard/orders"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors block text-center"
            >
              View Orders
            </a>
            <a
              href="/dashboard/import"
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors block text-center"
            >
              Import Data
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <div className="text-sm text-gray-500">Role: {user?.role}</div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
