/**
 * ReportViewer.js - Report viewing component
 * Displays generated reports with navigation and actions
 */

"use client";

import React, { useState, useRef } from "react";
import {
  DocumentTextIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { useReport, useDownloadReport } from "../../hooks/useReports";

const ReportViewer = ({ reportId, report = null, onClose, className = "" }) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("single"); // single, continuous, thumbnails

  const viewerRef = useRef(null);

  // Fetch report if not provided
  const {
    data: reportData,
    isLoading,
    error,
  } = useReport(reportId, { enabled: !!reportId && !report });

  const { downloadReport, isDownloading } = useDownloadReport();

  const activeReport = report || reportData?.data;

  const handleDownload = async () => {
    if (!activeReport) return;

    const filename = `${activeReport.name.replace(/[^a-zA-Z0-9]/g, "_")}.${
      activeReport.format
    }`;
    await downloadReport(activeReport._id, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareData = {
      title: activeReport.name,
      text: activeReport.description || "Portfolio report",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Report link copied to clipboard!");
      });
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 25));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 ${className}`}
      >
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !activeReport) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 ${className}`}
      >
        <div className="p-8 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-red-600">Failed to load report</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`bg-white rounded-lg border border-gray-200 flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : className
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeReport.name}
            </h2>
            <p className="text-sm text-gray-600">
              {activeReport.type} • {activeReport.format.toUpperCase()} •
              Generated{" "}
              {new Date(activeReport.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="single">Single Page</option>
            <option value="continuous">Continuous</option>
            <option value="thumbnails">Thumbnails</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs hover:bg-gray-100 transition-colors min-w-12"
            >
              {zoom}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleDownload}
            disabled={isDownloading(activeReport._id)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Download"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Print"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Share"
          >
            <ShareIcon className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Fullscreen"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation (for multi-page reports) */}
      {activeReport.pageCount > 1 && (
        <div className="flex items-center justify-center space-x-4 p-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Page</span>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= activeReport.pageCount) {
                  setCurrentPage(page);
                }
              }}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
              min="1"
              max={activeReport.pageCount}
            />
            <span className="text-sm text-gray-700">
              of {activeReport.pageCount}
            </span>
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(activeReport.pageCount, prev + 1)
              )
            }
            disabled={currentPage === activeReport.pageCount}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="p-6">
          {viewMode === "thumbnails" ? (
            <ThumbnailView
              report={activeReport}
              currentPage={currentPage}
              onPageSelect={setCurrentPage}
            />
          ) : (
            <ReportContent
              report={activeReport}
              zoom={zoom}
              currentPage={viewMode === "single" ? currentPage : null}
              continuous={viewMode === "continuous"}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Format: {activeReport.format.toUpperCase()}</span>
          <span>
            Size:{" "}
            {activeReport.fileSize
              ? formatFileSize(activeReport.fileSize)
              : "N/A"}
          </span>
          {activeReport.pageCount && (
            <span>Pages: {activeReport.pageCount}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>Zoom: {zoom}%</span>
          {activeReport.downloadCount > 0 && (
            <span>Downloads: {activeReport.downloadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Report Content Component
const ReportContent = ({ report, zoom, currentPage, continuous }) => {
  // Mock report content - in real implementation would render actual report
  const renderReportPage = (pageNumber) => (
    <div
      key={pageNumber}
      className="bg-white shadow-lg mx-auto mb-6 p-8"
      style={{
        width: `${(8.5 * zoom) / 100}in`,
        minHeight: `${(11 * zoom) / 100}in`,
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
      }}
    >
      {/* Mock Report Content */}
      <div className="space-y-6">
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
          <p className="text-gray-600 mt-2">{report.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Page {pageNumber} of {report.pageCount || 1}
          </p>
        </div>

        {pageNumber === 1 && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Executive Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This report provides a comprehensive analysis of your portfolio
                performance for the selected time period. Key highlights and
                insights are presented with detailed breakdowns of positions,
                transactions, and performance metrics.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+12.5%</div>
                <div className="text-sm text-gray-600">Total Return</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$125,432</div>
                <div className="text-sm text-gray-600">Portfolio Value</div>
              </div>
            </div>
          </>
        )}

        {pageNumber > 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {pageNumber === 2 && "Current Positions"}
              {pageNumber === 3 && "Transaction History"}
              {pageNumber === 4 && "Performance Analysis"}
              {pageNumber > 4 && "Additional Data"}
            </h2>

            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Sample Data {i + 1}
                      </div>
                      <div className="text-sm text-gray-500">
                        Category information
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">$1,234.56</div>
                    <div className="text-sm text-green-600">+2.3%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts placeholder */}
        {report.sections?.charts && pageNumber <= 2 && (
          <div className="mt-8">
            <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm">
                  Performance chart • Portfolio allocation • Market comparison
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (continuous) {
      // Render all pages
      return (
        <div className="space-y-6">
          {[...Array(report.pageCount || 1)].map((_, i) =>
            renderReportPage(i + 1)
          )}
        </div>
      );
    } else {
      // Render single page
      return renderReportPage(currentPage);
    }
  };

  if (!activeReport) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}
      >
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No report to display</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-100 ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "rounded-lg border border-gray-200"
      } ${className}`}
    >
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {activeReport.name}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            {activeReport.format.toUpperCase()} •{activeReport.pageCount || 1}{" "}
            page{(activeReport.pageCount || 1) !== 1 ? "s" : ""} •
            {formatFileSize(activeReport.fileSize)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleZoomReset}
              className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors min-w-16 text-center"
            >
              {zoom}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleDownload}
            disabled={isDownloading(activeReport._id)}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Download"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Print"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Share"
          >
            <ShareIcon className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Fullscreen"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Page Navigation */}
      {!continuous && activeReport.pageCount > 1 && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {currentPage} of {activeReport.pageCount}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(activeReport.pageCount, prev + 1)
              )
            }
            disabled={currentPage === activeReport.pageCount}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{renderContent()}</div>
    </div>
  );
};

// Thumbnail View Component
const ThumbnailView = ({ report, currentPage, onPageSelect }) => {
  const thumbnails = [...Array(report.pageCount || 1)].map((_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {thumbnails.map((pageNum) => (
        <div
          key={pageNum}
          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
            pageNum === currentPage
              ? "border-blue-500 shadow-lg transform scale-105"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }`}
          onClick={() => onPageSelect(pageNum)}
        >
          <div className="aspect-[8.5/11] bg-white p-2">
            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                <div className="text-xs text-gray-500">Page {pageNum}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function
function formatFileSize(bytes) {
  if (!bytes) return "N/A";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return Math.round(bytes / (1024 * 1024)) + " MB";
}

export default ReportViewer;
