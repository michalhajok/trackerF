"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

// Dynamic imports for performance
const MarketDataManager = dynamic(
  () => import("@/components/features/MarketData/MarketDataManager"),
  { loading: () => <SkeletonLoader /> }
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
