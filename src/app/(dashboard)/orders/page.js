/**
 * Orders Page
 * Manage pending orders and order history
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", statusFilter, typeFilter],
    queryFn: () =>
      apiEndpoints.orders.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      }),
    staleTime: 1000 * 60 * 1, // 1 minute for orders (more frequent updates)
  });

  const orders = ordersData?.data || [];

  // Calculate summary statistics
  const summary = orders.reduce(
    (acc, order) => {
      switch (order.status) {
        case "pending":
          acc.pending++;
          break;
        case "executed":
          acc.executed++;
          break;
        case "cancelled":
          acc.cancelled++;
          break;
        case "expired":
          acc.expired++;
          break;
      }
      return acc;
    },
    {
      pending: 0,
      executed: 0,
      cancelled: 0,
      expired: 0,
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-warning-600" />;
      case "executed":
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-error-600" />;
      case "expired":
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "executed":
        return <Badge variant="success">Executed</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>;
      case "expired":
        return <Badge variant="default">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getOrderTypeBadge = (type) => {
    const colors = {
      market: "primary",
      limit: "success",
      stop: "warning",
      stop_limit: "error",
    };

    return (
      <Badge variant={colors[type] || "default"}>
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600">
            Manage pending orders and view order history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            size="sm"
          >
            <option value="pending">Pending</option>
            <option value="executed">Executed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="all">All Status</option>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter} size="sm">
            <option value="all">All Types</option>
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop Limit</option>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-warning-600">
                {summary.pending}
              </p>
            </div>
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Executed</p>
              <p className="text-2xl font-bold text-success-600">
                {summary.executed}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-error-600">
                {summary.cancelled}
              </p>
            </div>
            <XCircle className="w-6 h-6 text-error-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Expired</p>
              <p className="text-2xl font-bold text-slate-400">
                {summary.expired}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-slate-400" />
          </div>
        </Card>
      </div>

      {/* Orders List */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Alert variant="error">
          Failed to load orders. Please try again later.
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No {statusFilter !== "all" ? statusFilter : ""} orders
              </h3>
              <p className="text-slate-600 mb-6">
                {statusFilter === "pending"
                  ? "You don't have any pending orders. Create a new order to get started."
                  : `No ${statusFilter} orders found. Your order history will appear here.`}
              </p>
              {statusFilter === "pending" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Order Card Component
function OrderCard({ order }) {
  const isExpiringSoon =
    order.validUntil &&
    new Date(order.validUntil) < new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {order.symbol}
            </h3>
            <Badge variant={order.side === "BUY" ? "success" : "error"}>
              {order.side}
            </Badge>
            <Badge
              variant={
                order.type === "market"
                  ? "primary"
                  : order.type === "limit"
                  ? "success"
                  : order.type === "stop"
                  ? "warning"
                  : "error"
              }
            >
              {order.type.replace("_", " ").toUpperCase()}
            </Badge>
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Volume</p>
              <p className="font-medium">{order.volume?.toLocaleString()}</p>
            </div>

            {order.price && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Price</p>
                <p className="font-medium">{formatCurrency(order.price)}</p>
              </div>
            )}

            {order.stopPrice && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Stop Price</p>
                <p className="font-medium">{formatCurrency(order.stopPrice)}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-1">Total Value</p>
              <p className="font-medium">
                {formatCurrency((order.price || 0) * (order.volume || 0))}
              </p>
            </div>
          </div>

          {order.validUntil && (
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-slate-600">
                Expires: {formatDate(order.validUntil, "MMM dd, yyyy HH:mm")}
              </p>
              {isExpiringSoon && order.status === "pending" && (
                <Badge variant="warning" size="sm">
                  Expiring Soon
                </Badge>
              )}
            </div>
          )}

          {order.notes && (
            <p className="text-sm text-slate-600 bg-surface-50 p-2 rounded">
              {order.notes}
            </p>
          )}
        </div>

        <div className="text-right ml-6">
          <div className="text-xs text-slate-500 mb-2">
            Created {formatRelativeTime(order.createdAt)}
          </div>

          {order.status === "pending" && (
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          )}

          {order.status === "executed" && order.executedAt && (
            <div className="text-xs text-slate-500">
              Executed {formatRelativeTime(order.executedAt)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
