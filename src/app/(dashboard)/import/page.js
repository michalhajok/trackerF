/**
 * Import Page
 * File import functionality for positions, cash operations, and orders
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndpoints } from "@/lib/api";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import { formatRelativeTime } from "@/lib/utils";

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState("positions");
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: importHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["import-history"],
    queryFn: () => apiEndpoints.import.getHistory(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const history = importHistory?.data || [];

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("importType", importType);
      formData.append("skipFirstRow", skipFirstRow.toString());

      const result = await apiEndpoints.import.upload(formData);

      if (result.success) {
        setSelectedFile(null);
        refetchHistory();
        // Show success toast
      }
    } catch (error) {
      console.error("Import failed:", error);
      // Show error toast
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-error-600" />;
      case "processing":
        return <RotateCcw className="w-4 h-4 text-warning-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      case "processing":
        return <Badge variant="warning">Processing</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const importTemplates = {
    positions: {
      name: "Positions Template",
      description: "Import your trading positions from Excel or CSV",
      columns: [
        "symbol",
        "name",
        "type",
        "volume",
        "openPrice",
        "openTime",
        "commission",
        "currency",
        "exchange",
      ],
    },
    cash_operations: {
      name: "Cash Operations Template",
      description: "Import deposits, withdrawals, dividends and fees",
      columns: ["type", "amount", "currency", "time", "comment", "category"],
    },
    orders: {
      name: "Orders Template",
      description: "Import pending orders and order history",
      columns: [
        "symbol",
        "side",
        "type",
        "volume",
        "price",
        "stopPrice",
        "validUntil",
        "notes",
      ],
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Data</h1>
          <p className="text-slate-600">
            Import your trading data from Excel or CSV files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Upload File
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Import Type
                </label>
                <Select
                  value={importType}
                  onValueChange={setImportType}
                  className="w-full"
                >
                  <option value="positions">Positions</option>
                  <option value="cash_operations">Cash Operations</option>
                  <option value="orders">Orders</option>
                </Select>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                maxSize={10 * 1024 * 1024} // 10MB
                className="w-full"
              />

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center">
                <input
                  id="skipFirstRow"
                  type="checkbox"
                  checked={skipFirstRow}
                  onChange={(e) => setSkipFirstRow(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="skipFirstRow"
                  className="ml-2 block text-sm text-slate-700"
                >
                  Skip first row (header)
                </label>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Import History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Import History
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchHistory()}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No import history found</p>
                <p className="text-sm text-slate-500">
                  Your file imports will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 border border-surface-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      {getStatusIcon(item.status)}
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {item.fileName}
                          </p>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-xs text-slate-500">
                          {item.importType} •{" "}
                          {formatRelativeTime(item.createdAt)}
                        </p>
                        {item.recordsProcessed !== undefined && (
                          <p className="text-xs text-slate-500">
                            {item.recordsProcessed} records processed
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "failed" && item.errorDetails && (
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}

                      {item.status === "completed" && item.summary && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Templates & Help Section */}
        <div className="space-y-6">
          {/* Template Download */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Templates
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Download template files to see the required format for your data.
            </p>

            <div className="space-y-3">
              {Object.entries(importTemplates).map(([key, template]) => (
                <div
                  key={key}
                  className="border border-surface-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        {template.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Import Instructions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Instructions
            </h3>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  Supported Formats
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Excel files (.xlsx, .xls)</li>
                  <li>CSV files (.csv)</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  Data Requirements
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the provided templates</li>
                  <li>Include headers in the first row</li>
                  <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
                  <li>Numbers without currency symbols</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Tips</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Test with a small file first</li>
                  <li>Check data after import</li>
                  <li>Keep backups of your original files</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
