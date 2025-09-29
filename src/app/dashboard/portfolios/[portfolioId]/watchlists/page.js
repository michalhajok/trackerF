/**
 * /dashboard/watchlists/page.js - Watchlists management dashboard
 * Main watchlists overview with management tools and quick actions
 */

"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  ShareIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useWatchlists,
  useWatchlistStats,
  useCreateWatchlist,
  useDeleteWatchlist,
  useImportWatchlist,
} from "@/hooks/useWatchlists";
import WatchlistCard, {
  WatchlistGrid,
} from "@/components/features/Watchlist/WatchlistCard";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WatchlistsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, favorites, recent, shared
  const [sortBy, setSortBy] = useState("updated"); // updated, created, name, symbols, performance
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareWatchlist, setShareWatchlist] = useState(null);

  // Hooks
  const {
    data: watchlists,
    isLoading,
    refetch,
  } = useWatchlists({
    search: searchQuery,
    filter: filterBy !== "all" ? filterBy : undefined,
    sortBy,
  });

  const { data: globalStats } = useWatchlistStats();
  const createWatchlistMutation = useCreateWatchlist();
  const deleteWatchlistMutation = useDeleteWatchlist();
  const importWatchlistMutation = useImportWatchlist();

  // Filter watchlists
  const filteredWatchlists =
    watchlists?.filter((watchlist) => {
      const matchesSearch =
        !searchQuery ||
        watchlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        watchlist.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter = (() => {
        switch (filterBy) {
          case "favorites":
            return watchlist.isFavorite;
          case "recent":
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            return new Date(watchlist.updatedAt) >= threeDaysAgo;
          case "shared":
            return watchlist.isShared || watchlist.isPublic;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    }) || [];

  // Handle watchlist actions
  const handleCreateWatchlist = () => {
    router.push("/dashboard/watchlists/create");
  };

  const handleEditWatchlist = (watchlist) => {
    router.push(`/dashboard/watchlists/${watchlist.id}?tab=settings`);
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    try {
      await deleteWatchlistMutation.mutateAsync(watchlistId);
      refetch();
    } catch (error) {
      console.error("Failed to delete watchlist:", error);
    }
  };

  const handleShareWatchlist = (watchlist) => {
    setShareWatchlist(watchlist);
    setShowShareModal(true);
  };

  const handleWatchlistClick = (watchlistId) => {
    router.push(`/dashboard/watchlists/${watchlistId}`);
  };

  const handleImportWatchlist = async (importData) => {
    try {
      await importWatchlistMutation.mutateAsync(importData);
      setShowImportModal(false);
      refetch();
    } catch (error) {
      console.error("Failed to import watchlist:", error);
    }
  };

  // Quick create templates
  const quickCreateTemplates = [
    {
      name: "Tech Stocks",
      description: "Major technology companies",
      symbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"],
      color: "#3B82F6",
    },
    {
      name: "S&P 500 Top 10",
      description: "Top 10 S&P 500 companies by market cap",
      symbols: [
        "AAPL",
        "MSFT",
        "GOOGL",
        "AMZN",
        "NVDA",
        "TSLA",
        "META",
        "UNH",
        "JNJ",
        "V",
      ],
      color: "#10B981",
    },
    {
      name: "Dividend Aristocrats",
      description: "High dividend yield stocks",
      symbols: ["KO", "PG", "JNJ", "PFE", "XOM", "CVX", "T", "VZ"],
      color: "#F59E0B",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Watchlists</h1>
          <p className="text-gray-600">
            Monitor and track your favorite symbols
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Import
          </button>

          <Link
            href="/dashboard/watchlists/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Watchlist
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Watchlists
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.totalWatchlists || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Symbols
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.totalSymbols || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIconSolid className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.favoriteWatchlists || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.activeAlerts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Templates */}
      {(!watchlists || watchlists.length === 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Start Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickCreateTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => {
                  createWatchlistMutation
                    .mutateAsync({
                      name: template.name,
                      description: template.description,
                      symbols: template.symbols,
                      color: template.color,
                    })
                    .then(() => refetch());
                }}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: template.color }}
                  ></div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {template.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {template.description}
                </p>
                <p className="text-xs text-gray-500">
                  {template.symbols.length} symbols:{" "}
                  {template.symbols.slice(0, 3).join(", ")}
                  {template.symbols.length > 3 && "..."}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search watchlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Watchlists</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent</option>
              <option value="shared">Shared</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="symbols">Symbol Count</option>
              <option value="performance">Performance</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
                title="List view"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {filteredWatchlists.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            {filteredWatchlists.length} watchlist
            {filteredWatchlists.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Watchlists Grid/List */}
      {filteredWatchlists.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchQuery || filterBy !== "all"
              ? "No matching watchlists"
              : "No watchlists yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterBy !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first watchlist to start tracking symbols"}
          </p>
          {!searchQuery && filterBy === "all" && (
            <Link
              href="/dashboard/watchlists/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Watchlist
            </Link>
          )}
        </div>
      ) : (
        <WatchlistGrid
          watchlists={filteredWatchlists}
          variant={viewMode === "list" ? "compact" : "default"}
          onEdit={handleEditWatchlist}
          onDelete={handleDeleteWatchlist}
          onShare={handleShareWatchlist}
          onWatchlistClick={handleWatchlistClick}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportWatchlistModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportWatchlist}
          isLoading={importWatchlistMutation.isLoading}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareWatchlist && (
        <ShareWatchlistModal
          watchlist={shareWatchlist}
          onClose={() => {
            setShowShareModal(false);
            setShareWatchlist(null);
          }}
        />
      )}
    </div>
  );
}

// Import Watchlist Modal
const ImportWatchlistModal = ({ onClose, onImport, isLoading }) => {
  const [importMethod, setImportMethod] = useState("file"); // file, url, csv, symbols
  const [importData, setImportData] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleImport = () => {
    if (!name || !importData) return;

    const data = {
      name,
      description,
      method: importMethod,
      data: importData,
    };

    onImport(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Import Watchlist
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Watchlist Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter watchlist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "symbols", label: "Symbol List" },
                { value: "csv", label: "CSV File" },
                { value: "url", label: "Share URL" },
                { value: "file", label: "JSON File" },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="radio"
                    value={method.value}
                    checked={importMethod === method.value}
                    onChange={(e) => setImportMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {importMethod === "symbols" && "Symbols (comma-separated)"}
              {importMethod === "url" && "Share URL"}
              {importMethod === "csv" && "CSV Data"}
              {importMethod === "file" && "JSON Data"}
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder={
                importMethod === "symbols"
                  ? "AAPL, MSFT, GOOGL, TSLA, NVDA"
                  : importMethod === "url"
                  ? "https://..."
                  : importMethod === "csv"
                  ? "Symbol,Name,Price\nAAPL,Apple Inc,150.00"
                  : '{"symbols": ["AAPL", "MSFT", "GOOGL"]}'
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!name || !importData || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Importing..." : "Import Watchlist"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Share Watchlist Modal
const ShareWatchlistModal = ({ watchlist, onClose }) => {
  const [shareMethod, setShareMethod] = useState("link"); // link, export
  const [shareUrl] = useState(
    `${window.location.origin}/watchlists/shared/${watchlist.id}`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  const handleExport = (format) => {
    // Implementation for exporting watchlist data
    console.log(`Exporting watchlist as ${format}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Share {watchlist.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={shareMethod === "link"}
                  onChange={(e) => setShareMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm">Share Link</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="export"
                  checked={shareMethod === "export"}
                  onChange={(e) => setShareMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm">Export Data</span>
              </label>
            </div>
          </div>

          {shareMethod === "link" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Anyone with this link can view your watchlist
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Export your watchlist data in various formats:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExport("csv")}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport("txt")}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Export as TXT
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
