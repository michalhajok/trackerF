// src/app/(dashboard)/layout.js
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* FIXED: No onClick handlers in Server Component */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/dashboard" className="text-xl font-bold text-gray-900">
                Portfolio Manager
              </a>

              <nav className="hidden md:flex items-baseline space-x-4">
                <a
                  href="/dashboard"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2"
                >
                  Dashboard
                </a>
                <a
                  href="/dashboard/positions"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2"
                >
                  Positions
                </a>
                <a
                  href="/dashboard/analytics"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2"
                >
                  Analytics
                </a>
              </nav>

              {/* FIXED: Simple link instead of onClick button */}
              <a
                href="/login"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }
                }}
              >
                Logout
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
