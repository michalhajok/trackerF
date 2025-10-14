"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, DollarSign, Hash } from "lucide-react";

export default function CashOperationsSummary({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Całkowity bilans",
      value: summary.total.toFixed(2),
      icon: DollarSign,
      color: summary.total >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Wpływy",
      value: summary.income.toFixed(2),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Wydatki",
      value: summary.expense.toFixed(2),
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Liczba operacji",
      value: summary.count.toString(),
      icon: Hash,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx}>
          <CardHeader className="flex items-center space-x-2">
            <card.icon className={`w-5 h-5 ${card.color}`} />
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{card.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}
