"use client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const getStatusVariant = (status) => {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const getTypeColor = (type) => {
  const colors = {
    deposit: "text-green-600",
    withdrawal: "text-red-600",
    dividend: "text-blue-600",
    interest: "text-purple-600",
    fee: "text-orange-600",
    transfer: "text-gray-600",
    tax: "text-red-700",
  };
  return colors[type] || "text-gray-600";
};

const formatAmount = (amount, currency = "PLN") => {
  const value = parseFloat(amount);
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} ${currency}`;
};

export default function CashOperationsTable({
  operations,
  isLoading,
  onRefresh,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!operations.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Brak operacji</div>
        <p className="text-gray-400">
          Nie znaleziono operacji spełniających kryteria
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead className="text-right">Kwota</TableHead>
            <TableHead>Komentarz</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => (
            <TableRow key={operation.id} className="hover:bg-gray-50">
              <TableCell className="font-mono text-sm">
                {new Date(operation.time).toLocaleString("pl-PL")}
              </TableCell>

              <TableCell>
                <span className={`font-medium ${getTypeColor(operation.type)}`}>
                  {operation.type}
                </span>
              </TableCell>

              <TableCell className="text-right font-mono">
                <span
                  className={
                    parseFloat(operation.amount) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {formatAmount(operation.amount, operation.currency)}
                </span>
              </TableCell>

              <TableCell className="max-w-xs">
                <div className="truncate" title={operation.comment}>
                  {operation.comment || "-"}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={getStatusVariant(operation.status)}>
                  {operation.status}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
