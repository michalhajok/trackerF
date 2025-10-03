"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, DollarSign, Hash } from "lucide-react";

export default function CashOperationsSummary({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Łączny bilans",
      value: `${summary.total.toFixed(2)} PLN`,
      icon: DollarSign,
      color: summary.total >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Wpływy",
      value: `${summary.income.toFixed(2)} PLN`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Wydatki",
      value: `${summary.expense.toFixed(2)} PLN`,
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
