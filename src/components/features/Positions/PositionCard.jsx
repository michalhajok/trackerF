"use client";
import { useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatNumber,
} from "@/lib/utils";
import Link from "next/link";

/**
 * Portfolio position card component
 * @param {Object} props - Component props
 * @param {Object} props.position - Position data
 * @param {string} props.position._id - Position ID
 * @param {string} props.position.symbol - Trading symbol
 * @param {'BUY'|'SELL'} props.position.type - Position type
 * @param {number} props.position.volume - Position volume
 * @param {Function} [props.onEdit] - Edit callback
 * @param {Function} [props.onDelete] - Delete callback
 * @returns {JSX.Element} Position card component
 */

export default React.memo(function PositionCard({
  position,
  onEdit,
  onDelete,
  onClose,
}) {
  const { isOpen, isProfit, duration } = useMemo(
    () => ({
      isOpen: position.status === "open",
      isProfit: (position.grossPL || 0) >= 0,
      duration: calculateDuration(),
    }),
    [position]
  );

  const handleEdit = useCallback(() => onEdit?.(position), [onEdit, position]);

  // export default function PositionCard({ position, onEdit, onDelete, onClose }) {
  //   const isOpen = position.status === "open";
  //   const isProfit = (position.grossPL || 0) >= 0;
  //   const isBuy = position.type === "BUY";

  // const calculateDuration = () => {
  //   const start = new Date(position.openTime);
  //   const end = isOpen ? new Date() : new Date(position.closeTime);
  //   return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  // };

  const calculateDuration = () => {
    if (!position?.openTime) return 0;

    const start = new Date(position.openTime);
    if (isNaN(start.getTime())) return 0;

    const end = isOpen ? new Date() : new Date(position.closeTime);
    if (isNaN(end.getTime())) return 0;

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link
              href={`/dashboard/positions/${position._id}`}
              className="text-xl font-semibold text-slate-900 hover:text-primary-600 transition-colors"
            >
              {position.symbol}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isBuy ? "success" : "error"} size="sm">
                {position.type}
              </Badge>
              <Badge variant={isOpen ? "warning" : "default"} size="sm">
                {position.status.toUpperCase()}
              </Badge>
            </div>
            {position.name && (
              <p className="text-sm text-slate-600 mt-1">{position.name}</p>
            )}
          </div>

          {/* Actions Dropdown */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Volume
            </p>
            <p className="text-sm font-medium text-slate-900">
              {formatNumber(position.volume)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {isOpen ? "Market Price" : "Close Price"}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(
                isOpen ? position.marketPrice : position.closePrice
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Current Value
            </p>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(
                isOpen ? position.currentValue : position.saleValue
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              P&L
            </p>
            <div
              className={`flex items-center gap-1 ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              <p className="text-sm font-medium">
                {formatCurrency(position.grossPL)}
              </p>
              {isProfit ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </div>
            <p
              className={`text-xs ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatPercent(position.plPercentage)}
            </p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Performance
            </span>
            <span
              className={`text-xs font-medium ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatPercent(position.plPercentage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isProfit ? "bg-success-500" : "bg-error-500"
              }`}
              style={{
                width: `${Math.min(
                  Math.abs(position.plPercentage || 0),
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              <Calendar className="w-3 h-3 inline mr-1" />
              Opened: {formatDate(position.openTime, "MMM dd, yyyy")}
            </span>
            {!isOpen && position.closeTime && (
              <span>
                Closed: {formatDate(position.closeTime, "MMM dd, yyyy")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOpen && (
              <Badge variant="outline" size="sm">
                {calculateDuration()} days
              </Badge>
            )}
            {position.exchange && (
              <Badge variant="outline" size="sm">
                {position.exchange}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(`/dashboard/positions/${position._id}`, "_blank")
            }
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(position)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>

          {isOpen && (
            <Button
              size="sm"
              variant="warning"
              onClick={() => onClose(position)}
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});
