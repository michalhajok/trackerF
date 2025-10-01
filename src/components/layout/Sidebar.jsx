/**
 * Sidebar Navigation Component
 * Main navigation sidebar for dashboard
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  DollarSign,
  ClipboardList,
  BarChart3,
  Upload,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },

  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Portfolios", href: "/dashboard/portfolios", icon: Upload },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-surface-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-semibold text-slate-900">
                Portfolio Manager
              </span>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-surface-100"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${
                      isActive
                        ? "bg-primary-50 text-primary-600 border-r-2 border-primary-500"
                        : "text-slate-600 hover:bg-surface-100 hover:text-slate-900"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="px-6 py-6 border-t border-surface-200">
            {/* User info */}
            {user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            {/* Settings and Logout */}
            <div className="space-y-1">
              <Link
                href="/dashboard/settings"
                onClick={onClose}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-surface-100 hover:text-slate-900 transition-colors duration-200"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-surface-100 hover:text-slate-900 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
