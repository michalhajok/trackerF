/**
 * AppLayout - FIXED IMPORT PATH
 * Main Application Layout with correct import
 */

"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import LogoutButton from "@/components/ui/LogoutButton";

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Portfolios", href: "/dashboard/portfolios" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a
                href="/dashboard"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                Portfolio Manager
              </a>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <span className="text-gray-700 text-sm">
                  Welcome, {user?.name || user?.email || "User"}
                </span>
              </div>

              <LogoutButton />

              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pb-3 pt-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2 text-gray-700 text-sm">
                  {user?.name || user?.email || "User"}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            © 2025 Portfolio Manager. Professional portfolio management
            application.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
