"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";

export default function AnalyticsMetrics({ performance, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = performance.metrics || {};

  const metricsData = [
    {
      title: "Total Return",
      value: `${(metrics.totalReturn || 0).toFixed(2)}%`,
      subtitle: `$${(metrics.totalPL || 0).toLocaleString()}`,
      icon: TrendingUp,
      trend: metrics.totalReturn >= 0 ? "up" : "down",
    },
    {
      title: "Win Rate",
      value: `${(metrics.winRate || 0).toFixed(1)}%`,
      subtitle: `${metrics.winningTrades || 0} / ${
        (metrics.winningTrades || 0) + (metrics.losingTrades || 0)
      } trades`,
      icon: Target,
      trend: "neutral",
    },
    {
      title: "Average Win",
      value: `$${(metrics.avgWin || 0).toLocaleString()}`,
      subtitle: "Per winning trade",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Profit Factor",
      value: (metrics.profitFactor || 0).toFixed(2),
      subtitle: "Risk/Reward ratio",
      icon: BarChart3,
      trend: metrics.profitFactor >= 1 ? "up" : "down",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <Icon
                className={`w-5 h-5 ${
                  metric.trend === "up"
                    ? "text-green-600"
                    : metric.trend === "down"
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold mb-1 ${
                  metric.trend === "up"
                    ? "text-green-600"
                    : metric.trend === "down"
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {metric.value}
              </div>
              <p className="text-sm text-gray-500">{metric.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
