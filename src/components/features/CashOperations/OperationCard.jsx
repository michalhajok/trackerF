/**
 * Operation Card Component
 * Individual cash operation card with summary information
 */

"use client";

import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function OperationCard({ operation, onEdit, onDelete }) {
  const isIncoming =
    operation.type === "deposit" || operation.type === "dividend";

  const getOperationIcon = () => {
    switch (operation.type) {
      case "deposit":
      case "dividend":
        return <ArrowUpCircle className="w-6 h-6 text-success-600" />;
      case "withdrawal":
      case "fee":
        return <ArrowDownCircle className="w-6 h-6 text-error-600" />;
      default:
        return <DollarSign className="w-6 h-6 text-slate-400" />;
    }
  };

  const getOperationBadge = () => {
    const variants = {
      deposit: "success",
      dividend: "primary",
      withdrawal: "error",
      fee: "warning",
    };

    return (
      <Badge variant={variants[operation.type] || "default"} size="sm">
        {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
      </Badge>
    );
  };

  const getAmountColor = () => {
    return isIncoming ? "text-success-600" : "text-error-600";
  };

  const actionItems = [
    {
      label: "View Details",
      icon: Eye,
      href: `/dashboard/cash-operations/${operation._id}`,
    },
    {
      label: "Edit Operation",
      icon: Edit,
      onClick: () => onEdit?.(operation),
    },
    {
      label: "Delete Operation",
      icon: Trash2,
      onClick: () => onDelete?.(operation),
      className: "text-error-600",
      divider: true,
    },
  ];

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-surface-50 rounded-full flex items-center justify-center">
            {getOperationIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/dashboard/cash-operations/${operation._id}`}
                className="text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
              >
                {operation.type.charAt(0).toUpperCase() +
                  operation.type.slice(1)}
              </Link>
              {getOperationBadge()}
            </div>

            {/* Amount */}
            <div className="mb-3">
              <p className={`text-2xl font-bold ${getAmountColor()}`}>
                {isIncoming ? "+" : "-"}
                {formatCurrency(Math.abs(operation.amount), operation.currency)}
              </p>
              <p className="text-sm text-slate-500">
                {operation.currency} •{" "}
                {formatDate(operation.time, "MMM dd, yyyy")}
              </p>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              {operation.category && (
                <div className="flex items-center">
                  <Tag className="w-3 h-3 text-slate-400 mr-2" />
                  <span className="text-sm text-slate-600 capitalize">
                    {operation.category}
                  </span>
                </div>
              )}

              {operation.comment && (
                <p className="text-sm text-slate-600 truncate pr-4">
                  {operation.comment}
                </p>
              )}

              <div className="flex items-center text-xs text-slate-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Created {formatRelativeTime(operation.createdAt)}</span>
                {operation.updatedAt &&
                  operation.updatedAt !== operation.createdAt && (
                    <>
                      <span className="mx-2">•</span>
                      <span>
                        Updated {formatRelativeTime(operation.updatedAt)}
                      </span>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="flex items-start ml-4">
          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </Dropdown.Trigger>

            <Dropdown.Content align="end">
              {actionItems.map((item, index) => (
                <div key={index}>
                  {item.divider && <Dropdown.Separator />}
                  {item.href ? (
                    <Dropdown.Item asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      onClick={item.onClick}
                      className={item.className}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Dropdown.Item>
                  )}
                </div>
              ))}
            </Dropdown.Content>
          </Dropdown>
        </div>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="flex sm:hidden justify-between mt-4 pt-4 border-t border-surface-200 gap-2">
        <Link
          href={`/dashboard/cash-operations/${operation._id}`}
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(operation)}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(operation)}
          className="text-error-600 flex-1"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
