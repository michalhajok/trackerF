/**
 * /dashboard/watchlists/[id]/page.js - Individual watchlist detail page
 * Complete watchlist view with symbols, charts, alerts, and management
 */

"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  ShareIcon,
  BellIcon,
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TableCellsIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";
import {
  useWatchlist,
  useWatchlistSymbols,
  useWatchlistStats,
  useWatchlistAlerts,
  useUpdateWatchlist,
  useDeleteWatchlist,
  useFavoriteWatchlist,
  useAddToWatchlist,
  useExportWatchlist,
} from "../../../hooks/useWatchlists";
import WatchlistTable from "../../../components/watchlists/WatchlistTable";
import PriceChart from "../../../components/market-data/PriceChart";
import { SymbolGrid } from "../../../components/market-data/SymbolCard";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

export default function WatchlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const watchlistId = params.id;
  const activeTab = searchParams.get("tab") || "overview";

  const [viewMode, setViewMode] = useState("table"); // table, grid, chart
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showAddSymbolModal, setShowAddSymbolModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Hooks
  const { data: watchlist, isLoading: watchlistLoading } =
    useWatchlist(watchlistId);
  const {
    data: symbols,
    isLoading: symbolsLoading,
    refetch: refetchSymbols,
  } = useWatchlistSymbols(watchlistId);
  const { data: stats } = useWatchlistStats(watchlistId);
  const { data: alerts } = useWatchlistAlerts(watchlistId);

  const updateWatchlistMutation = useUpdateWatchlist();
  const deleteWatchlistMutation = useDeleteWatchlist();
  const favoriteWatchlistMutation = useFavoriteWatchlist();
  const exportWatchlistMutation = useExportWatchlist();
  const addToWatchlistMutation = useAddToWatchlist();

  // Handle actions
  const handleFavorite = async () => {
    try {
      await favoriteWatchlistMutation.mutateAsync({
        watchlistId,
        isFavorite: !watchlist.isFavorite,
      });
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWatchlistMutation.mutateAsync(watchlistId);
      router.push("/dashboard/watchlists");
    } catch (error) {
      console.error("Failed to delete watchlist:", error);
    }
  };

  const handleExport = async (format) => {
    try {
      const result = await exportWatchlistMutation.mutateAsync({
        watchlistId,
        format,
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `${watchlist.name}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
    setViewMode("chart");
  };

  const handleAddSymbol = (symbol) => {
    // Implementation for adding symbol to watchlist
    console.log("Add symbol:", symbol);
  };

  const handleRemoveSymbol = (symbol) => {
    refetchSymbols();
  };

  // Tab navigation
  const tabs = [
    { id: "overview", name: "Overview", icon: EyeIcon },
    { id: "symbols", name: "Symbols", icon: ChartBarIcon },
    { id: "alerts", name: "Alerts", icon: BellIcon, count: alerts?.length },
    { id: "settings", name: "Settings", icon: Cog6ToothIcon },
  ];

  if (watchlistLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-20"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!watchlist) {
    return (
      <div className="p-6 text-center">
        <div className="py-12">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Watchlist not found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested watchlist could not be loaded.
          </p>
          <Link
            href="/dashboard/watchlists"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Watchlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/watchlists"
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Watchlists
              </Link>

              <div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: watchlist.color || "#3B82F6" }}
                  ></div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {watchlist.name}
                  </h1>

                  <button
                    onClick={handleFavorite}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {watchlist.isFavorite ? (
                      <StarIconSolid className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{symbols?.length || 0} symbols</span>
                  <span>•</span>
                  <span>
                    Updated{" "}
                    {format(new Date(watchlist.updatedAt), "MMM d, yyyy")}
                  </span>
                  {alerts && alerts.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <BellIconSolid className="h-4 w-4" />
                        <span>
                          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {watchlist.description && (
                  <p className="text-gray-600 mt-2">{watchlist.description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "table"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  title="Table view"
                >
                  <TableCellsIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                  title="Grid view"
                >
                  <ChartBarIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "chart"
                      ? "bg-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  title="Chart view"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowAddSymbolModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Symbol
              </button>

              {/* More Actions Menu */}
              <div className="relative">
                <details className="relative">
                  <summary className="flex items-center p-2 text-gray-400 hover:text-gray-600 cursor-pointer list-none">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </summary>

                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                    <Link
                      href={`/dashboard/watchlists/${watchlistId}?tab=settings`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <PencilIcon className="h-4 w-4 mr-3" />
                      Edit Watchlist
                    </Link>

                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ShareIcon className="h-4 w-4 mr-3" />
                      Share Watchlist
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                      Export as CSV
                    </button>

                    <button
                      onClick={() => handleExport("json")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                      Export as JSON
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleteWatchlistMutation.isLoading}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-3" />
                      {deleteWatchlistMutation.isLoading
                        ? "Deleting..."
                        : "Delete Watchlist"}
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/dashboard/watchlists/${watchlistId}?tab=${tab.id}`}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.count && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <WatchlistOverviewTab
            watchlist={watchlist}
            symbols={symbols}
            stats={stats}
            viewMode={viewMode}
            onSymbolClick={handleSymbolClick}
            onRemoveSymbol={handleRemoveSymbol}
            selectedSymbol={selectedSymbol}
          />
        )}

        {activeTab === "symbols" && (
          <WatchlistSymbolsTab
            watchlistId={watchlistId}
            symbols={symbols}
            viewMode={viewMode}
            onSymbolClick={handleSymbolClick}
            onRemoveSymbol={handleRemoveSymbol}
            selectedSymbol={selectedSymbol}
          />
        )}

        {activeTab === "alerts" && (
          <WatchlistAlertsTab
            watchlistId={watchlistId}
            alerts={alerts}
            symbols={symbols}
          />
        )}

        {activeTab === "settings" && (
          <WatchlistSettingsTab
            watchlist={watchlist}
            onUpdate={(updates) =>
              updateWatchlistMutation.mutateAsync({ id: watchlistId, updates })
            }
          />
        )}
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          watchlistName={watchlist.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={deleteWatchlistMutation.isLoading}
        />
      )}
    </div>
  );
}

