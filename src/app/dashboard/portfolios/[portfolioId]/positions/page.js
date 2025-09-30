"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PositionsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
  });

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: filters.status !== "all" ? filters.status : "",
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(
        `/api/portfolios/${params.portfolioId}/positions?${queryParams}`
      );
      const data = await response.json();

      if (data.success) {
        setPositions(data.data.positions || []);
      } else {
        toast({
          title: "Błąd",
          description: data.message || "Nie udało się pobrać pozycji",
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
      fetchPositions();
    }
  }, [params.portfolioId, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount, currency = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: "default",
      closed: "secondary",
      pending: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status === "open"
          ? "Otwarta"
          : status === "closed"
          ? "Zamknięta"
          : "Oczekująca"}
      </Badge>
    );
  };

  const getPLColor = (pl) => {
    if (pl > 0) return "text-green-600";
    if (pl < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pozycje</h1>
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
        <h1 className="text-3xl font-bold">Pozycje</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Eksport
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
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="open">Otwarte</SelectItem>
                <SelectItem value="closed">Zamknięte</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="symbol">Symbol</SelectItem>
                <SelectItem value="openTime">Data otwarcia</SelectItem>
                <SelectItem value="grossPL">P&L</SelectItem>
                <SelectItem value="purchaseValue">Wartość</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela pozycji */}
      <Card>
        <CardHeader>
          <CardTitle>Pozycje ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Wolumen</TableHead>
                <TableHead>Cena otwarcia</TableHead>
                <TableHead>Cena bieżąca</TableHead>
                <TableHead>Wartość</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data otwarcia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    Brak pozycji do wyświetlenia
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow key={position._id}>
                    <TableCell className="font-medium">
                      {position.symbol}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          position.type === "BUY" ? "default" : "secondary"
                        }
                      >
                        {position.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{position.volume}</TableCell>
                    <TableCell>{formatCurrency(position.openPrice)}</TableCell>
                    <TableCell>
                      {formatCurrency(
                        position.currentPrice || position.openPrice
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(position.purchaseValue)}
                    </TableCell>
                    <TableCell className={getPLColor(position.grossPL || 0)}>
                      <div className="flex items-center gap-1">
                        {(position.grossPL || 0) > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {formatCurrency(position.grossPL || 0)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(position.status)}</TableCell>
                    <TableCell>
                      {new Date(position.openTime).toLocaleDateString("pl-PL")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
