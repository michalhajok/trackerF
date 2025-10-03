"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for performance
const CashOperationsManager = dynamic(
  () => import("@/components/features/CashOperations/CashOperationsManager"),
  {
    loading: () => (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Operacje gotówkowe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const CashOperationsFilters = dynamic(
  () => import("@/components/features/CashOperations/CashOperationsFilters"),
  {
    loading: () => (
      <div className="h-16 bg-gray-100 animate-pulse rounded mb-4"></div>
    ),
  }
);

export default function CashOperationsPage() {
  const { portfolioId } = useParams();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Operacje gotówkowe</h1>
      </div>

      <CashOperationsManager portfolioId={portfolioId} />
    </div>
  );
}
