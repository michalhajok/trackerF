"use client";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select"; // ✅ Używaj tego co faktycznie istnieje
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";

const OPERATION_TYPES = [
  { value: "all", label: "Wszystkie" },
  { value: "deposit", label: "Wpłaty" },
  { value: "withdrawal", label: "Wypłaty" },
  { value: "dividend", label: "Dywidendy" },
  { value: "interest", label: "Odsetki" },
  { value: "fee", label: "Opłaty" },
  { value: "transfer", label: "Transfery" },
  { value: "tax", label: "Podatki" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "pending", label: "Oczekujące" },
  { value: "completed", label: "Zakończone" },
  { value: "cancelled", label: "Anulowane" },
];

export default function CashOperationsFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      search: "",
      dateFrom: "",
      dateTo: "",
      status: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "all" && value !== ""
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Szukaj w komentarzach..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter - POPRAWIONA WERSJA */}
      <Select
        value={filters.type}
        onChange={(e) => handleFilterChange("type", e.target.value)}
        placeholder="Typ operacji"
      >
        {OPERATION_TYPES.map((type) => (
          <SelectOption key={type.value} value={type.value}>
            {type.label}
          </SelectOption>
        ))}
      </Select>

      {/* Status Filter - POPRAWIONA WERSJA */}
      <Select
        value={filters.status}
        onChange={(e) => handleFilterChange("status", e.target.value)}
        placeholder="Status"
      >
        {STATUS_OPTIONS.map((status) => (
          <SelectOption key={status.value} value={status.value}>
            {status.label}
          </SelectOption>
        ))}
      </Select>

      {/* Date Range */}
      <div className="flex gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          className="text-sm"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end lg:col-span-4">
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="w-4 h-4 mr-2" />
            Wyczyść filtry
          </Button>
        </div>
      )}
    </div>
  );
}
