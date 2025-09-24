/**
 * Position Details Page
 * Individual position view with detailed information and actions
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiEndpoints } from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatRelativeTime,
} from "@/lib/utils";
import { useState } from "react";

export default function PositionDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: positionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["position", id],
    queryFn: () => apiEndpoints.positions.getById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiEndpoints.positions.delete(id),
    onSuccess: () => {
      success("Position deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      router.push("/dashboard/positions");
    },
    onError: (error) => {
      showError(error.message || "Failed to delete position");
    },
  });

  const position = positionData?.data;

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

  if (error || !position) {
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
        <Alert variant="error">{error?.message || "Position not found"}</Alert>
      </div>
    );
  }

  const isOpen = position.status === "open";
  const isProfit = (position.grossPL || 0) >= 0;

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
                {position.symbol}
              </h1>
              <Badge variant={position.type === "BUY" ? "success" : "error"}>
                {position.type}
              </Badge>
              <Badge variant={isOpen ? "warning" : "default"}>
                {position.status.toUpperCase()}
              </Badge>
            </div>
            {position.name && (
              <p className="text-slate-600 mt-1">{position.name}</p>
            )}
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

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">
              Current Value
            </h3>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(
                isOpen ? position.currentValue : position.saleValue
              )}
            </p>
            {isOpen && position.marketPrice && (
              <p className="text-sm text-slate-500">
                @ {formatCurrency(position.marketPrice)} per unit
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">P&L</h3>
            {isProfit ? (
              <TrendingUp className="w-5 h-5 text-success-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-error-600" />
            )}
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatCurrency(position.grossPL)}
            </p>
            <p
              className={`text-sm ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatPercent(position.plPercentage)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Net P&L</h3>
            <Info className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                (position.netPL || 0) >= 0
                  ? "text-success-600"
                  : "text-error-600"
              }`}
            >
              {formatCurrency(position.netPL)}
            </p>
            <p className="text-xs text-slate-500">After commissions & taxes</p>
          </div>
        </Card>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Position Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Volume</p>
                <p className="font-medium">
                  {position.volume?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Open Price</p>
                <p className="font-medium">
                  {formatCurrency(position.openPrice)}
                </p>
              </div>
            </div>

            {isOpen ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Market Price</p>
                  <p className="font-medium">
                    {formatCurrency(position.marketPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Last Updated</p>
                  <p className="font-medium text-sm">
                    {formatRelativeTime(position.lastPriceUpdate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Close Price</p>
                  <p className="font-medium">
                    {formatCurrency(position.closePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Close Date</p>
                  <p className="font-medium">
                    {formatDate(position.closeTime)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Commission</p>
                <p className="font-medium">
                  {formatCurrency(position.commission)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Taxes</p>
                <p className="font-medium">{formatCurrency(position.taxes)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Currency</p>
                <p className="font-medium">{position.currency}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Open Date</p>
                <p className="font-medium">{formatDate(position.openTime)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Additional Info
          </h3>

          <div className="space-y-4">
            {position.exchange && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Exchange</p>
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-slate-400 mr-2" />
                  <p className="font-medium">{position.exchange}</p>
                </div>
              </div>
            )}

            {position.sector && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Sector</p>
                <p className="font-medium">{position.sector}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-500 mb-1">Duration</p>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <p className="font-medium">
                  {isOpen
                    ? `${Math.ceil(
                        (new Date() - new Date(position.openTime)) /
                          (1000 * 60 * 60 * 24)
                      )} days (ongoing)`
                    : `${Math.ceil(
                        (new Date(position.closeTime) -
                          new Date(position.openTime)) /
                          (1000 * 60 * 60 * 24)
                      )} days`}
                </p>
              </div>
            </div>

            {position.notes && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <div className="bg-surface-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">{position.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Performance History Chart Placeholder */}
      {isOpen && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Price Performance
          </h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Price chart would go here</p>
              <p className="text-sm text-slate-500">
                Chart.js integration needed
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Position"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this position? This action cannot be
            undone.
          </p>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-slate-900">
              {position.symbol} - {position.type}
            </p>
            <p className="text-sm text-slate-500">
              {position.volume} units @ {formatCurrency(position.openPrice)}
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
                  Delete Position
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
