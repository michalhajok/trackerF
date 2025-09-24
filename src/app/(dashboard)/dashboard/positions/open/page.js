/**
 * Open Positions Page
 * Displays all open positions with management functionality
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import { Plus, Filter, Download, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import PositionCard from "@/components/features/Positions/PositionCard";
import PositionForm from "@/components/forms/PositionForm";
import { Modal } from "@/components/ui/Modal";
import {
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from "@/hooks/mutations/usePositionMutations";

export default function OpenPositionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [filters, setFilters] = useState({
    symbol: "",
    sortBy: "openTime",
    sortOrder: "desc",
  });

  const {
    data: positionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["positions", { status: "open", ...filters }],
    queryFn: () =>
      apiEndpoints.positions.getAll({ status: "open", ...filters }),
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useDeletePosition();

  const positions = positionsData?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreatePosition = async (data) => {
    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
  };

  const handleUpdatePosition = async (data) => {
    if (editingPosition) {
      await updateMutation.mutateAsync({
        id: editingPosition._id,
        data,
      });
      setEditingPosition(null);
    }
  };

  const handleDeletePosition = async (position) => {
    if (
      confirm(
        `Are you sure you want to delete the ${position.symbol} position?`
      )
    ) {
      await deleteMutation.mutateAsync(position._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-error-600">Failed to load open positions</p>
        <Button variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Open Positions</h1>
          <p className="text-slate-600 mt-1">
            {positions.length} active position
            {positions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by symbol..."
            value={filters.symbol}
            onChange={(e) => handleFilterChange("symbol", e.target.value)}
          />

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <option value="openTime">Open Date</option>
            <option value="symbol">Symbol</option>
            <option value="grossPL">P&L</option>
            <option value="plPercentage">Return %</option>
          </Select>

          <Select
            value={filters.sortOrder}
            onValueChange={(value) => handleFilterChange("sortOrder", value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>

          <Badge variant="warning" className="flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Open Only
          </Badge>
        </div>
      </Card>

      {/* Positions Grid */}
      {positions.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No open positions
          </h3>
          <p className="text-slate-600 mb-6">
            {filters.symbol
              ? "No positions match your search criteria."
              : "Create your first position to start building your portfolio."}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map((position) => (
            <PositionCard
              key={position._id}
              position={position}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
            />
          ))}
        </div>
      )}

      {/* Create Position Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Position"
        size="lg"
      >
        <PositionForm
          onSubmit={handleCreatePosition}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Position Modal */}
      <Modal
        isOpen={!!editingPosition}
        onClose={() => setEditingPosition(null)}
        title="Edit Position"
        size="lg"
      >
        {editingPosition && (
          <PositionForm
            initialData={editingPosition}
            onSubmit={handleUpdatePosition}
            onCancel={() => setEditingPosition(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
