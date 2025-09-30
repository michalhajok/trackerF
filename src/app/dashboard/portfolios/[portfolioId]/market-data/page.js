"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Refresh,
  BarChart3,
  LineChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarketDataPage() {
  const params = useParams();
  const { toast } = useToast();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
  });

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(
        `/api/portfolios/${params.portfolioId}/market-data?${queryParams}`
      );
      const data = await response.json();

      if (data.success) {
        setMarketData(data.data.quotes || []);
        setLastUpdate(new Date());
      } else {
        toast({
          title: "Błąd",
          description: data.message || "Nie udało się pobrać danych rynkowych",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Błąd połączenia z serwerem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.portfolioId) {
      fetchMarketData();
    }
  }, [params.portfolioId, filters]);

  // Auto-refresh co 30 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchMarketData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount, currency = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeBadge = (change) => {
    if (change > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          +{change.toFixed(2)}%
        </Badge>
      );
    }
    if (change < 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          {change.toFixed(2)}%
        </Badge>
      );
    }
    return <Badge variant="secondary">0.00%</Badge>;
  };

  if (loading && marketData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dane rynkowe</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dane rynkowe</h1>
        <div className="flex gap-2 items-center">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString("pl-PL")}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMarketData}
            disabled={loading}
          >
            <Refresh
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Odśwież
          </Button>
        </div>
      </div>

      {/* Filtry */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szukaj po symbolu..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="symbol">Symbol</SelectItem>
                <SelectItem value="price">Cena</SelectItem>
                <SelectItem value="change">Zmiana</SelectItem>
                <SelectItem value="volume">Wolumen</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange("sortOrder", value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Rosnąco</SelectItem>
                <SelectItem value="desc">Malejąco</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Podsumowanie rynku */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Instrumenty</p>
                <p className="text-2xl font-bold">{marketData.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rosnące</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    marketData.filter((item) => (item.changePercent || 0) > 0)
                      .length
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spadające</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    marketData.filter((item) => (item.changePercent || 0) < 0)
                      .length
                  }
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bez zmian</p>
                <p className="text-2xl font-bold text-gray-600">
                  {
                    marketData.filter((item) => (item.changePercent || 0) === 0)
                      .length
                  }
                </p>
              </div>
              <LineChart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela danych rynkowych */}
      <Card>
        <CardHeader>
          <CardTitle>Notowania instrumentów</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead className="text-right">Ostatnia cena</TableHead>
                <TableHead className="text-right">Zmiana</TableHead>
                <TableHead className="text-right">Zmiana %</TableHead>
                <TableHead className="text-right">Otwarcie</TableHead>
                <TableHead className="text-right">Maksimum</TableHead>
                <TableHead className="text-right">Minimum</TableHead>
                <TableHead className="text-right">Wolumen</TableHead>
                <TableHead>Ostatnia aktualizacja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    Brak danych rynkowych do wyświetlenia
                  </TableCell>
                </TableRow>
              ) : (
                marketData.map((quote) => (
                  <TableRow key={quote.symbol}>
                    <TableCell className="font-bold">{quote.symbol}</TableCell>
                    <TableCell className="max-w-xs truncate" title={quote.name}>
                      {quote.name || quote.symbol}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.lastPrice || 0)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${getChangeColor(
                        quote.change || 0
                      )}`}
                    >
                      {quote.change ? formatCurrency(quote.change) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {getChangeBadge(quote.changePercent || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {quote.openPrice ? formatCurrency(quote.openPrice) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {quote.highPrice ? formatCurrency(quote.highPrice) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {quote.lowPrice ? formatCurrency(quote.lowPrice) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {quote.volume
                        ? quote.volume.toLocaleString("pl-PL")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {quote.lastUpdate
                        ? new Date(quote.lastUpdate).toLocaleTimeString("pl-PL")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Informacja o opóźnieniu danych */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span>
              Dane rynkowe mogą być opóźnione o 15-20 minut. Nie stanowią porady
              inwestycyjnej.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
