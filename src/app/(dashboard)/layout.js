/**
 * Dashboard Layout - NO useAuth dependency
 * Simple layout that doesn't require AuthContext
 */

import ProtectedRoute from "@/components/layout/ProtectedRoute";

export const metadata = {
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description:
    "Portfolio Manager Dashboard - Track and manage your investment portfolio",
};

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <div className="bg-white border-b border-gray-200">
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

              {/* Simple Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/dashboard/positions"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Positions
                  </a>
                  <a
                    href="/dashboard/analytics"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Analytics
                  </a>
                  <a
                    href="/dashboard/orders"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Orders
                  </a>
                  <a
                    href="/dashboard/import"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Import
                  </a>
                </div>
              </div>

              {/* Simple Logout */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium border border-gray-300 hover:border-gray-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
