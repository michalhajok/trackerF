/**
 * Dashboard Layout - Server Component (NO onClick handlers)
 * Uses separate Client Components for interactivity
 */

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LogoutButton from "@/components/ui/LogoutButton";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Server Component */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <a
                  href="/dashboard"
                  className="text-xl font-bold text-gray-900 hover:text-gray-700"
                >
                  Portfolio Manager
                </a>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-baseline space-x-4">
                <a
                  href="/dashboard"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/dashboard/positions"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Positions
                </a>
                <a
                  href="/dashboard/analytics"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </a>
                <a
                  href="/dashboard/orders"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Orders
                </a>
                <a
                  href="/dashboard/import"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Import
                </a>
              </nav>

              {/* Client Component for Logout - NO onClick in Server Component */}
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
