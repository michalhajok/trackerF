"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { useMemo } from "react";

export default function MarketDataSummary({ quotes, isLoading }) {
  const summary = useMemo(() => {
    if (!quotes.length) {
      return { total: 0, gainers: 0, losers: 0, unchanged: 0, totalVolume: 0 };
    }

    return quotes.reduce(
      (acc, quote) => {
        acc.total += 1;
        acc.totalVolume += quote.volume || 0;

        if (quote.changePercent > 0) {
          acc.gainers += 1;
        } else if (quote.changePercent < 0) {
          acc.losers += 1;
        } else {
          acc.unchanged += 1;
        }

        return acc;
      },
      { total: 0, gainers: 0, losers: 0, unchanged: 0, totalVolume: 0 }
    );
  }, [quotes]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Instruments",
      value: summary.total.toString(),
      icon: Activity,
      color: "text-blue-600",
    },
    {
      title: "Gainers",
      value: summary.gainers.toString(),
      subtitle: `${
        summary.total ? ((summary.gainers / summary.total) * 100).toFixed(1) : 0
      }%`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Losers",
      value: summary.losers.toString(),
      subtitle: `${
        summary.total ? ((summary.losers / summary.total) * 100).toFixed(1) : 0
      }%`,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Total Volume",
      value: summary.totalVolume.toLocaleString(),
      icon: DollarSign,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.subtitle && (
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