// Overview Tab Component
const WatchlistOverviewTab = ({
  watchlist,
  symbols,
  stats,
  viewMode,
  onSymbolClick,
  onRemoveSymbol,
  selectedSymbol,
}) => {
  if (viewMode === "chart" && selectedSymbol) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PriceChart
            symbol={selectedSymbol}
            height={500}
            period="1D"
            realTime={true}
            showVolume={true}
            showIndicators={true}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Watchlist Overview
            </h3>
            {stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${stats.totalValue?.toLocaleString() || "—"}
                    </div>
                    <div className="text-sm text-gray-500">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        (stats.totalChangePercent || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(stats.totalChangePercent || 0) >= 0 ? "+" : ""}
                      {stats.totalChangePercent?.toFixed(2) || "0.00"}%
                    </div>
                    <div className="text-sm text-gray-500">Todays Change</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {stats.gainers || 0}
                    </div>
                    <div className="text-sm text-gray-500">Gainers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {stats.losers || 0}
                    </div>
                    <div className="text-sm text-gray-500">Losers</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">All Symbols</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {symbols?.map((symbol) => (
                <button
                  key={symbol.symbol}
                  onClick={() => onSymbolClick(symbol.symbol)}
                  className={`w-full p-2 text-left rounded hover:bg-gray-50 transition-colors ${
                    selectedSymbol === symbol.symbol
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {symbol.symbol}
                      </div>
                      <div className="text-xs text-gray-500">{symbol.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${symbol.price?.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          (symbol.changePercent || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(symbol.changePercent || 0) >= 0 ? "+" : ""}
                        {symbol.changePercent?.toFixed(2) || "0.00"}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalValue?.toLocaleString() || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${
                  (stats.totalChangePercent || 0) >= 0
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {/* {(stats.totalChangePercent || 0) >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                )} */}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Todays Change
                </p>
                <p
                  className={`text-2xl font-bold ${
                    (stats.totalChangePercent || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(stats.totalChangePercent || 0) >= 0 ? "+" : ""}
                  {stats.totalChangePercent?.toFixed(2) || "0.00"}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                {/* <TrendingUpIcon className="h-6 w-6 text-green-600" /> */}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gainers</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.gainers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                {/* <TrendingDownIcon className="h-6 w-6 text-red-600" /> */}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Losers</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.losers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symbols Display */}
      {viewMode === "table" ? (
        <WatchlistTable
          watchlistId={watchlist.id}
          symbols={symbols}
          onSymbolClick={onSymbolClick}
          onRemoveSymbol={onRemoveSymbol}
          showActions={true}
          showMiniCharts={true}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Symbols</h3>
          <SymbolGrid
            symbols={symbols?.map((s) => s.symbol) || []}
            variant="default"
            onSymbolClick={onSymbolClick}
          />
        </div>
      )}
    </div>
  );
};

// Symbols Tab Component
const WatchlistSymbolsTab = ({
  watchlistId,
  symbols,
  viewMode,
  onSymbolClick,
  onRemoveSymbol,
  selectedSymbol,
}) => {
  if (viewMode === "chart" && selectedSymbol) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PriceChart
            symbol={selectedSymbol}
            height={500}
            period="1D"
            realTime={true}
            showVolume={true}
            showIndicators={true}
          />
        </div>
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3">All Symbols</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {symbols?.map((symbol) => (
                <button
                  key={symbol.symbol}
                  onClick={() => onSymbolClick(symbol.symbol)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    selectedSymbol === symbol.symbol
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {symbol.symbol}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {symbol.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${symbol.price?.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          (symbol.changePercent || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(symbol.changePercent || 0) >= 0 ? "+" : ""}
                        {symbol.changePercent?.toFixed(2) || "0.00"}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "table" ? (
        <WatchlistTable
          watchlistId={watchlistId}
          symbols={symbols}
          onSymbolClick={onSymbolClick}
          onRemoveSymbol={onRemoveSymbol}
          showActions={true}
          showMiniCharts={true}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <SymbolGrid
            symbols={symbols?.map((s) => s.symbol) || []}
            variant="default"
            onSymbolClick={onSymbolClick}
          />
        </div>
      )}
    </div>
  );
};

// Alerts Tab Component
const WatchlistAlertsTab = ({ watchlistId, alerts, symbols }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Alert
        </button>
      </div>

      {alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    alert.isActive ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <BellIconSolid
                    className={`h-4 w-4 ${
                      alert.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {alert.symbol} {alert.type === "above" ? "above" : "below"}{" "}
                    ${alert.targetPrice}
                  </div>
                  <div className="text-sm text-gray-500">
                    {alert.message} • Created{" "}
                    {formatDistanceToNow(new Date(alert.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {alert.isActive ? "Active" : "Inactive"}
                </span>
                <button className="text-red-600 hover:text-red-800">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-gray-900 mb-2">
            No alerts yet
          </h4>
          <p className="text-gray-500 mb-6">
            Create price alerts to get notified when symbols reach target prices
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Alert
          </button>
        </div>
      )}
    </div>
  );
};

// Settings Tab Component
const WatchlistSettingsTab = ({ watchlist, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: watchlist.name,
    description: watchlist.description || "",
    color: watchlist.color || "#3B82F6",
    isPublic: watchlist.isPublic || false,
    tags: watchlist.tags || [],
  });

  const [isEdited, setIsEdited] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsEdited(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEdited(false);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Watchlist Settings
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleChange("isPublic", e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this watchlist public
            </label>
          </div>

          {isEdited && (
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setFormData({
                    name: watchlist.name,
                    description: watchlist.description || "",
                    color: watchlist.color || "#3B82F6",
                    isPublic: watchlist.isPublic || false,
                    tags: watchlist.tags || [],
                  });
                  setIsEdited(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({
  watchlistName,
  onConfirm,
  onCancel,
  isLoading,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Delete Watchlist
      </h3>

      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <strong>{watchlistName}</strong>? This
        action cannot be undone.
      </p>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Deleting..." : "Delete Watchlist"}
        </button>
      </div>
    </div>
  </div>
);
