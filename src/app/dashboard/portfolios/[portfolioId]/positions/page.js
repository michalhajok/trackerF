"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { usePositions } from "@/hooks/usePortfolios";

export default function PositionsPage() {
  const { portfolioId } = useParams();
  const { toast } = useToast(); // lub { notify } - sprawdź co zwraca Twój kontekst
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
  });

  // Przygotuj params dla hooka
  const params = {
    ...(filters.status !== "all" && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const {
    data: positions = [],
    isLoading,
    isError,
  } = usePositions(portfolioId, params);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <p>Ładowanie pozycji...</p>;

  if (isError) {
    toast &&
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać pozycji",
        variant: "destructive",
      });
    return <p>Błąd podczas ładowania pozycji</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pozycje</h1>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Eksport
        </Button>
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
              onChange={(e) => handleFilterChange("status", e.target.value)}
              name="status"
            >
              <SelectOption value="all">Wszystkie</SelectOption>
              <SelectOption value="open">Otwarte</SelectOption>
              <SelectOption value="closed">Zamknięte</SelectOption>
              <SelectOption value="pending">Oczekujące</SelectOption>
            </Select>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              name="sortBy"
            >
              <SelectOption value="symbol">Symbol</SelectOption>
              <SelectOption value="openTime">Data otwarcia</SelectOption>
              <SelectOption value="grossPL">P&L</SelectOption>
              <SelectOption value="purchaseValue">Wartość</SelectOption>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela pozycji */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Wolumen</TableHead>
            <TableHead>Cena otwarcia</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data otwarcia</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Brak pozycji do wyświetlenia
              </TableCell>
            </TableRow>
          ) : (
            positions.map((position) => (
              <TableRow key={position._id}>
                <TableCell className="font-medium">{position.symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant={position.type === "BUY" ? "default" : "secondary"}
                  >
                    {position.type}
                  </Badge>
                </TableCell>
                <TableCell>{position.volume}</TableCell>
                <TableCell>{position.openPrice?.toFixed(2) || "N/A"}</TableCell>
                <TableCell
                  className={
                    position.grossPL >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  <div className="flex items-center gap-1">
                    {position.grossPL >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {position.grossPL?.toFixed(2) || "0.00"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      position.status === "open" ? "default" : "secondary"
                    }
                  >
                    {position.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {position.openTime
                    ? new Date(position.openTime).toLocaleDateString("pl-PL")
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
