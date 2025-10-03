"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Plus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCashOperations } from "@/hooks/usePortfolios";
import CashOperationsFilters from "./CashOperationsFilters";
import CashOperationsTable from "./CashOperationsTable";
import CashOperationsSummary from "./CashOperationsSummary";
import { exportToCsv } from "@/lib/export";

export default function CashOperationsManager({ portfolioId }) {
  const { notify } = useToast();
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
  });

  const {
    data: operations = [],
    isLoading,
    isError,
    refetch,
  } = useCashOperations(portfolioId, {
    type: filters.type === "all" ? undefined : filters.type,
    search: filters.search || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    status: filters.status === "all" ? undefined : filters.status,
  });

  // Computed values for summary
  const summary = useMemo(() => {
    if (!operations.length)
      return { total: 0, income: 0, expense: 0, count: 0 };

    return operations.reduce(
      (acc, op) => {
        const amount = parseFloat(op.amount);
        acc.count += 1;
        acc.total += amount;

        if (amount > 0) {
          acc.income += amount;
        } else {
          acc.expense += Math.abs(amount);
        }

        return acc;
      },
      { total: 0, income: 0, expense: 0, count: 0 }
    );
  }, [operations]);

  const handleExport = async () => {
    try {
      await exportToCsv(operations, "cash-operations");
      notify({
        title: "Sukces",
        message: "Operacje zostały wyeksportowane",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Błąd",
        message: "Nie udało się wyeksportować operacji",
        type: "error",
      });
    }
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Nie udało się pobrać operacji</p>
          <Button onClick={() => refetch()} className="mt-4">
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <CashOperationsSummary summary={summary} isLoading={isLoading} />

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historia operacji</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!operations.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Eksportuj
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj operację
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <CashOperationsFilters
            filters={filters}
            onFiltersChange={setFilters}
          />

          <CashOperationsTable
            operations={operations}
            isLoading={isLoading}
            onRefresh={() => refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
