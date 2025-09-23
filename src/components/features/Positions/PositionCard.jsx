/**
 * Position Card Component
 * Individual position card with summary information
 */

"use client";

import {
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatRelativeTime,
} from "@/lib/utils";
import Link from "next/link";

export default function PositionCard({ position, onEdit, onDelete, onClose }) {
  const isOpen = position.status === "open";
  const isProfit = (position.grossPL || 0) >= 0;
  const isBuy = position.type === "BUY";

  const actionItems = [
    {
      label: "View Details",
      icon: Eye,
      href: `/dashboard/positions/${position._id}`,
    },
    {
      label: "Edit Position",
      icon: Edit,
      onClick: () => onEdit?.(position),
      disabled: !isOpen,
    },
    ...(isOpen
      ? [
          {
            label: "Close Position",
            icon: TrendingDown,
            onClick: () => onClose?.(position),
          },
        ]
      : []),
    {
      label: "Delete Position",
      icon: Trash2,
      onClick: () => onDelete?.(position),
      className: "text-error-600",
      divider: true,
    },
  ];

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Link
              href={`/dashboard/positions/${position._id}`}
              className="text-lg font-semibold text-slate-900 hover:text-primary-600 transition-colors"
            >
              {position.symbol}
            </Link>
            <Badge variant={isBuy ? "success" : "error"} size="sm">
              {position.type}
            </Badge>
            <Badge variant={isOpen ? "warning" : "default"} size="sm">
              {position.status.toUpperCase()}
            </Badge>
            {position.name && (
              <span className="text-sm text-slate-500 truncate max-w-48">
                {position.name}
              </span>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Volume</p>
              <p className="font-medium text-slate-900">
                {formatNumber(position.volume)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                {isOpen ? "Market Price" : "Close Price"}
              </p>
              <p className="font-medium text-slate-900">
                {formatCurrency(
                  isOpen ? position.marketPrice : position.closePrice
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Current Value</p>
              <p className="font-medium text-slate-900">
                {formatCurrency(
                  isOpen ? position.currentValue : position.saleValue
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">P&L</p>
              <div className="flex items-center">
                <p
                  className={`font-medium ${
                    isProfit ? "text-success-600" : "text-error-600"
                  }`}
                >
                  {formatCurrency(position.grossPL)}
                </p>
                {isProfit ? (
                  <TrendingUp className="w-3 h-3 text-success-600 ml-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-error-600 ml-1" />
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
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Performance</span>
              <span
                className={`text-xs font-medium ${
                  isProfit ? "text-success-600" : "text-error-600"
                }`}
              >
                {formatPercent(position.plPercentage)}
              </span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2">
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
              ></div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                Opened: {formatDate(position.openTime, "MMM dd, yyyy")}
              </span>
              {!isOpen && position.closeTime && (
                <span>
                  Closed: {formatDate(position.closeTime, "MMM dd, yyyy")}
                </span>
              )}
              {position.exchange && (
                <span className="hidden md:inline">{position.exchange}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOpen && (
                <span className="text-success-600 font-medium">
                  {Math.ceil(
                    (new Date() - new Date(position.openTime)) /
                      (1000 * 60 * 60 * 24)
                  )}
                  d
                </span>
              )}

              {position.sector && (
                <span className="bg-surface-100 px-2 py-1 rounded text-xs">
                  {position.sector}
                </span>
              )}
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
                      disabled={item.disabled}
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
      <div className="flex sm:hidden justify-between mt-4 pt-4 border-t border-surface-200">
        <Link href={`/dashboard/positions/${position._id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>

        {isOpen && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(position)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onClose?.(position)}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              Close
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(position)}
          className="text-error-600"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
