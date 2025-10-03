"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
// ✅ POPRAWIONY IMPORT - sprawdź czy te ikony istnieją w lucide-react
import {
  RefreshCw, // ← ZMIENIONE z Refresh na RefreshCw
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";
import { exportToCsv } from "@/lib/export";
import MarketDataFilters from "./MarketDataFilters";
import MarketDataTable from "./MarketDataTable";
import MarketDataSummary from "./MarketDataSummary";

export default function MarketDataManager({ portfolioId }) {
  const toastContext = useToast();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "symbol",
    sortOrder: "asc",
    priceRange: "all",
    changeFilter: "all",
  });

  // Debounce search to avoid too many API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Universal toast function
  const showToast = (title, message, type = "info") => {
    try {
      if (toastContext?.toast) {
        toastContext.toast({
          title,
          description: message,
          variant: type === "error" ? "destructive" : "default",
        });
      } else if (toastContext?.notify) {
        toastContext.notify({ title, message, type });
      } else if (typeof toastContext === "function") {
        toastContext({
          title,
          description: message,
          variant: type === "error" ? "destructive" : "default",
        });
      } else {
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
      }
    } catch (error) {
      console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: debouncedFilters.search || "",
        sortBy: debouncedFilters.sortBy,
        sortOrder: debouncedFilters.sortOrder,
        priceRange: debouncedFilters.priceRange,
        changeFilter: debouncedFilters.changeFilter,
      });

      const response = await fetch(
        `/api/portfolios/${portfolioId}/market-data?${queryParams}`
      );

      const json = await response.json();

      if (json.success) {
        setQuotes(json.data.quotes || []);
        setLastUpdate(new Date());
      } else {
        showToast(
          "Błąd",
          json.message || "Nie udało się pobrać danych",
          "error"
        );
      }
    } catch (error) {
      showToast("Błąd", "Serwer niedostępny", "error");
      console.error("Market data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [portfolioId, debouncedFilters]);

  const handleRefresh = () => {
    fetchData();
    showToast("Odświeżanie", "Pobieranie najnowszych danych rynkowych", "info");
  };

  const handleExportData = async () => {
    try {
      if (quotes.length === 0) {
        showToast("Uwaga", "Brak danych do eksportu", "warning");
        return;
      }

      const exportData = quotes.map((quote) => ({
        Symbol: quote.symbol,
        Price: quote.lastPrice,
        Change: quote.change,
        "Change %": `${quote.changePercent}%`,
        Volume: quote.volume,
        "Last Update": new Date().toLocaleString("pl-PL"),
      }));

      // Simple CSV export - replace with your actual export function
      const csvContent = [
        Object.keys(exportData[0]).join(","),
        ...exportData.map((row) => Object.values(row).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `market-data-${portfolioId}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast("Sukces", "Dane zostały wyeksportowane", "success");
    } catch (error) {
      showToast("Błąd", "Nie udało się wyeksportować danych", "error");
    }
  };

  // Fetch data on mount and filter changes
  useEffect(() => {
    if (portfolioId) {
      fetchData();
    }
  }, [portfolioId, fetchData]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && portfolioId) {
        fetchData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, portfolioId, fetchData]);

  return (
    <div className="space-y-6">
      {/* Market Summary */}
      <MarketDataSummary quotes={quotes} isLoading={loading} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          {quotes.length} instruments
          {lastUpdate && (
            <>
              <span className="mx-2">•</span>
              Last update: {lastUpdate.toLocaleTimeString("pl-PL")}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={loading || quotes.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MarketDataFilters
        filters={filters}
        onFiltersChange={setFilters}
        quotesCount={quotes.length}
      />

      {/* Market Data Table */}
      <MarketDataTable
        quotes={quotes}
        isLoading={loading}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
