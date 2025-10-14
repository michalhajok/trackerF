"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Plus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCashOperations } from "@/hooks/useCashOperations";
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
    page: 1,
    portfolioId: portfolioId,
  });

  const {
    data: { operations, analytics, pagination },
    loading,
    error,
    refresh,
  } = useCashOperations(filters);

  console.log(analytics);

  // Computed values for summary from analytics
  const summary = useMemo(() => {
    if (!analytics) {
      return { total: 0, income: 0, expense: 0, count: 0 };
    }
    return {
      total: analytics.summary?.totalBalance ?? 0,
      income: analytics.summary?.income ?? 0,
      expense: analytics.summary?.expense ?? 0,
      count: analytics.summary?.operations ?? 0,
    };
  }, [analytics]);

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

  if (error) {
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

  if (loading) {
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <CashOperationsSummary summary={summary} isLoading={loading} />

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historia operacji</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!operations}
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
            pagination={pagination}
            isLoading={loading}
            onRefresh={refresh}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
