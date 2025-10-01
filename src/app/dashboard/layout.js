/**
 * Dashboard Layout - Server Component (NO onClick handlers)
 * Uses separate Client Components for interactivity
 */

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
// import App from "next/app";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
