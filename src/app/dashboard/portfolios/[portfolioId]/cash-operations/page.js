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
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Download,
  Plus,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CashOperationsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalDividends: 0,
  });
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "time",
    sortOrder: "desc",
  });

  const fetchCashOperations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        type: filters.type !== "all" ? filters.type : "",
        search: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(
        `/api/portfolios/${params.portfolioId}/cash-operations?${queryParams}`
      );
      const data = await response.json();

      if (data.success) {
        setOperations(data.data.operations || []);
        setSummary(data.data.summary || summary);
      } else {
        toast({
          title: "Błąd",
          description:
            data.message || "Nie udało się pobrać operacji gotówkowych",
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
      fetchCashOperations();
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

  const getOperationTypeBadge = (type) => {
    const typeMap = {
      deposit: { label: "Wpłata", variant: "default", color: "text-green-600" },
      withdrawal: {
        label: "Wypłata",
        variant: "destructive",
        color: "text-red-600",
      },
      dividend: {
        label: "Dywidenda",
        variant: "secondary",
        color: "text-blue-600",
      },
      interest: {
        label: "Odsetki",
        variant: "outline",
        color: "text-purple-600",
      },
      fee: { label: "Opłata", variant: "destructive", color: "text-red-600" },
      bonus: { label: "Bonus", variant: "default", color: "text-green-600" },
      transfer: {
        label: "Transfer",
        variant: "outline",
        color: "text-gray-600",
      },
      adjustment: {
        label: "Korekta",
        variant: "secondary",
        color: "text-orange-600",
      },
      tax: { label: "Podatek", variant: "destructive", color: "text-red-600" },
      withholding_tax: {
        label: "Podatek u źródła",
        variant: "destructive",
        color: "text-red-600",
      },
      stock_purchase: {
        label: "Zakup akcji",
        variant: "outline",
        color: "text-blue-600",
      },
      stock_sale: {
        label: "Sprzedaż akcji",
        variant: "outline",
        color: "text-green-600",
      },
      close_trade: {
        label: "Zamknięcie pozycji",
        variant: "secondary",
        color: "text-gray-600",
      },
      fractional_shares: {
        label: "Akcje ułamkowe",
        variant: "outline",
        color: "text-purple-600",
      },
      correction: {
        label: "Korekta",
        variant: "secondary",
        color: "text-orange-600",
      },
    };

    const config = typeMap[type] || {
      label: type,
      variant: "outline",
      color: "text-gray-600",
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAmountColor = (amount, type) => {
    if (["withdrawal", "fee", "tax", "withholding_tax"].includes(type)) {
      return "text-red-600";
    }
    if (["deposit", "dividend", "bonus", "interest"].includes(type)) {
      return "text-green-600";
    }
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Operacje gotówkowe</h1>
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
        <h1 className="text-3xl font-bold">Operacje gotówkowe</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Eksport
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj operację
          </Button>
        </div>
      </div>

      {/* Podsumowanie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wpłaty</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalDeposits)}
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
                <p className="text-sm font-medium text-gray-600">Wypłaty</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(Math.abs(summary.totalWithdrawals))}
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
                <p className="text-sm font-medium text-gray-600">Dywidendy</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.totalDividends)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szukaj po komentarzu lub symbolu..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Typ operacji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="deposit">Wpłaty</SelectItem>
                <SelectItem value="withdrawal">Wypłaty</SelectItem>
                <SelectItem value="dividend">Dywidendy</SelectItem>
                <SelectItem value="interest">Odsetki</SelectItem>
                <SelectItem value="fee">Opłaty</SelectItem>
                <SelectItem value="bonus">Bonusy</SelectItem>
                <SelectItem value="transfer">Transfery</SelectItem>
                <SelectItem value="tax">Podatki</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Data od"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-[150px]"
            />
            <Input
              type="date"
              placeholder="Data do"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-[150px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela operacji */}
      <Card>
        <CardHeader>
          <CardTitle>Operacje ({operations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Kwota</TableHead>
                <TableHead>Waluta</TableHead>
                <TableHead>Komentarz</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    Brak operacji do wyświetlenia
                  </TableCell>
                </TableRow>
              ) : (
                operations.map((operation) => (
                  <TableRow key={operation._id}>
                    <TableCell>
                      {new Date(operation.time).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {getOperationTypeBadge(operation.type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {operation.symbol || "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${getAmountColor(
                        operation.amount,
                        operation.type
                      )}`}
                    >
                      {formatCurrency(operation.amount, operation.currency)}
                    </TableCell>
                    <TableCell>{operation.currency}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={operation.comment}
                    >
                      {operation.comment}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          operation.status === "completed"
                            ? "default"
                            : "outline"
                        }
                      >
                        {operation.status === "completed"
                          ? "Zakończona"
                          : operation.status}
                      </Badge>
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
