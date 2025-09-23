/**
 * Position Details Component
 * Detailed position information component for reuse across pages
 */

"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  Info,
  Clock,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatRelativeTime,
} from "@/lib/utils";

export default function PositionDetails({
  position,
  showActions = false,
  children,
}) {
  if (!position) {
    return null;
  }

  const isOpen = position.status === "open";
  const isProfit = (position.grossPL || 0) >= 0;
  const isBuy = position.type === "BUY";

  const calculateDuration = () => {
    const start = new Date(position.openTime);
    const end = isOpen ? new Date() : new Date(position.closeTime);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const detailSections = [
    {
      title: "Position Overview",
      icon: Info,
      items: [
        { label: "Symbol", value: position.symbol },
        { label: "Company", value: position.name || "N/A" },
        { label: "Type", value: position.type, badge: true },
        { label: "Status", value: position.status, badge: true },
        { label: "Exchange", value: position.exchange || "N/A" },
        { label: "Sector", value: position.sector || "N/A" },
      ],
    },
    {
      title: "Trade Details",
      icon: Target,
      items: [
        { label: "Volume", value: position.volume?.toLocaleString() },
        { label: "Open Price", value: formatCurrency(position.openPrice) },
        {
          label: isOpen ? "Current Price" : "Close Price",
          value: formatCurrency(
            isOpen ? position.marketPrice : position.closePrice
          ),
        },
        { label: "Open Date", value: formatDate(position.openTime) },
        ...(position.closeTime
          ? [
              {
                label: "Close Date",
                value: formatDate(position.closeTime),
              },
            ]
          : []),
        { label: "Duration", value: `${calculateDuration()} days` },
      ],
    },
    {
      title: "Financial Details",
      icon: DollarSign,
      items: [
        {
          label: "Current Value",
          value: formatCurrency(
            isOpen ? position.currentValue : position.saleValue
          ),
          highlight: true,
        },
        {
          label: "Original Investment",
          value: formatCurrency(position.originalValue),
        },
        {
          label: "Gross P&L",
          value: formatCurrency(position.grossPL),
          color: isProfit ? "success" : "error",
        },
        {
          label: "Net P&L",
          value: formatCurrency(position.netPL),
          color: (position.netPL || 0) >= 0 ? "success" : "error",
        },
        {
          label: "Return %",
          value: formatPercent(position.plPercentage),
          color: isProfit ? "success" : "error",
        },
        {
          label: "Commission",
          value: formatCurrency(position.commission || 0),
        },
        { label: "Taxes", value: formatCurrency(position.taxes || 0) },
      ],
    },
    {
      title: "Timestamps",
      icon: Clock,
      items: [
        { label: "Created", value: formatRelativeTime(position.createdAt) },
        ...(position.updatedAt
          ? [
              {
                label: "Last Updated",
                value: formatRelativeTime(position.updatedAt),
              },
            ]
          : []),
        ...(isOpen && position.lastPriceUpdate
          ? [
              {
                label: "Price Updated",
                value: formatRelativeTime(position.lastPriceUpdate),
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isProfit ? (
              <TrendingUp className="w-8 h-8 text-success-600 mr-4" />
            ) : (
              <TrendingDown className="w-8 h-8 text-error-600 mr-4" />
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {position.symbol} {position.type}
              </h3>
              <p className="text-slate-600">
                {position.name || `${position.volume} shares`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`text-3xl font-bold ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatPercent(position.plPercentage)}
            </p>
            <p
              className={`text-lg ${
                isProfit ? "text-success-600" : "text-error-600"
              }`}
            >
              {formatCurrency(position.grossPL)}
            </p>
          </div>
        </div>
      </Card>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {detailSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-6">
            <div className="flex items-center mb-4">
              <section.icon className="w-5 h-5 text-primary-600 mr-2" />
              <h4 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h4>
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-500">{item.label}:</span>
                  <div className="text-right">
                    {item.badge ? (
                      <Badge
                        variant={
                          item.value === "open"
                            ? "warning"
                            : item.value === "closed"
                            ? "default"
                            : item.value === "BUY"
                            ? "success"
                            : item.value === "SELL"
                            ? "error"
                            : "default"
                        }
                        size="sm"
                      >
                        {item.value?.toUpperCase()}
                      </Badge>
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          item.color === "success"
                            ? "text-success-600"
                            : item.color === "error"
                            ? "text-error-600"
                            : item.highlight
                            ? "text-slate-900 text-base"
                            : "text-slate-900"
                        }`}
                      >
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Notes */}
      {position.notes && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-semibold text-slate-900">Notes</h4>
          </div>
          <div className="bg-surface-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {position.notes}
            </p>
          </div>
        </Card>
      )}

      {/* Actions */}
      {showActions && children && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="text-lg font-semibold text-slate-900">Actions</h4>
          </div>
          {children}
        </Card>
      )}
    </div>
  );
}
