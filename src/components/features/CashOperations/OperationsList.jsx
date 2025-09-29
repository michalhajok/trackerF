/**
 * Operations List Component
 * Displays a list of cash operations with filters and actions
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Calendar,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function OperationsList() {
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    currency: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
    sortBy: "time",
    sortOrder: "desc",
  });

  const {
    data: operationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cash-operations-list", filters],
    queryFn: () => apiEndpoints.cashOperations.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const operations = operationsData?.data || [];
  const summary = operationsData?.summary || {};

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-slate-200 rounded w-32"></div>
                <div className="h-5 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-error-600">Failed to load cash operations</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <ArrowUpCircle className="w-8 h-8 text-success-600 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Total Deposits</p>
                <p className="text-lg font-semibold text-success-600">
                  {formatCurrency(summary.totalDeposits || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <ArrowDownCircle className="w-8 h-8 text-error-600 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Total Withdrawals</p>
                <p className="text-lg font-semibold text-error-600">
                  {formatCurrency(Math.abs(summary.totalWithdrawals || 0))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Net Change</p>
                <p
                  className={`text-lg font-semibold ${
                    (summary.netChange || 0) >= 0
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {formatCurrency(summary.netChange || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-slate-400 mr-3" />
              <div>
                <p className="text-sm text-slate-500">Total Operations</p>
                <p className="text-lg font-semibold text-slate-900">
                  {operations.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="dividend">Dividends</option>
            <option value="fee">Fees</option>
          </Select>

          <Select
            value={filters.currency}
            onValueChange={(value) => handleFilterChange("currency", value)}
          >
            <option value="all">All Currencies</option>
            <option value="PLN">PLN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>

          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />

          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />

          <Input
            placeholder="Search comment..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="relative"
          />

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              handleFilterChange("sortBy", sortBy);
              handleFilterChange("sortOrder", sortOrder);
            }}
          >
            <option value="time-desc">Latest First</option>
            <option value="time-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </Select>
        </div>
      </Card>

      {/* Operations List */}
      {operations.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No cash operations found
          </h3>
          <p className="text-slate-600 mb-6">
            {Object.values(filters).some((v) => v && v !== "all")
              ? "Try adjusting your filters to see more operations."
              : "Create your first cash operation to start tracking your cash flow."}
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Cash Operation
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {operations.map((operation) => (
            <OperationCard key={operation._id} operation={operation} />
          ))}
        </div>
      )}
    </div>
  );
}

function OperationCard({ operation }) {
  const isIncoming =
    operation.type === "deposit" || operation.type === "dividend";

  const getIcon = () => {
    switch (operation.type) {
      case "deposit":
      case "dividend":
        return <ArrowUpCircle className="w-5 h-5 text-success-600" />;
      case "withdrawal":
      case "fee":
        return <ArrowDownCircle className="w-5 h-5 text-error-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBadge = () => {
    const variants = {
      deposit: "success",
      dividend: "success",
      withdrawal: "error",
      fee: "warning",
    };

    return (
      <Badge variant={variants[operation.type] || "default"}>
        {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-surface-50 rounded-full flex items-center justify-center">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/dashboard/cash-operations/${operation._id}`}
                className="text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
              >
                {operation.type.charAt(0).toUpperCase() +
                  operation.type.slice(1)}{" "}
                Transaction
              </Link>
              {getBadge()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Amount</p>
                <p
                  className={`font-medium ${
                    isIncoming ? "text-success-600" : "text-error-600"
                  }`}
                >
                  {isIncoming ? "+" : "-"}
                  {formatCurrency(
                    Math.abs(operation.amount),
                    operation.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Currency</p>
                <p className="font-medium">{operation.currency}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="font-medium">{formatDate(operation.time)}</p>
              </div>

              {operation.category && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <p className="font-medium capitalize">{operation.category}</p>
                </div>
              )}
            </div>

            {operation.comment && (
              <div className="mb-2">
                <p className="text-sm text-slate-600 truncate">
                  {operation.comment}
                </p>
              </div>
            )}

            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Created {formatRelativeTime(operation.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-6">
          <Link href={`/dashboard/cash-operations/${operation._id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error-600 hover:text-error-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
