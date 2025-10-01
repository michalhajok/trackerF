"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, Search } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCashOperations } from "@/hooks/usePortfolios";

export default function CashOperationsPage() {
  const { portfolioId } = useParams();
  const { notify } = useToast();
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const {
    data: ops = [],
    isLoading,
    isError,
  } = useCashOperations(portfolioId, {
    type: filters.type === "all" ? undefined : filters.type,
    search: filters.search || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  if (isLoading) return <p>Ładowanie operacji...</p>;
  if (isError) {
    notify({
      title: "Błąd",
      message: "Nie udało się pobrać operacji",
      type: "error",
    });
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">Operacje gotówkowe</h1>
        <Button>
          <Download className="mr-2" />
          Eksport
        </Button>
      </div>

      <Card>
        <CardContent className="flex gap-4">
          <Select
            name="type"
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value }))
            }
            placeholder="Typ"
          >
            <SelectOption value="all">Wszystkie</SelectOption>
            <SelectOption value="deposit">Wpłaty</SelectOption>
            <SelectOption value="withdrawal">Wypłaty</SelectOption>
            <SelectOption value="dividend">Dywidendy</SelectOption>
            <SelectOption value="interest">Odsetki</SelectOption>
            <SelectOption value="fee">Opłaty</SelectOption>
            <SelectOption value="transfer">Transfery</SelectOption>
            <SelectOption value="tax">Podatki</SelectOption>
          </Select>
          <Input
            placeholder="Szukaj..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            startIcon={<Search />}
          />
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateFrom: e.target.value }))
            }
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            {["Data", "Typ", "Kwota", "Waluta", "Komentarz", "Status", ""].map(
              (h) => (
                <TableHead key={h}>{h}</TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Brak operacji
              </TableCell>
            </TableRow>
          ) : (
            ops.map((o) => (
              <TableRow key={o._id}>
                <TableCell>{new Date(o.time).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{o.type}</Badge>
                </TableCell>
                <TableCell>{o.amount.toFixed(2)}</TableCell>
                <TableCell>{o.currency}</TableCell>
                <TableCell>{o.comment}</TableCell>
                <TableCell>
                  <Badge
                    variant={o.status === "completed" ? "default" : "outline"}
                  >
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{/* akcje */}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
