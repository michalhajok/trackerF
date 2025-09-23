/**
 * Cash Operations Page
 * Manage deposits, withdrawals, dividends and fees
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  Plus,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CashOperationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const {
    data: operationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cash-operations", typeFilter, currencyFilter],
    queryFn: () =>
      apiEndpoints.cashOperations.getAll({
        type: typeFilter !== "all" ? typeFilter : undefined,
        currency: currencyFilter !== "all" ? currencyFilter : undefined,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const operations = operationsData?.data || [];

  // Calculate summary statistics
  const summary = operations.reduce(
    (acc, op) => {
      const amount = op.amount || 0;

      switch (op.type) {
        case "deposit":
          acc.totalDeposits += amount;
          break;
        case "withdrawal":
          acc.totalWithdrawals += amount;
          break;
        case "dividend":
          acc.totalDividends += amount;
          break;
        case "fee":
          acc.totalFees += amount;
          break;
      }

      acc.netFlow = acc.totalDeposits - acc.totalWithdrawals;
      return acc;
    },
    {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalDividends: 0,
      totalFees: 0,
      netFlow: 0,
    }
  );

  const getOperationIcon = (type) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="w-4 h-4 text-success-600" />;
      case "withdrawal":
        return <TrendingDown className="w-4 h-4 text-error-600" />;
      case "dividend":
        return <DollarSign className="w-4 h-4 text-primary-600" />;
      case "fee":
        return <TrendingDown className="w-4 h-4 text-warning-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-slate-400" />;
    }
  };

  const getOperationColor = (type, amount) => {
    switch (type) {
      case "deposit":
      case "dividend":
        return "text-success-600";
      case "withdrawal":
      case "fee":
        return "text-error-600";
      default:
        return amount >= 0 ? "text-success-600" : "text-error-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Operations</h1>
          <p className="text-slate-600">
            Track deposits, withdrawals and other cash flows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter} size="sm">
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="dividend">Dividends</option>
            <option value="fee">Fees</option>
          </Select>

          <Select
            value={currencyFilter}
            onValueChange={setCurrencyFilter}
            size="sm"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PLN">PLN</option>
            <option value="GBP">GBP</option>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Operation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Deposits</p>
              <p className="text-lg font-semibold text-success-600">
                {formatCurrency(summary.totalDeposits)}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-success-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Withdrawals</p>
              <p className="text-lg font-semibold text-error-600">
                {formatCurrency(summary.totalWithdrawals)}
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-error-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Dividends</p>
              <p className="text-lg font-semibold text-primary-600">
                {formatCurrency(summary.totalDividends)}
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Fees</p>
              <p className="text-lg font-semibold text-warning-600">
                {formatCurrency(summary.totalFees)}
              </p>
            </div>
            <TrendingDown className="w-5 h-5 text-warning-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Net Flow</p>
              <p
                className={`text-lg font-semibold ${
                  summary.netFlow >= 0 ? "text-success-600" : "text-error-600"
                }`}
              >
                {formatCurrency(summary.netFlow)}
              </p>
            </div>
            <DollarSign
              className={`w-5 h-5 ${
                summary.netFlow >= 0 ? "text-success-600" : "text-error-600"
              }`}
            />
          </div>
        </Card>
      </div>

      {/* Operations List */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Alert variant="error">
          Failed to load cash operations. Please try again later.
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          {operations.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No cash operations
              </h3>
              <p className="text-slate-600 mb-6">
                You havent recorded any cash operations yet. Add your first
                deposit or withdrawal to get started.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Operation
              </Button>
            </div>
          ) : (
            <Card>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-surface-200">
                    {operations.map((operation) => (
                      <tr key={operation._id} className="hover:bg-surface-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getOperationIcon(operation.type)}
                            <div className="ml-3">
                              <Badge
                                variant={
                                  operation.type === "deposit" ||
                                  operation.type === "dividend"
                                    ? "success"
                                    : operation.type === "withdrawal" ||
                                      operation.type === "fee"
                                    ? "error"
                                    : "default"
                                }
                              >
                                {operation.type.charAt(0).toUpperCase() +
                                  operation.type.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${getOperationColor(
                              operation.type,
                              operation.amount
                            )}`}
                          >
                            {operation.type === "deposit" ||
                            operation.type === "dividend"
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              Math.abs(operation.amount),
                              operation.currency
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {operation.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDate(operation.time, "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                          {operation.comment || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
