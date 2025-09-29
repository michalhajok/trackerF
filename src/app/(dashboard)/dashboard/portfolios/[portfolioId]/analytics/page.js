"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AnalyticsPage() {
  const { portfolioId } = useParams();
  const { data, isLoading } = useQuery(["analytics", portfolioId], () =>
    api
      .get(`/portfolios/${portfolioId}/analytics/dashboard`)
      .then((r) => r.data)
  );

  if (isLoading) return <div>Ładowanie analityki...</div>;

  return (
    <div>
      <h2>Analityka</h2>
      <p>Wartość portfela: {data.totalValue}</p>
      <p>Dzienny P&L: {data.todayPL}</p>
      {/* Dalsze elementy dashboardu */}
    </div>
  );
}
