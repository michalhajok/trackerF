"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Refresh, Search, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function MarketDataPage() {
  const { portfolioId } = useParams();
  const { notify } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams(filters);
      const res = await fetch(
        `/api/portfolios/${portfolioId}/market-data?${qp}`
      );
      const json = await res.json();
      if (json.success) setQuotes(json.data.quotes);
      else notify({ title: "Błąd", message: json.message, type: "error" });
    } catch {
      notify({ title: "Błąd", message: "Serwer niedostępny", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (portfolioId) fetchData();
  }, [portfolioId, filters]);

  if (loading) return <p>Ładowanie danych rynkowych...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl">Dane rynkowe</h1>
        <Button onClick={fetchData}>
          <Refresh className="mr-2" />
          Odśwież
        </Button>
      </div>
      <Card>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Szukaj..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            startIcon={<Search />}
          />
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value }))
            }
            name="sortBy"
          >
            <SelectOption value="symbol">Symbol</SelectOption>
            <SelectOption value="price">Cena</SelectOption>
          </Select>
          <Select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortOrder: e.target.value }))
            }
            name="sortOrder"
          >
            <SelectOption value="asc">Rosnąco</SelectOption>
            <SelectOption value="desc">Malejąco</SelectOption>
          </Select>
        </CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            {["Symbol", "Cena", "Zmiana", "Zmiana %", "Wolumen"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((q) => (
            <TableRow key={q.symbol}>
              <TableCell>{q.symbol}</TableCell>
              <TableCell>{q.lastPrice.toFixed(2)}</TableCell>
              <TableCell
                className={q.change >= 0 ? "text-green-600" : "text-red-600"}
              >
                {q.change.toFixed(2)}
                <TrendingUp className="inline" />
              </TableCell>
              <TableCell
                className={
                  q.changePercent >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {q.changePercent.toFixed(2)}%
              </TableCell>
              <TableCell>{q.volume.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
