/**
 * Header Component
 * Top navigation header for dashboard
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const pageNames = {
  "/dashboard": "Dashboard",
  "/dashboard/positions": "Positions",
  "/dashboard/cash-operations": "Cash Operations",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/import": "Import",
  "/dashboard/settings": "Settings",
};

export default function Header({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { user } = useAuth();

  const currentPageName = pageNames[pathname] || "Portfolio Manager";

  return (
    <header className="bg-white border-b border-surface-200 h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-surface-100 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Page title */}
          <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-slate-900">
            {currentPageName}
          </h1>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search positions, operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search button for mobile */}
          <button className="md:hidden p-2 rounded-md hover:bg-surface-100 transition-colors duration-200">
            <Search className="w-5 h-5 text-slate-600" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-surface-100 transition-colors duration-200 relative">
            <Bell className="w-5 h-5 text-slate-600" />
            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center p-2 rounded-md hover:bg-surface-100 transition-colors duration-200">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                {user?.name ? (
                  <span className="text-sm font-medium text-primary-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-primary-600" />
                )}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
