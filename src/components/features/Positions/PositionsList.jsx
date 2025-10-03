"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

// Dynamic import dla heavy components
const PositionCard = dynamic(() => import("./PositionCard.jsx"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const PositionDetails = dynamic(() => import("./PositionDetails.jsx"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export default function PositionsList({
  positions = [],
  onRefresh,
  portfolioId,
  viewMode = "table", // table, cards, detailed
}) {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const { success, error: showError } = useToast();

  const handleEdit = (position) => {
    // TODO: Navigate to edit page or open modal
    console.log("Edit position:", position);
  };

  const handleDelete = async (position) => {
    if (
      confirm(`Are you sure you want to delete position ${position.symbol}?`)
    ) {
      try {
        // TODO: Implement delete API call
        success("Position deleted successfully");
        onRefresh?.();
      } catch (error) {
        showError("Failed to delete position");
      }
    }
  };

  const handleClose = async (position) => {
    try {
      // TODO: Implement close position API call
      success("Position closed successfully");
      onRefresh?.();
    } catch (error) {
      showError("Failed to close position");
    }
  };

  if (positions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No positions found
          </h3>
          <p className="text-slate-600 mb-6">
            Start building your portfolio by adding your first position.
          </p>
          <Button
            href={`/dashboard/portfolios/${portfolioId}/positions/new`}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Position
          </Button>
        </div>
      </Card>
    );
  }

  // Table View (domyślny)
  if (viewMode === "table") {
    return (
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Open Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <PositionTableRow
                  key={position._id}
                  position={position}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClose={handleClose}
                  onViewDetails={() => setViewDetailsId(position._id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  // Cards View
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((position) => (
          <PositionCard
            key={position._id}
            position={position}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        ))}
      </div>
    );
  }

  // Detailed View
  return (
    <div className="space-y-6">
      {positions.map((position) => (
        <PositionDetails
          key={position._id}
          position={position}
          showActions={true}
        >
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(position)}
            >
              <Edit className="w-3 h-3" />
              Edit
            </Button>
            {position.status === "open" && (
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleClose(position)}
              >
                Close
              </Button>
            )}
            <Button
              size="sm"
              variant="error"
              onClick={() => handleDelete(position)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        </PositionDetails>
      ))}
    </div>
  );
}

// Helper component dla table row
function PositionTableRow({
  position,
  onEdit,
  onDelete,
  onClose,
  onViewDetails,
}) {
  const isOpen = position.status === "open";
  const isProfit = (position.grossPL || 0) >= 0;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/dashboard/positions/${position._id}`}
          className="text-primary-600 hover:text-primary-800"
        >
          {position.symbol}
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant={position.type === "BUY" ? "success" : "error"}>
          {position.type}
        </Badge>
      </TableCell>
      <TableCell>{position.volume?.toLocaleString()}</TableCell>
      <TableCell>{formatCurrency(position.openPrice)}</TableCell>
      <TableCell>
        {formatCurrency(isOpen ? position.marketPrice : position.closePrice)}
      </TableCell>
      <TableCell>
        <div
          className={`flex items-center gap-1 ${
            isProfit ? "text-success-600" : "text-error-600"
          }`}
        >
          {isProfit ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="font-medium">
            {formatCurrency(position.grossPL)}
          </span>
        </div>
        <div
          className={`text-xs ${
            isProfit ? "text-success-600" : "text-error-600"
          }`}
        >
          {formatPercent(position.plPercentage)}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={isOpen ? "warning" : "default"}>
          {position.status.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(position.openTime, "MMM dd, yyyy")}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(position)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(position)}>
            <Edit className="w-3 h-3" />
          </Button>
          {isOpen && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onClose(position)}
              className="text-warning-600"
            >
              Close
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(position)}
            className="text-error-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
