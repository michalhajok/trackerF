"use client";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TrendingUp, TrendingDown, Minus, Eye, Plus } from "lucide-react";

const formatPrice = (price) => `$${price?.toFixed(2) || "0.00"}`;
const formatChange = (change) =>
  `${change >= 0 ? "+" : ""}${change?.toFixed(2) || "0.00"}`;
const formatPercent = (percent) =>
  `${percent >= 0 ? "+" : ""}${percent?.toFixed(2) || "0.00"}%`;
const formatVolume = (volume) => volume?.toLocaleString() || "0";

function ChangeIndicator({ change, changePercent }) {
  if (change > 0) {
    return (
      <div className="flex items-center text-green-600">
        <TrendingUp className="w-4 h-4 mr-1" />
        <span className="font-medium">{formatPercent(changePercent)}</span>
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center text-red-600">
        <TrendingDown className="w-4 h-4 mr-1" />
        <span className="font-medium">{formatPercent(changePercent)}</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-500">
        <Minus className="w-4 h-4 mr-1" />
        <span className="font-medium">0.00%</span>
      </div>
    );
  }
}

export default function MarketDataTable({ quotes, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingSpinner />
            <p className="mt-4 text-gray-500">Loading market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quotes.length) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              No market data available
            </div>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or refresh the data
            </p>
            <Button onClick={onRefresh}>Refresh Data</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Change %</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote, index) => (
                <TableRow
                  key={`${quote.symbol}-${index}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className="font-mono font-bold text-gray-900">
                        {quote.symbol}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium">
                    {formatPrice(quote.lastPrice)}
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={`font-medium font-mono ${
                        quote.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatChange(quote.change)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <ChangeIndicator
                      change={quote.change}
                      changePercent={quote.changePercent}
                    />
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm">
                    {formatVolume(quote.volume)}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Add to Watchlist"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
