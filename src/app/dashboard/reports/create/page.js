/**
 * /dashboard/reports/create/page.js - Report builder page
 * Interactive report creation and editing interface
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  useReport,
  useCreateReport,
  useUpdateReport,
  useReportTemplates,
} from "../../../hooks/useReports";
import ReportBuilder from "../../../components/reports/ReportBuilder";

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const templateId = searchParams.get("template");

  const [activeTab, setActiveTab] = useState("builder"); // builder, schedule, sharing, settings
  const [reportData, setReportData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Hooks
  const { data: existingReport } = useReport(editId, { enabled: !!editId });
  const { data: templates } = useReportTemplates();
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();

  // Initialize with template or existing report
  useEffect(() => {
    if (templateId && templates) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setReportData({
          ...template,
          id: undefined, // Remove ID for new report
          name: `${template.name} (Copy)`,
        });
      }
    } else if (existingReport) {
      setReportData(existingReport);
    }
  }, [templateId, templates, existingReport]);

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      let result;
      if (editId) {
        result = await updateReportMutation.mutateAsync({
          id: editId,
          updates: data,
        });
      } else {
        result = await createReportMutation.mutateAsync(data);
      }

      // Navigate to the report view
      router.push(`/dashboard/reports/${result.id}`);
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm("Are you sure you want to cancel? Unsaved changes will be lost.")
    ) {
      router.push("/dashboard/reports");
    }
  };

  const renderScheduleTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Schedule Settings
      </h3>

      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableSchedule"
            checked={reportData?.schedule?.enabled || false}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                schedule: { ...prev?.schedule, enabled: e.target.checked },
              }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="enableSchedule"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Enable automatic report generation
          </label>
        </div>

        {reportData?.schedule?.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={reportData?.schedule?.frequency || "monthly"}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    schedule: { ...prev?.schedule, frequency: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportData?.schedule?.startDate || ""}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      schedule: {
                        ...prev?.schedule,
                        startDate: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={reportData?.schedule?.time || "09:00"}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      schedule: { ...prev?.schedule, time: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Recipients
              </label>
              <textarea
                placeholder="Enter email addresses separated by commas"
                value={reportData?.schedule?.recipients || ""}
                onChange={(e) =>
                  setReportData((prev) => ({
                    ...prev,
                    schedule: { ...prev?.schedule, recipients: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Reports will be automatically emailed to these recipients
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSharingTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sharing Settings
      </h3>

      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={reportData?.sharing?.isPublic || false}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                sharing: { ...prev?.sharing, isPublic: e.target.checked },
              }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Make report publicly accessible
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowDownload"
            checked={reportData?.sharing?.allowDownload !== false}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                sharing: { ...prev?.sharing, allowDownload: e.target.checked },
              }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="allowDownload"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Allow viewers to download report
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Protection (Optional)
          </label>
          <input
            type="password"
            placeholder="Enter password to protect report"
            value={reportData?.sharing?.password || ""}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                sharing: { ...prev?.sharing, password: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for no password protection
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date (Optional)
          </label>
          <input
            type="date"
            value={reportData?.sharing?.expirationDate || ""}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                sharing: { ...prev?.sharing, expirationDate: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Report link will expire on this date
          </p>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Report Settings
      </h3>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              value={reportData?.format?.pageSize || "A4"}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  format: { ...prev?.format, pageSize: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientation
            </label>
            <select
              value={reportData?.format?.orientation || "portrait"}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  format: { ...prev?.format, orientation: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Margins
          </label>
          <select
            value={reportData?.format?.margins || "normal"}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                format: { ...prev?.format, margins: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeDisclaimer"
            checked={reportData?.settings?.includeDisclaimer || false}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                settings: {
                  ...prev?.settings,
                  includeDisclaimer: e.target.checked,
                },
              }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="includeDisclaimer"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Include performance disclaimer
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeLogo"
            checked={reportData?.settings?.includeLogo !== false}
            onChange={(e) =>
              setReportData((prev) => ({
                ...prev,
                settings: { ...prev?.settings, includeLogo: e.target.checked },
              }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="includeLogo"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            Include company logo
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Reports
              </button>

              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {editId ? "Edit Report" : "Create New Report"}
                </h1>
                <p className="text-sm text-gray-600">
                  {editId
                    ? "Modify your existing report"
                    : "Build a custom report with drag-and-drop components"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-4">
            {[
              { id: "builder", name: "Builder", icon: DocumentTextIcon },
              { id: "schedule", name: "Schedule", icon: ClockIcon },
              { id: "sharing", name: "Sharing", icon: ShareIcon },
              { id: "settings", name: "Settings", icon: Cog6ToothIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "builder" ? (
          <ReportBuilder
            reportId={editId}
            onSave={handleSave}
            onCancel={handleCancel}
            className="h-full"
          />
        ) : (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {activeTab === "schedule" && renderScheduleTab()}
              {activeTab === "sharing" && renderSharingTab()}
              {activeTab === "settings" && renderSettingsTab()}
            </div>
          </div>
        )}
      </div>

      {/* Footer - only show for non-builder tabs */}
      {activeTab !== "builder" && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="text-sm text-gray-600">
              Changes are saved automatically
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSave(reportData)}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editId
                  ? "Update Report"
                  : "Create Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
