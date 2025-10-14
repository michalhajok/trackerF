"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "deposit", label: "Wpłaty" },
  { value: "withdrawal", label: "Wypłaty" },
  { value: "dividend", label: "Dywidendy" },
  { value: "fee", label: "Opłaty" },
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
        options={TYPE_OPTIONS}
        value={local.type}
        onChange={(value) => setLocal((prev) => ({ ...prev, type: value }))}
      />

      <Select
        options={STATUS_OPTIONS}
        value={local.status}
        onChange={(value) => setLocal((prev) => ({ ...prev, status: value }))}
      />

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
