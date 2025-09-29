/**
 * ReportCard.js - Report card component
 * Displays report information with actions and status
 */

"use client";

import React, { useState } from "react";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShareIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  useDownloadReport,
  useDeleteReport,
  useRetryReport,
} from "../../hooks/useReports";
import { formatDistanceToNow, format } from "date-fns";

const ReportCard = ({
  report,
  onView,
  onEdit,
  onShare,
  showActions = true,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use download hook
  const { downloadReport, isDownloading } = useDownloadReport();
  const deleteReportMutation = useDeleteReport();
  const retryReportMutation = useRetryReport();

  const getStatusIcon = (status) => {
    const iconClass = "h-5 w-5";
    switch (status) {
      case "completed":
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case "failed":
        return (
          <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />
        );
      case "pending":
      case "processing":
        return <ClockIcon className={`${iconClass} text-yellow-500`} />;
      default:
        return <DocumentTextIcon className={`${iconClass} text-gray-400`} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case "tax":
        return <DocumentTextIcon className={`${iconClass} text-orange-500`} />;
      case "performance":
        return (
          <DocumentArrowDownIcon className={`${iconClass} text-purple-500`} />
        );
      case "portfolio":
        return <DocumentTextIcon className={`${iconClass} text-blue-500`} />;
      default:
        return <DocumentTextIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return Math.round(bytes / (1024 * 1024)) + " MB";
  };

  const handleDownload = async () => {
    if (report.status !== "completed") return;

    const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}.${
      report.format
    }`;
    await downloadReport(report._id, filename);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        await deleteReportMutation.mutateAsync(report._id);
      } catch (error) {
        console.error("Failed to delete report:", error);
        alert("Failed to delete report");
      }
    }
  };

  const handleRetry = async () => {
    try {
      await retryReportMutation.mutateAsync(report._id);
      alert("Report generation restarted");
    } catch (error) {
      console.error("Failed to retry report:", error);
      alert("Failed to retry report generation");
    }
  };

  const isProcessing =
    report.status === "pending" || report.status === "processing";
  const canDownload =
    report.status === "completed" && !isDownloading(report._id);
  const canRetry = report.status === "failed";

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
        isHovered ? "transform scale-105" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Type Icon */}
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              {getTypeIcon(report.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {report.description || "No description provided"}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {report.generatedAt && (
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>
                      Generated{" "}
                      {formatDistanceToNow(new Date(report.generatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}

                {report.fileSize && (
                  <span>{formatFileSize(report.fileSize)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(report.status)}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>

            {/* Progress for processing reports */}
            {isProcessing && report.progress && (
              <div className="w-24">
                <div className="bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${report.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {report.progress}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 border-t border-gray-100">
        {/* Report Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 uppercase">
              {report.format}
            </div>
            <div className="text-xs text-gray-500">Format</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 capitalize">
              {report.type}
            </div>
            <div className="text-xs text-gray-500">Type</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {report.pageCount || preview?.estimatedPages || "N/A"}
            </div>
            <div className="text-xs text-gray-500">Pages</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {report.downloadCount || 0}
            </div>
            <div className="text-xs text-gray-500">Downloads</div>
          </div>
        </div>

        {/* Date Range */}
        {report.dateRange && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Date Range
            </div>
            <div className="text-sm text-gray-600">
              {report.dateRange.preset === "custom"
                ? `${format(
                    new Date(report.dateRange.start),
                    "MMM d, yyyy"
                  )} - ${format(new Date(report.dateRange.end), "MMM d, yyyy")}`
                : report.dateRange.preset}
            </div>
          </div>
        )}

        {/* Sections Preview */}
        {report.sections && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Included Sections
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(report.sections)
                .filter(([_, included]) => included)
                .map(([section, _]) => (
                  <span
                    key={section}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {section.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {report.status === "failed" && report.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-800">
                  Generation Failed
                </div>
                <div className="text-xs text-red-600 mt-1">{report.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Info */}
        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <div>
                <div className="text-sm font-medium text-blue-800">
                  {report.status === "pending"
                    ? "Queued for generation"
                    : "Generating report..."}
                </div>
                {report.estimatedTime && (
                  <div className="text-xs text-blue-600 mt-1">
                    Estimated time: {report.estimatedTime}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading(report._id) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </button>

            {/* View */}
            {report.status === "completed" && (
              <button
                onClick={() => onView?.(report)}
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View
              </button>
            )}

            {/* Retry */}
            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={retryReportMutation.isLoading}
                className="flex items-center px-3 py-2 border border-orange-300 text-orange-700 text-sm rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retry
              </button>
            )}

            {/* Edit */}
            <button
              onClick={() => onEdit?.(report)}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>

            {/* Share */}
            {report.status === "completed" && (
              <button
                onClick={() => onShare?.(report)}
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleteReportMutation.isLoading}
              className="flex items-center px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}

        {/* Scheduled Info */}
        {report.schedule?.enabled && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-purple-500" />
              <div className="text-sm">
                <div className="font-medium text-purple-800">
                  Scheduled Report
                </div>
                <div className="text-purple-600">
                  Runs {report.schedule.frequency} at {report.schedule.time}
                  {report.schedule.nextRun && (
                    <span className="ml-1">
                      • Next:{" "}
                      {format(new Date(report.schedule.nextRun), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generation Stats */}
        {report.status === "completed" &&
          (report.generationTime || report.pageCount) && (
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              {report.generationTime && (
                <span>
                  Generated in {Math.round(report.generationTime / 1000)}s
                </span>
              )}
              {report.lastAccessed && (
                <span>
                  Last accessed{" "}
                  {formatDistanceToNow(new Date(report.lastAccessed), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
          )}
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

// Report Grid Component
export const ReportGrid = ({
  reports = [],
  onView,
  onEdit,
  onShare,
  isLoading = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Reports Found
        </h3>
        <p className="text-gray-500">Create your first report to get started</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {reports.map((report) => (
        <ReportCard
          key={report._id}
          report={report}
          onView={onView}
          onEdit={onEdit}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default ReportCard;
