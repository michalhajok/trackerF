"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectOption } from "@/components/ui/select";
import { useToast } from "@/contexts/ToastContext";
import { useAnalytics } from "@/hooks/usePortfolios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { portfolioId } = useParams();
  const toast = useToast(); // Zmienione - pobierz cały obiekt
  const [timeRange, setTimeRange] = useState("1M");
  const [chartType, setChartType] = useState("line");

  const {
    data = { performance: [], allocation: [], summary: {} },
    isLoading,
    isError,
  } = useAnalytics(portfolioId, timeRange);

  if (isLoading) return <p>Ładowanie analityki...</p>;

  if (isError) {
    // Sprawdź jaką funkcję faktycznie zwraca Twój kontekst
    if (toast?.toast) {
      toast.toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych",
        variant: "destructive",
      });
    } else if (toast?.notify) {
      toast.notify({
        title: "Błąd",
        message: "Nie udało się pobrać danych",
        type: "error",
      });
    } else if (typeof toast === "function") {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych",
        variant: "destructive",
      });
    } else {
      console.error("Toast nie został poprawnie skonfigurowany");
    }
    return <p>Błąd podczas ładowania danych analitycznych</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">Analityka</h1>
        <div className="flex gap-2">
          <Select
            name="range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            placeholder="Zakres"
          >
            <SelectOption value="1W">1 tydzień</SelectOption>
            <SelectOption value="1M">1 miesiąc</SelectOption>
            <SelectOption value="3M">3 miesiące</SelectOption>
            <SelectOption value="ALL">Wszystko</SelectOption>
          </Select>
          <Select
            name="chart"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            placeholder="Typ wykresu"
          >
            <SelectOption value="line">Linia</SelectOption>
            <SelectOption value="bar">Słupki</SelectOption>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={data.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalValue"
                    stroke="#8884d8"
                    name="Wartość"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalPL"
                    stroke="#82ca9d"
                    name="P&L"
                  />
                </LineChart>
              ) : (
                <BarChart data={data.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPL" fill="#8884d8" name="P&L" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
