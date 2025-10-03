"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { X, Search } from "lucide-react";

export default function AddSymbolModal({
  isOpen,
  onClose,
  onSubmit,
  watchlist,
}) {
  const [symbolSearch, setSymbolSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock search results - replace with real API
  const mockSymbols = [
    { symbol: "AAPL", name: "Apple Inc.", price: 150.25, exchange: "NASDAQ" },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 285.76,
      exchange: "NASDAQ",
    },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 220.89, exchange: "NASDAQ" },
  ].filter(
    (s) =>
      symbolSearch.length >= 2 &&
      s.symbol.toLowerCase().includes(symbolSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSymbol) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        symbol: selectedSymbol.symbol,
        companyName: selectedSymbol.name,
        notes: notes.trim(),
        watchlistId: watchlist._id,
      });

      // Reset form
      setSymbolSearch("");
      setSelectedSymbol(null);
      setNotes("");
    } catch (error) {
      console.error("Failed to add symbol:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Symbol to {watchlist?.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Symbol Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Symbol *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={symbolSearch}
                  onChange={(e) =>
                    setSymbolSearch(e.target.value.toUpperCase())
                  }
                  placeholder="Type symbol (e.g., AAPL, MSFT...)"
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {symbolSearch.length >= 2 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {mockSymbols.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No symbols found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {mockSymbols.map((symbol) => (
                        <div
                          key={symbol.symbol}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedSymbol?.symbol === symbol.symbol
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => setSelectedSymbol(symbol)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="font-medium">{symbol.symbol}</div>
                              <div className="text-sm text-gray-500">
                                {symbol.name}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${symbol.price?.toFixed(2) || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {symbol.exchange}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Symbol */}
            {selectedSymbol && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">
                  Selected: {selectedSymbol.symbol}
                </div>
                <div className="text-sm text-blue-700">
                  {selectedSymbol.name}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add personal notes about this symbol..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedSymbol || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Adding..." : "Add Symbol"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
