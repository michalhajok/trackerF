/**
 * Order Details Page
 * Individual order view with detailed information and actions
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiEndpoints } from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Calendar,
  Target,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";

export default function OrderDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiEndpoints.orders.getById(id),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiEndpoints.orders.cancel(id),
    onSuccess: () => {
      success("Order cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (error) => {
      showError(error.message || "Failed to cancel order");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiEndpoints.orders.delete(id),
    onSuccess: () => {
      success("Order deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push("/dashboard/orders");
    },
    onError: (error) => {
      showError(error.message || "Failed to delete order");
    },
  });

  const order = orderData?.data;

  const handleCancel = async () => {
    await cancelMutation.mutateAsync();
    setShowCancelModal(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Alert variant="error">{error?.message || "Order not found"}</Alert>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (order.status) {
      case "pending":
        return <Clock className="w-8 h-8 text-warning-600" />;
      case "executed":
        return <CheckCircle className="w-8 h-8 text-success-600" />;
      case "cancelled":
        return <XCircle className="w-8 h-8 text-error-600" />;
      case "expired":
        return <AlertCircle className="w-8 h-8 text-slate-400" />;
      default:
        return <Clock className="w-8 h-8 text-slate-400" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      pending: "warning",
      executed: "success",
      cancelled: "error",
      expired: "default",
    };

    return (
      <Badge variant={variants[order.status] || "default"}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </Badge>
    );
  };

  const getOrderTypeBadge = () => {
    const variants = {
      market: "primary",
      limit: "success",
      stop: "warning",
      stop_limit: "error",
    };

    return (
      <Badge variant={variants[order.type] || "default"}>
        {order.type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const isPending = order.status === "pending";
  const canCancel = isPending;
  const canEdit = isPending;

  const isExpiringSoon =
    order.validUntil &&
    new Date(order.validUntil) < new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {order.symbol} Order
              </h1>
              <Badge variant={order.side === "BUY" ? "success" : "error"}>
                {order.side}
              </Badge>
              {getOrderTypeBadge()}
              {getStatusBadge()}
            </div>
            <p className="text-slate-600 mt-1">
              Created {formatRelativeTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="text-warning-600 hover:text-warning-700"
            >
              <Square className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Order Status Alert */}
      {isPending && isExpiringSoon && (
        <Alert variant="warning">
          This order will expire soon (
          {formatDate(order.validUntil, "MMM dd, yyyy HH:mm")}).
        </Alert>
      )}

      {/* Order Overview */}
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>

            <div className="text-4xl font-bold mb-2 text-slate-900">
              {order.side} {order.volume?.toLocaleString()} shares
            </div>

            <p className="text-lg text-slate-600">
              of <span className="font-medium">{order.symbol}</span>
            </p>

            {order.price && (
              <p className="text-lg text-slate-600 mt-2">
                at {formatCurrency(order.price)} per share
              </p>
            )}

            {order.price && order.volume && (
              <div className="text-2xl font-semibold text-primary-600 mt-4">
                Total: {formatCurrency(order.price * order.volume)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Order Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Order ID:</span>
              <span className="font-mono text-sm">{order._id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Symbol:</span>
              <span className="font-medium">{order.symbol}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Side:</span>
              <Badge
                variant={order.side === "BUY" ? "success" : "error"}
                size="sm"
              >
                {order.side}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Order Type:</span>
              <span className="font-medium">
                {order.type.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Volume:</span>
              <span className="font-medium">
                {order.volume?.toLocaleString()}
              </span>
            </div>

            {order.price && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Price:</span>
                <span className="font-medium">
                  {formatCurrency(order.price)}
                </span>
              </div>
            )}

            {order.stopPrice && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Stop Price:</span>
                <span className="font-medium">
                  {formatCurrency(order.stopPrice)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Status:</span>
              {getStatusBadge()}
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Created:</span>
              <span className="text-sm">
                {formatDate(order.createdAt, "MMM dd, yyyy HH:mm")}
              </span>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Additional Information
          </h3>

          <div className="space-y-6">
            {order.validUntil && (
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Valid Until
                  </span>
                </div>
                <div className="bg-surface-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">
                    {formatDate(order.validUntil, "MMMM dd, yyyy HH:mm")}
                    {isExpiringSoon && (
                      <span className="text-warning-600 ml-2 font-medium">
                        (Expiring Soon)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {order.notes && (
              <div>
                <div className="flex items-center mb-2">
                  <Info className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Notes
                  </span>
                </div>
                <div className="bg-surface-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">{order.notes}</p>
                </div>
              </div>
            )}

            {order.executedAt && (
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Execution Details
                  </span>
                </div>
                <div className="bg-success-50 p-3 rounded-lg">
                  <p className="text-sm text-success-700">
                    Executed on{" "}
                    {formatDate(order.executedAt, "MMM dd, yyyy HH:mm")}
                  </p>
                  {order.executedPrice && (
                    <p className="text-sm text-success-700">
                      Executed at {formatCurrency(order.executedPrice)} per
                      share
                    </p>
                  )}
                </div>
              </div>
            )}

            {order.cancelledAt && (
              <div>
                <div className="flex items-center mb-2">
                  <XCircle className="w-4 h-4 text-error-600 mr-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Cancellation Details
                  </span>
                </div>
                <div className="bg-error-50 p-3 rounded-lg">
                  <p className="text-sm text-error-700">
                    Cancelled on{" "}
                    {formatDate(order.cancelledAt, "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">
              {order.side} {order.volume} shares of {order.symbol}
            </p>
            <p className="text-sm text-slate-500">
              {order.type.replace("_", " ").toUpperCase()} order
              {order.price && ` at ${formatCurrency(order.price)}`}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Order"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this order? This action cannot be
            undone.
          </p>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">
              {order.side} {order.volume} shares of {order.symbol}
            </p>
            <p className="text-sm text-slate-500">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)} •{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Order
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
