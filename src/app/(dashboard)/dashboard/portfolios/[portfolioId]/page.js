"use client";

import { useParams } from "next/navigation";
import { usePortfolios, usePortfolioStats } from "@/hooks/usePortfolios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function PortfolioDashboardPage() {
  const { portfolioId } = useParams();
  const { data: portfolios = [] } = usePortfolios();
  // const { data: stats, isLoading: statsLoading } = usePortfolioStats();

  const portfolio = portfolios.find((p) => p._id === portfolioId);
  if (!portfolio) return <LoadingSpinner />;

  return (
    <div>
      <h1>{portfolio.name}</h1>
      {/* {statsLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <p>Wartość: {stats.totalValue}</p>
          <p>Łączny P&L: {stats.totalPL}</p>
        </div>
      )} */}
      <nav>
        <Link href={`/dashboard/portfolios/${portfolioId}/positions`}>
          Pozycje
        </Link>
        {" | "}
        <Link href={`/dashboard/portfolios/${portfolioId}/analytics`}>
          Analityka
        </Link>
        {" | "}
        <Link href={`/dashboard/portfolios/${portfolioId}/reports`}>
          Raporty
        </Link>
      </nav>
    </div>
  );
}
