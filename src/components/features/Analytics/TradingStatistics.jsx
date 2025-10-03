"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function TradingStatistics({ statistics, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Trades",
      value: statistics.trading?.totalTrades || 0,
      subtitle: null,
    },
    {
      label: "Total Invested",
      value: `$${(statistics.financial?.totalDeposits || 0).toLocaleString()}`,
      subtitle: null,
    },
    {
      label: "Total Commissions",
      value: `$${(
        statistics.financial?.totalCommissions || 0
      ).toLocaleString()}`,
      subtitle: null,
    },
    {
      label: "Most Traded Symbol",
      value: statistics.activity?.mostTradedSymbol?.symbol || "N/A",
      subtitle: `${statistics.activity?.mostTradedSymbol?.count || 0} trades`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
