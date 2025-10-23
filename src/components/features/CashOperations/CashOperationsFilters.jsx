"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "deposit", label: "Wpłata" },
  { value: "withdrawal", label: "Wypłata" },
  { value: "dividend", label: "Dywidenda" },
  { value: "fee", label: "Opłata" },
  { value: "interest", label: "???" },
  { value: "bonus", label: "Bonus" },
  { value: "transfer", label: "Przelew" },
  { value: "adjustment", label: "????" },
  { value: "tax", label: "Podatek" },
  { value: "withholding_tax", label: "Podatek" },
  { value: "stock_sale", label: "Sprzedaż akcji" },
  { value: "stock_purchase", label: "Zakup akcji" },
  { value: "close_trade", label: "Zamknięcie pozycji" },
  { value: "fractional_shares", label: "Akcje ułamkowe" },
  { value: "correction", label: "Korekta" },
  { value: "subaccount_transfer", label: "Transfer między kontami" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "pending", label: "Oczekujące" },
  { value: "completed", label: "Zakończone" },
  { value: "cancelled", label: "Anulowane" },
];

export default function CashOperationsFilters({ filters, onFiltersChange }) {
  const [local, setLocal] = useState(filters);

  const apply = () => onFiltersChange(local);
  const clear = () => {
    const reset = {
      type: "all",
      search: "",
      dateFrom: "",
      dateTo: "",
      status: "all",
      page: 1,
    };
    setLocal(reset);
    onFiltersChange(reset);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Input
        placeholder="Szukaj..."
        value={local.search}
        onChange={(e) =>
          setLocal((prev) => ({ ...prev, search: e.target.value }))
        }
        icon={<Search />}
      />

      <Select
        value={local.type}
        onChange={(value) => setLocal((prev) => ({ ...prev, type: value }))}
      >
        {TYPE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        options={STATUS_OPTIONS}
        value={local.status}
        onChange={(value) => setLocal((prev) => ({ ...prev, status: value }))}
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <div className="flex space-x-2">
        <Input
          type="date"
          value={local.dateFrom}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, dateFrom: e.target.value }))
          }
        />
        <Input
          type="date"
          value={local.dateTo}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, dateTo: e.target.value }))
          }
        />
      </div>

      <div className="col-span-full flex justify-end space-x-2">
        <Button onClick={apply}>Zastosuj</Button>
        <Button variant="outline" onClick={clear}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
