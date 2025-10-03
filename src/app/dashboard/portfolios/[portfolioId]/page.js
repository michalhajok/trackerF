// src/app/(dashboard)/dashboard/portfolios/[portfolioId]/page.js
"use client";

import { useParams } from "next/navigation";
import { usePortfolios, usePortfolioStats } from "@/hooks/usePortfolios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Settings,
  Upload,
  BarChart3,
} from "lucide-react";

export default function PortfolioDashboardPage() {
  const { portfolioId } = useParams();
  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios();
  const { data: stats, isLoading: statsLoading } = usePortfolioStats();

  if (portfoliosLoading) return <LoadingSpinner size="lg" />;

  const portfolio = portfolios.find((p) => p._id === portfolioId);
  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Portfolio nie znaleziony
        </h2>
        <p className="text-gray-600 mb-4">
          Wybrany portfel nie istnieje lub został usunięty.
        </p>
        <Button>
          <Link href="/dashboard/portfolios">Powrót do listy portfeli</Link>
        </Button>
      </div>
    );
  }

  const portfolioStats = portfolio.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge
              variant={portfolio.status === "active" ? "success" : "secondary"}
            >
              {portfolio.status}
            </Badge>
            <span className="text-sm text-gray-600">
              Broker: {portfolio.broker}
            </span>
            <span className="text-sm text-gray-600">
              Waluta: {portfolio.currency}
            </span>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Link
              href={`/dashboard/portfolios/${portfolioId}/edit`}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edytuj
            </Link>
          </Button>
          <Button variant="outline">
            <Link
              href={`/dashboard/portfolios/${portfolioId}/import`}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wartość Portfela
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats.totalValue?.toLocaleString("pl-PL", {
                style: "currency",
                currency: portfolio.currency,
              }) || "0 PLN"}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktualna wartość rynkowa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L</CardTitle>
            {portfolioStats.totalPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolioStats.totalPL >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {portfolioStats.totalPL?.toLocaleString("pl-PL", {
                style: "currency",
                currency: portfolio.currency,
              }) || "0 PLN"}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats.totalPLPercent?.toFixed(2) || "0"}% zwrotu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Otwarte Pozycje
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats.openPositionsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Aktywne inwestycje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Zamknięte Pozycje
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats.closedPositionsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Zrealizowane transakcje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie Akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Link
                href={`/dashboard/portfolios/${portfolioId}/positions`}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <Activity className="w-6 h-6 mb-2" />
                <span>Pozycje</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Link
                href={`/dashboard/portfolios/${portfolioId}/analytics`}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <BarChart3 className="w-6 h-6 mb-2" />
                <span>Analityka</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Link
                href={`/dashboard/portfolios/${portfolioId}/cash-operations`}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <DollarSign className="w-6 h-6 mb-2" />
                <span>Operacje</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Link
                href={`/dashboard/portfolios/${portfolioId}/watchlists`}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <PieChart className="w-6 h-6 mb-2" />
                <span>Watchlisty</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Description */}
      {portfolio.description && (
        <Card>
          <CardHeader>
            <CardTitle>Opis Portfela</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{portfolio.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Last Sync Info */}
      {portfolio.brokerConfig?.lastSync && (
        <Card>
          <CardHeader>
            <CardTitle>Synchronizacja z Brokerem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Ostatnia synchronizacja:{" "}
                  {new Date(portfolio.brokerConfig.lastSync).toLocaleString(
                    "pl-PL"
                  )}
                </p>
                <p className="text-sm">
                  Status:
                  <Badge
                    variant={
                      portfolio.brokerConfig.lastSyncStatus === "success"
                        ? "success"
                        : "error"
                    }
                    className="ml-2"
                  >
                    {portfolio.brokerConfig.lastSyncStatus}
                  </Badge>
                </p>
              </div>
              {portfolio.canSync && portfolio.canSync() && (
                <Button variant="outline">Synchronizuj teraz</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
