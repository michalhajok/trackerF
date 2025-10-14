"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
// import { useDeleteCashOperation } from "@/hooks/useCashOperations";
import { format } from "date-fns";

export default function CashOperationsTable({
  operations,
  pagination,
  isLoading,
  onRefresh,
  onPageChange,
}) {
  // const { remove } = useDeleteCashOperation();

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

  if (isLoading) {
    return (
      <div className="h-64 flex justify-center items-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!operations) {
    return (
      <div>
        <p>Brak operacji</p>
      </div>
    );
  }

  const typeHelper = (e) => {
    if (!e) return "-";
    const result = TYPE_OPTIONS.find(({ value }) => value === e);
    return result.label;
  };

  const statusHelper = (e) => {
    if (!e) return "-";
    const result = STATUS_OPTIONS.find(({ value }) => value === e);
    return result.label;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Kwota</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((op) => (
            <TableRow key={op.id}>
              <TableCell>{format(new Date(op.time), "yyyy-MM-dd")}</TableCell>
              <TableCell>
                <Badge variant="outline">{typeHelper(op?.type)}</Badge>
              </TableCell>
              <TableCell>
                {parseFloat(op.amount).toFixed(2)} {op.currency}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    op.status === "completed"
                      ? "default"
                      : op.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {statusHelper(op.status)}
                </Badge>
              </TableCell>
              <TableCell className="flex space-x-2">
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    remove(op.id).then(onRefresh);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.current - 1)}
          >
            Poprzednia
          </Button>
          <Button
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.current + 1)}
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
}
