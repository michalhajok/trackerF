/**
 * Dashboard Layout
 * Protected layout for dashboard routes using App Router
 */

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

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
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
