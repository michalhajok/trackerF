"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Plus, Search, Star, StarOff, Eye, EyeOff } from "lucide-react";

export default function WatchlistsSidebar({
  watchlists,
  selectedWatchlist,
  onWatchlistSelect,
  onCreateWatchlist,
  searchTerm,
  onSearchChange,
  isLoading,
}) {
  const filteredWatchlists = watchlists.filter(
    (watchlist) =>
      watchlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      watchlist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Watchlists</CardTitle>
          <Button
            size="sm"
            onClick={onCreateWatchlist}
            className="flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search watchlists..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredWatchlists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {searchTerm ? "No matching watchlists" : "No watchlists yet"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateWatchlist} variant="outline">
                Create First Watchlist
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWatchlists.map((watchlist) => (
              <WatchlistItem
                key={watchlist._id}
                watchlist={watchlist}
                isSelected={selectedWatchlist?._id === watchlist._id}
                onSelect={() => onWatchlistSelect(watchlist)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistItem({ watchlist, isSelected, onSelect }) {
  const symbolCount = watchlist.items?.length || 0;

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-blue-50 border-blue-200 border shadow-sm"
          : "hover:bg-gray-50 border border-transparent"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {watchlist.name}
            </h3>
            <div className="flex items-center gap-1">
              {watchlist.isFavorite && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
              {watchlist.isPublic ? (
                <Eye className="w-3 h-3 text-blue-500" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </div>
          </div>

          {watchlist.description && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {watchlist.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {symbolCount} {symbolCount === 1 ? "instrument" : "instruments"}
            </span>

            {watchlist.totalChange !== undefined && (
              <span
                className={`text-xs font-medium ${
                  watchlist.totalChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {watchlist.totalChange >= 0 ? "+" : ""}
                {watchlist.totalChange.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
