/**
 * Cash Operation Details Page
 * Individual cash operation view with detailed information
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiEndpoints } from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Calendar,
  FileText,
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

export default function CashOperationDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: operationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cash-operation", id],
    queryFn: () => apiEndpoints.cashOperations.getById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiEndpoints.cashOperations.delete(id),
    onSuccess: () => {
      success("Cash operation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["cash-operations"] });
      router.push("/dashboard/cash-operations");
    },
    onError: (error) => {
      showError(error.message || "Failed to delete cash operation");
    },
  });

  const operation = operationData?.data;

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

  if (error || !operation) {
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
        <Alert variant="error">
          {error?.message || "Cash operation not found"}
        </Alert>
      </div>
    );
  }

  const isIncoming =
    operation.type === "deposit" || operation.type === "dividend";
  const getOperationIcon = () => {
    switch (operation.type) {
      case "deposit":
      case "dividend":
        return <ArrowUpCircle className="w-8 h-8 text-success-600" />;
      case "withdrawal":
      case "fee":
        return <ArrowDownCircle className="w-8 h-8 text-error-600" />;
      default:
        return <DollarSign className="w-8 h-8 text-slate-400" />;
    }
  };

  const getOperationColor = () => {
    return isIncoming ? "text-success-600" : "text-error-600";
  };

  const getOperationBadge = () => {
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
                Cash Operation Details
              </h1>
              {getOperationBadge()}
            </div>
            <p className="text-slate-600 mt-1">
              {formatDate(operation.time, "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
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

      {/* Operation Overview */}
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">{getOperationIcon()}</div>

            <div className={`text-4xl font-bold mb-2 ${getOperationColor()}`}>
              {isIncoming ? "+" : "-"}
              {formatCurrency(Math.abs(operation.amount), operation.currency)}
            </div>

            <p className="text-lg text-slate-600 capitalize">
              {operation.type} Transaction
            </p>

            {operation.category && (
              <p className="text-sm text-slate-500 mt-2">
                Category: {operation.category}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Operation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Transaction Details
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Transaction ID:</span>
              <span className="font-mono text-sm">{operation._id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Type:</span>
              <span className="font-medium capitalize">{operation.type}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Amount:</span>
              <span className={`font-medium ${getOperationColor()}`}>
                {isIncoming ? "+" : "-"}
                {formatCurrency(Math.abs(operation.amount))}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Currency:</span>
              <span className="font-medium">{operation.currency}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Date & Time:</span>
              <span className="font-medium">
                {formatDate(operation.time, "MMM dd, yyyy HH:mm")}
              </span>
            </div>

            {operation.category && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Category:</span>
                <span className="font-medium capitalize">
                  {operation.category}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Created:</span>
              <span className="text-sm">
                {formatRelativeTime(operation.createdAt)}
              </span>
            </div>

            {operation.updatedAt &&
              operation.updatedAt !== operation.createdAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Last Updated:</span>
                  <span className="text-sm">
                    {formatRelativeTime(operation.updatedAt)}
                  </span>
                </div>
              )}
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Additional Information
          </h3>

          <div className="space-y-6">
            {operation.comment && (
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Comment
                  </span>
                </div>
                <div className="bg-surface-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">{operation.comment}</p>
                </div>
              </div>
            )}

            {/* Account Balance Impact */}
            <div>
              <div className="flex items-center mb-2">
                <Info className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-sm font-medium text-slate-700">
                  Account Impact
                </span>
              </div>
              <div className="bg-surface-50 p-3 rounded-lg">
                <p className="text-sm text-slate-700">
                  This {operation.type} {isIncoming ? "increased" : "decreased"}{" "}
                  your {operation.currency} account balance by{" "}
                  <span className={`font-medium ${getOperationColor()}`}>
                    {formatCurrency(
                      Math.abs(operation.amount),
                      operation.currency
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Transaction Status */}
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-sm font-medium text-slate-700">
                  Status
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                <span className="text-sm text-slate-700">Completed</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Related Information */}
      {operation.relatedPositions && operation.relatedPositions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Related Positions
          </h3>
          <div className="text-sm text-slate-600">
            This operation is related to {operation.relatedPositions.length}{" "}
            position(s).
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Cash Operation"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this cash operation? This action
            cannot be undone.
          </p>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">
              {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
            </p>
            <p className="text-sm text-slate-500">
              {isIncoming ? "+" : "-"}
              {formatCurrency(
                Math.abs(operation.amount),
                operation.currency
              )} • {formatDate(operation.time)}
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
                  Delete Operation
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
