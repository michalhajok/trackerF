"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, SelectOption } from "@/components/ui/Select";
import { Download } from "lucide-react";
import { apiEndpoints } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { exportToCsv } from "@/lib/export";
import AnalyticsMetrics from "./AnalyticsMetrics";
import PerformanceChart from "./PerformanceChart";
import AllocationChart from "./AllocationChart";
import TradingStatistics from "./TradingStatistics";

const PERIOD_OPTIONS = [
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "6M", label: "6 Months" },
  { value: "1Y", label: "1 Year" },
  { value: "ALL", label: "All Time" },
];

const ALLOCATION_GROUP_OPTIONS = [
  { value: "symbol", label: "By Symbol" },
  { value: "sector", label: "By Sector" },
  { value: "currency", label: "By Currency" },
  { value: "exchange", label: "By Exchange" },
];

export default function AnalyticsManager({ portfolioId }) {
  const { notify } = useToast();
  const [period, setPeriod] = useState("1Y");
  const [allocationGroupBy, setAllocationGroupBy] = useState("symbol");

  // API Queries
  const {
    data: performanceData,
    isLoading: performanceLoading,
    isError: performanceError,
  } = useQuery({
    queryKey: ["analytics", "performance", portfolioId, period],
    queryFn: () =>
      apiEndpoints.analytics.getPerformance({
        portfolioId,
        period,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: allocationData,
    isLoading: allocationLoading,
    isError: allocationError,
  } = useQuery({
    queryKey: ["analytics", "allocation", portfolioId, allocationGroupBy],
    queryFn: () =>
      apiEndpoints.analytics.getAllocation({
        portfolioId,
        groupBy: allocationGroupBy,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    isError: statisticsError,
  } = useQuery({
    queryKey: ["analytics", "statistics", portfolioId, period],
    queryFn: () =>
      apiEndpoints.analytics.getStatistics({
        portfolioId,
        period,
      }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Extract data with fallbacks
  const performance = performanceData?.data || {};
  const allocation = allocationData?.data || {};
  const statistics = statisticsData?.data || {};

  const handleExportAnalytics = async () => {
    try {
      const exportData = {
        performance,
        allocation,
        statistics,
        period,
        portfolioId,
        exportDate: new Date().toISOString(),
      };

      await exportToCsv(
        [exportData],
        `portfolio-analytics-${portfolioId}-${period}`
      );
      notify({
        title: "Sukces",
        message: "Analytics zostały wyeksportowane",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Błąd",
        message: "Nie udało się wyeksportować analytics",
        type: "error",
      });
    }
  };

  const isLoading =
    performanceLoading || allocationLoading || statisticsLoading;
  const hasError = performanceError || allocationError || statisticsError;

  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Nie udało się pobrać danych analytics</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Select period"
          >
            {PERIOD_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>

          <Select
            value={allocationGroupBy}
            onChange={(e) => setAllocationGroupBy(e.target.value)}
            placeholder="Group by"
          >
            {ALLOCATION_GROUP_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleExportAnalytics}
          disabled={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analytics
        </Button>
      </div>

      {/* Performance Metrics */}
      <AnalyticsMetrics
        performance={performance}
        isLoading={performanceLoading}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <PerformanceChart
          data={performance.timeline || []}
          period={period}
          isLoading={performanceLoading}
        />

        {/* Allocation Chart */}
        <AllocationChart
          data={allocation.allocation || []}
          groupBy={allocationGroupBy}
          isLoading={allocationLoading}
        />
      </div>

      {/* Trading Statistics */}
      <TradingStatistics
        statistics={statistics}
        isLoading={statisticsLoading}
      />
    </div>
  );
}
