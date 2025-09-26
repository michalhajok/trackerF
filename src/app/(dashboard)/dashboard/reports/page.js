/**
 * /dashboard/reports/page.js - Reports management dashboard
 * Main reports listing with filters, search, and management actions
 */

"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  ClockIcon,
  StarIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useReports,
  useDeleteReport,
  useFavoriteReport,
  useReportTemplates,
} from "../../hooks/useReports";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, portfolio, trading, tax, custom
  const [filterStatus, setFilterStatus] = useState("all"); // all, recent, scheduled, favorites
  const [sortBy, setSortBy] = useState("updated"); // updated, created, name, type
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Hooks
  const {
    data: reports,
    isLoading,
    refetch,
  } = useReports({
    search: searchQuery,
    type: filterType !== "all" ? filterType : undefined,
    sortBy,
  });

  const { data: templates } = useReportTemplates();
  const deleteReportMutation = useDeleteReport();
  const favoriteReportMutation = useFavoriteReport();

  // Filtered reports
  const filteredReports =
    reports?.filter((report) => {
      if (filterStatus === "recent") {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(report.updatedAt) >= threeDaysAgo;
      }
      if (filterStatus === "scheduled") {
        return report.schedule && report.schedule.enabled;
      }
      if (filterStatus === "favorites") {
        return report.isFavorite;
      }
      return true;
    }) || [];

  // Handle actions
  const handleDelete = async (reportId, reportName) => {
    if (confirm(`Are you sure you want to delete "${reportName}"?`)) {
      try {
        await deleteReportMutation.mutateAsync(reportId);
        refetch();
      } catch (error) {
        console.error("Failed to delete report:", error);
        alert("Failed to delete report");
      }
    }
  };

  const handleToggleFavorite = async (reportId, isFavorite) => {
    try {
      await favoriteReportMutation.mutateAsync({
        reportId,
        isFavorite: !isFavorite,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const getReportIcon = (type) => {
    const icons = {
      portfolio: ChartBarIcon,
      trading: ChartBarIcon,
      tax: DocumentTextIcon,
      custom: DocumentTextIcon,
    };
    return icons[type] || DocumentTextIcon;
  };

  const getReportTypeColor = (type) => {
    const colors = {
      portfolio: "bg-blue-100 text-blue-800",
      trading: "bg-green-100 text-green-800",
      tax: "bg-purple-100 text-purple-800",
      custom: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.custom;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">
            Create, manage, and export your trading reports
          </p>
        </div>

        <Link
          href="/dashboard/reports/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Report
        </Link>
      </div>

      {/* Quick Templates */}
      {templates && templates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Start Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.slice(0, 3).map((template) => (
              <Link
                key={template.id}
                href={`/dashboard/reports/create?template=${template.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${getReportTypeColor(
                      template.type
                    )}`}
                  >
                    {React.createElement(getReportIcon(template.type), {
                      className: "h-5 w-5",
                    })}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </div>
              </Link>
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
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="portfolio">Portfolio</option>
              <option value="trading">Trading</option>
              <option value="tax">Tax</option>
              <option value="custom">Custom</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reports</option>
              <option value="recent">Recent</option>
              <option value="scheduled">Scheduled</option>
              <option value="favorites">Favorites</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 8a1 1 0 000 2h14a1 1 0 100-2H3zM3 12a1 1 0 000 2h14a1 1 0 100-2H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchQuery ? "No matching reports" : "No reports yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Create your first report to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/reports/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Report
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const ReportIcon = getReportIcon(report.type);

            return (
              <div
                key={report.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getReportTypeColor(
                          report.type
                        )}`}
                      >
                        <ReportIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {report.type} Report
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleToggleFavorite(report.id, report.isFavorite)
                      }
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      {report.isFavorite ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <StarIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {report.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>{report.components?.length || 0} components</span>
                      {report.schedule?.enabled && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <ClockIcon className="h-4 w-4" />
                          <span>Scheduled</span>
                        </div>
                      )}
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(report.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>

                      <Link
                        href={`/dashboard/reports/create?edit=${report.id}`}
                        className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          /* Handle export */
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                        title="Export report"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          /* Handle share */
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Share report"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(report.id, report.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete report"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Components
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => {
                  const ReportIcon = getReportIcon(report.type);

                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg ${getReportTypeColor(
                              report.type
                            )} mr-3`}
                          >
                            <ReportIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.name}
                              {report.isFavorite && (
                                <StarIconSolid className="h-4 w-4 text-yellow-500 inline ml-2" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {report.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(
                            report.type
                          )}`}
                        >
                          {report.type.charAt(0).toUpperCase() +
                            report.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.components?.length || 0} components
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(report.updatedAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.schedule?.enabled ? (
                          <div className="flex items-center text-sm text-blue-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Scheduled
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/reports/${report.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/reports/create?edit=${report.id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(report.id, report.name)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredReports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredReports.length}
              </div>
              <div className="text-sm text-gray-500">Total Reports</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredReports.filter((r) => r.schedule?.enabled).length}
              </div>
              <div className="text-sm text-gray-500">Scheduled</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredReports.filter((r) => r.isFavorite).length}
              </div>
              <div className="text-sm text-gray-500">Favorites</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredReports.filter((r) => {
                    const threeDaysAgo = new Date();
                    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                    return new Date(r.updatedAt) >= threeDaysAgo;
                  }).length
                }
              </div>
              <div className="text-sm text-gray-500">Recent</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
