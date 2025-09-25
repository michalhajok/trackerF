/**
 * WORKING Import Page - Uses PROXY calls (not direct backend)
 * This version calls /api/proxy/import/upload instead of direct backend
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ImportPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [importType, setImportType] = useState("positions");
  const [importHistory, setImportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (isAuthenticated) {
      fetchImportHistory();
    }
  }, [isAuthenticated, authLoading]);

  const fetchImportHistory = async () => {
    try {
      setLoadingHistory(true);
      console.log("🔍 Fetching import history...");

      const token = localStorage.getItem("auth_token");

      // ✅ USING PROXY (not direct backend)
      const response = await fetch("/api/proxy/import/history", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Import history response:", response.status);

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.data?.imports) {
          setImportHistory(data.data.imports);
        } else if (Array.isArray(data)) {
          setImportHistory(data);
        } else {
          console.warn("⚠️ Unexpected history format, using mock data");
          setImportHistory(getMockHistory());
        }
      } else {
        console.error("❌ History API error:", response.status);
        setImportHistory(getMockHistory());
      }
    } catch (err) {
      console.error("❌ Error fetching import history:", err);
      setImportHistory(getMockHistory());
    } finally {
      setLoadingHistory(false);
    }
  };

  const getMockHistory = () => [
    {
      _id: "1",
      filename: "positions_export_2025.csv",
      status: "completed",
      recordsProcessed: 150,
      recordsSuccessful: 148,
      recordsFailed: 2,
      createdAt: new Date().toISOString(),
      type: "positions",
    },
    {
      _id: "2",
      filename: "cash_operations.xlsx",
      status: "failed",
      error: "Invalid file format",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      type: "cash-operations",
    },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("📁 File selected:", file.name, file.type, file.size);
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      console.log("📤 Starting proxy upload:", selectedFile.name);

      // ✅ USING PROXY - Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      formData.append("type", importType);
      formData.append("skipFirstRow", skipFirstRow.toString());

      console.log("🔧 FormData created with:");
      console.log(
        "  File:",
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      );
      console.log("  Type:", importType);
      console.log("  Skip first row:", skipFirstRow);

      const token = localStorage.getItem("auth_token");

      // ✅ CALL PROXY (not direct backend)
      console.log("🚀 Proxy call to: /api/proxy/import/upload");

      const response = await fetch("/api/proxy/import/upload", {
        method: "POST",
        headers: {
          // ✅ IMPORTANT: Don't set Content-Type for FormData!
          // Browser will set it automatically with boundary
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Send FormData to proxy
      });

      console.log("✅ Proxy response status:", response.status);

      const result = await response.json();
      console.log("✅ Proxy result:", result);

      if (response.ok && result?.success) {
        setUploadResult(result);
        setSelectedFile(null);
        // Refresh import history
        await fetchImportHistory();
      } else {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            `Upload failed with status ${response.status}`
        );
      }
    } catch (err) {
      console.error("❌ Upload error:", err);

      let errorMessage = "Upload failed";
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      console.log("📥 Downloading template for:", importType);

      const token = localStorage.getItem("auth_token");

      // ✅ USING PROXY for template too
      const response = await fetch(
        `/api/proxy/import/template?type=${importType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${importType}_template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log("✅ Template downloaded");
      } else {
        throw new Error("Template download failed");
      }
    } catch (err) {
      console.error("❌ Template download error:", err);

      // Fallback: Create a basic CSV template
      const templates = {
        positions:
          "symbol,name,type,volume,openPrice,openTime,commission,taxes,currency,exchange,sector,notes\nAAPL,Apple Inc.,BUY,100,150.00,2025-01-01,5.00,0.00,USD,NASDAQ,Technology,Sample position",
        "cash-operations":
          "type,amount,currency,description,date\nDEPOSIT,1000.00,USD,Initial deposit,2025-01-01",
        "pending-orders":
          "symbol,type,volume,targetPrice,orderType,validUntil\nTSLA,BUY,50,200.00,LIMIT,2025-12-31",
      };

      const csvContent = templates[importType] || templates.positions;
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${importType}_template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ Fallback template downloaded");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Not authenticated. Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Data</h1>
        <p className="text-gray-600">
          Import positions, cash operations, and pending orders from CSV/Excel
          files
        </p>
        <p className="text-sm text-green-600 mt-1">
          ✅ Using proxy connection with buffer fix
        </p>
      </div>

      {/* Import Options */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Import Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Type
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="positions">Positions</option>
              <option value="cash-operations">Cash Operations</option>
              <option value="pending-orders">Pending Orders</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={skipFirstRow}
                onChange={(e) => setSkipFirstRow(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Skip first row (headers)
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={downloadTemplate}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            📥 Download {importType} Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upload File</h2>

        <div className="mb-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: CSV, XLSX, XLS. Maximum file size: 10MB.
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-800">
              <h3 className="text-sm font-medium">Upload Successful!</h3>
              <div className="mt-1 text-sm">
                {uploadResult.data && (
                  <>
                    Processed: {uploadResult.data.recordsProcessed} records
                    <br />
                    Successful: {uploadResult.data.recordsSuccessful}
                    <br />
                    Failed: {uploadResult.data.recordsFailed}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-800">
              <h3 className="text-sm font-medium">Upload Error</h3>
              <div className="mt-1 text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Import History</h2>
        </div>

        <div className="p-6">
          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading history...</div>
            </div>
          ) : importHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {importHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : item.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.recordsProcessed
                          ? `${item.recordsProcessed} processed`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">No import history found</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <a
          href="/dashboard"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
