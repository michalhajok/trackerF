"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for performance
const MarketDataManager = dynamic(
  () => import("@/components/features/MarketData/MarketDataManager"),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-100 animate-pulse rounded w-48"></div>
          <div className="h-10 bg-gray-100 animate-pulse rounded w-32"></div>
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-100 animate-pulse rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 animate-pulse rounded"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent>
            <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    ),
    ssr: false,
  }
);

export default function MarketDataPage() {
  const { portfolioId } = useParams();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Market Data</h1>
          <p className="text-gray-600">Real-time market quotes and analysis</p>
        </div>
      </div>

      <MarketDataManager portfolioId={portfolioId} />
    </div>
  );
}
