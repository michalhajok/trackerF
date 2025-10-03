"use client";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Search, X, Filter } from "lucide-react";

const SORT_OPTIONS = [
  { value: "symbol", label: "Symbol" },
  { value: "lastPrice", label: "Price" },
  { value: "change", label: "Change" },
  { value: "changePercent", label: "Change %" },
  { value: "volume", label: "Volume" },
];

const SORT_ORDER_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const PRICE_RANGE_OPTIONS = [
  { value: "all", label: "All Prices" },
  { value: "under10", label: "Under $10" },
  { value: "10to50", label: "$10 - $50" },
  { value: "50to100", label: "$50 - $100" },
  { value: "over100", label: "Over $100" },
];

const CHANGE_FILTER_OPTIONS = [
  { value: "all", label: "All Changes" },
  { value: "gainers", label: "Gainers Only" },
  { value: "losers", label: "Losers Only" },
  { value: "unchanged", label: "Unchanged" },
];

export default function MarketDataFilters({
  filters,
  onFiltersChange,
  quotesCount,
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      sortBy: "symbol",
      sortOrder: "asc",
      priceRange: "all",
      changeFilter: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value &&
      value !== "all" &&
      value !== "symbol" &&
      value !== "asc" &&
      value !== ""
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Market Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search symbols..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort By */}
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            placeholder="Sort by"
          >
            {SORT_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>

          {/* Sort Order */}
          <Select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            placeholder="Order"
          >
            {SORT_ORDER_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>

          {/* Price Range */}
          <Select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
            placeholder="Price range"
          >
            {PRICE_RANGE_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>

          {/* Change Filter */}
          <Select
            value={filters.changeFilter}
            onChange={(e) => handleFilterChange("changeFilter", e.target.value)}
            placeholder="Change filter"
          >
            {CHANGE_FILTER_OPTIONS.map((option) => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {quotesCount} instruments</div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                Filtered
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
