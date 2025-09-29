/**
 * ReportScheduler.js - Component for scheduling automated reports
 * Handles report scheduling, frequency, and recipients management
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useScheduledReports, useCreateReport } from "../../hooks/useReports";

const ReportScheduler = ({
  reportConfig = null,
  onScheduleCreated,
  onScheduleUpdated,
  className = "",
}) => {
  const [schedule, setSchedule] = useState({
    enabled: false,
    frequency: "monthly", // daily, weekly, monthly, quarterly, yearly
    time: "09:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Weekly settings
    dayOfWeek: 1, // 0 = Sunday, 1 = Monday, etc.

    // Monthly settings
    dayOfMonth: 1, // 1-31

    // Recipients
    recipients: [],

    // Advanced settings
    format: "pdf",
    includeAttachments: true,
    customSubject: "",
    customMessage: "",

    // Report configuration
    reportConfig: reportConfig || {
      type: "portfolio",
      sections: {
        summary: true,
        positions: true,
        performance: true,
      },
      dateRange: { preset: "1M" },
    },
  });

  const [newRecipient, setNewRecipient] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch existing scheduled reports
  const { data: scheduledReports, isLoading, refetch } = useScheduledReports();

  const createReportMutation = useCreateReport();

  // Validation
  useEffect(() => {
    const newErrors = {};

    if (schedule.enabled) {
      if (schedule.recipients.length === 0) {
        newErrors.recipients = "At least one recipient is required";
      }

      if (!schedule.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        newErrors.time = "Invalid time format";
      }

      if (
        schedule.frequency === "monthly" &&
        (schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31)
      ) {
        newErrors.dayOfMonth = "Day of month must be between 1-31";
      }

      if (
        schedule.frequency === "weekly" &&
        (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6)
      ) {
        newErrors.dayOfWeek = "Invalid day of week";
      }
    }

    setErrors(newErrors);
  }, [schedule]);

  const updateSchedule = (updates) => {
    setSchedule((prev) => ({ ...prev, ...updates }));
  };

  const addRecipient = () => {
    if (newRecipient.trim() && validateEmail(newRecipient)) {
      setSchedule((prev) => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient.trim()],
      }));
      setNewRecipient("");
    }
  };

  const removeRecipient = (email) => {
    setSchedule((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== email),
    }));
  };

  const calculateNextRun = () => {
    if (!schedule.enabled) return null;

    const now = new Date();
    let nextRun = new Date();

    // Parse time
    const [hours, minutes] = schedule.time.split(":").map(Number);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case "daily":
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case "weekly":
        const currentDay = nextRun.getDay();
        const targetDay = schedule.dayOfWeek;
        let daysToAdd = targetDay - currentDay;

        if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }

        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;

      case "monthly":
        nextRun.setDate(schedule.dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case "quarterly":
        const currentQuarter = Math.floor(nextRun.getMonth() / 3);
        const nextQuarterStart = new Date(
          nextRun.getFullYear(),
          (currentQuarter + 1) * 3,
          1
        );
        nextQuarterStart.setHours(hours, minutes, 0, 0);
        nextRun = nextQuarterStart;
        break;

      case "yearly":
        nextRun.setMonth(0, 1); // January 1st
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }

    return nextRun;
  };

  const handleSaveSchedule = async () => {
    if (Object.keys(errors).length > 0) return;

    try {
      const scheduleData = {
        ...schedule,
        nextRun: calculateNextRun()?.toISOString(),
      };

      // Create or update scheduled report
      const result = await createReportMutation.mutateAsync(scheduleData);

      onScheduleCreated?.(result);
      alert("Report schedule created successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("Failed to create schedule");
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const nextRun = calculateNextRun();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Report Scheduler
            </h2>
            <p className="text-sm text-gray-600">
              Automate report generation and delivery
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Enable Scheduled Reports
            </h3>
            <p className="text-xs text-gray-500">
              Automatically generate and send reports
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.enabled}
              onChange={(e) => updateSchedule({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.enabled && (
          <>
            {/* Frequency Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={schedule.frequency}
                    onChange={(e) =>
                      updateSchedule({ frequency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => updateSchedule({ time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.time && (
                    <p className="text-xs text-red-600 mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Weekly Settings */}
              {schedule.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week *
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <button
                          key={day}
                          onClick={() => updateSchedule({ dayOfWeek: index })}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            schedule.dayOfWeek === index
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Monthly Settings */}
              {schedule.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Month *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth}
                    onChange={(e) =>
                      updateSchedule({ dayOfMonth: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.dayOfMonth && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.dayOfMonth}
                    </p>
                  )}
                </div>
              )}

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={schedule.timezone}
                  onChange={(e) => updateSchedule({ timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/New_York">
                    Eastern Time (EST/EDT)
                  </option>
                  <option value="America/Chicago">
                    Central Time (CST/CDT)
                  </option>
                  <option value="America/Los_Angeles">
                    Pacific Time (PST/PDT)
                  </option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Warsaw">Warsaw (CET/CEST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Email Recipients
              </h3>

              {/* Add Recipient */}
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                    placeholder="Enter email address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={addRecipient}
                  disabled={
                    !newRecipient.trim() || !validateEmail(newRecipient)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {errors.recipients && (
                <p className="text-xs text-red-600">{errors.recipients}</p>
              )}

              {/* Recipients List */}
              {schedule.recipients.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Recipients ({schedule.recipients.length})
                  </div>
                  <div className="space-y-2">
                    {schedule.recipients.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{email}</span>
                        </div>
                        <button
                          onClick={() => removeRecipient(email)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Email Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Email Settings
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Format
                </label>
                <select
                  value={schedule.format}
                  onChange={(e) => updateSchedule({ format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line (optional)
                </label>
                <input
                  type="text"
                  value={schedule.customSubject}
                  onChange={(e) =>
                    updateSchedule({ customSubject: e.target.value })
                  }
                  placeholder="Scheduled Portfolio Report - {date}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {"{date}"} for dynamic date insertion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Message (optional)
                </label>
                <textarea
                  value={schedule.customMessage}
                  onChange={(e) =>
                    updateSchedule({ customMessage: e.target.value })
                  }
                  placeholder="Your scheduled portfolio report is attached..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAttachments"
                  checked={schedule.includeAttachments}
                  onChange={(e) =>
                    updateSchedule({ includeAttachments: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="includeAttachments"
                  className="ml-2 text-sm text-gray-700"
                >
                  Include additional data attachments
                </label>
              </div>
            </div>

            {/* Schedule Preview */}
            {nextRun && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Next Scheduled Run
                    </h4>
                    <p className="text-sm text-blue-600 mt-1">
                      {nextRun.toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Will be sent to {schedule.recipients.length} recipient
                      {schedule.recipients.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Existing Scheduled Reports */}
        {scheduledReports?.data && scheduledReports.data.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Existing Scheduled Reports
            </h3>
            <div className="space-y-3">
              {scheduledReports.data.map((scheduledReport) => (
                <div
                  key={scheduledReport._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {scheduledReport.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {scheduledReport.frequency} •{" "}
                        {scheduledReport.recipients?.length} recipients
                      </p>
                      {scheduledReport.nextRun && (
                        <p className="text-xs text-gray-500">
                          Next:{" "}
                          {new Date(
                            scheduledReport.nextRun
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        scheduledReport.isActive
                          ? "text-orange-600 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={scheduledReport.isActive ? "Pause" : "Resume"}
                    >
                      {scheduledReport.isActive ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete schedule"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {schedule.enabled && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveSchedule}
              disabled={
                Object.keys(errors).length > 0 || createReportMutation.isLoading
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {createReportMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Save Schedule
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportScheduler;
