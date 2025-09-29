/**
 * LogoutButton - Client Component for logout functionality
 * Separate from Server Component to handle onClick
 */

"use client";

import React from "react";

export default function LogoutButton({ className = "" }) {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      Logout
    </button>
  );
}
