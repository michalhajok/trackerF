/**
 * /dashboard/reports/[id]/page.js - Individual report viewer page
 * Displays a specific report with full functionality
 */

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  TrashIcon,
  ClockIcon,
  EyeIcon,
  PrinterIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useReport,
  useDeleteReport,
  useFavoriteReport,
  useExportReport,
} from "../../../hooks/useReports";
import ReportViewer from "../../../components/reports/ReportViewer";
import { format } from "date-fns";
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id;

  const [exportFormat, setExportFormat] = useState("pdf");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Hooks
  const { data: report, isLoading, error } = useReport(reportId);
  const deleteReportMutation = useDeleteReport();
  const favoriteReportMutation = useFavoriteReport();
  const exportReportMutation = useExportReport();

  // Handle actions
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        await deleteReportMutation.mutateAsync(reportId);
        router.push("/dashboard/reports");
      } catch (error) {
        console.error("Failed to delete report:", error);
        alert("Failed to delete report");
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await favoriteReportMutation.mutateAsync({
        reportId,
        isFavorite: !report.isFavorite,
      });
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportReportMutation.mutateAsync({
        reportId,
        format: exportFormat,
        options: {
          includeCharts: true,
          includeData: true,
          watermark: false,
        },
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `${report.name}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report");
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: report.name,
        text: report.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Report link copied to clipboard");
    }
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

  // Share modal component
  const ShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Share Report
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </button>

            <button
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
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

  if (error || !report) {
    return (
      <div className="p-6 text-center">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Report not found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested report could not be loaded.
          </p>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Reports
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
                href="/dashboard/reports"
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>

              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {report.name}
                  </h1>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(
                      report.type
                    )}`}
                  >
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </span>

                  <button
                    onClick={handleToggleFavorite}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                    title={
                      report.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {report.isFavorite ? (
                      <StarIconSolid className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>
                    Created {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </span>
                  <span>•</span>
                  <span>
                    Updated {format(new Date(report.updatedAt), "MMM d, yyyy")}
                  </span>
                  <span>•</span>
                  <span>{report.components?.length || 0} components</span>

                  {report.schedule?.enabled && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>Scheduled {report.schedule.frequency}</span>
                      </div>
                    </>
                  )}
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {report.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Export Format Selector */}
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="html">HTML</option>
              </select>

              {/* Action Buttons */}
              <button
                onClick={handleExport}
                disabled={exportReportMutation.isLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {exportReportMutation.isLoading ? "Exporting..." : "Export"}
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>

              <Link
                href={`/dashboard/reports/create?edit=${reportId}`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Link>

              {/* More Actions Dropdown */}
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
                      href={`/dashboard/reports/create?template=${reportId}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Use as template
                    </Link>

                    <button
                      onClick={() => window.print()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Print report
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={handleDelete}
                      disabled={deleteReportMutation.isLoading}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleteReportMutation.isLoading
                        ? "Deleting..."
                        : "Delete report"}
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1">
        <ReportViewer
          reportId={reportId}
          showToolbar={false} // We have our own toolbar
          showHeader={true}
          interactive={true}
        />
      </div>

      {/* Share Modal */}
      {shareModalOpen && <ShareModal />}

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleExport}
            className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
            title="Export report"
          >
            <DocumentArrowDownIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Share report"
          >
            <ShareIcon className="h-6 w-6" />
          </button>

          <Link
            href={`/dashboard/reports/create?edit=${reportId}`}
            className="p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            title="Edit report"
          >
            <PencilIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
