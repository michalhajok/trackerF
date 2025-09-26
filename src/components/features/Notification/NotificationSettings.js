/**
 * NotificationSettings.js - Notification preferences and configuration
 * Comprehensive settings for all notification types and delivery methods
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BellIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  TestTubeIcon,
} from "@heroicons/react/24/outline";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useTestNotification,
} from "../../hooks/useNotifications";

const NotificationSettings = ({
  onClose,
  showTestButtons = true,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("general"); // general, alerts, sounds, delivery
  const [settings, setSettings] = useState({
    // General settings
    enabled: true,
    showBadge: true,
    groupSimilar: true,
    autoMarkAsRead: false,

    // Sound settings
    soundEnabled: true,
    soundVolume: 70,
    soundType: "default", // default, chime, beep, custom
    customSoundUrl: "",

    // Alert settings
    priceAlerts: true,
    portfolioAlerts: true,
    tradingAlerts: true,
    systemAlerts: true,
    securityAlerts: true,
    newsAlerts: false,

    // Delivery settings
    browserNotifications: true,
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,

    // Timing
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Advanced
    maxNotifications: 100,
    retentionDays: 30,
    priorityFiltering: true,
    deduplicate: true,
  });

  const [testResults, setTestResults] = useState({});

  // Hooks
  const { data: currentSettings, isLoading } = useNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings();
  const testNotificationMutation = useTestNotification();

  // Initialize settings
  useEffect(() => {
    if (currentSettings && !isLoading) {
      setSettings(currentSettings);
    }
  }, [currentSettings, isLoading]);

  const updateSettings = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync(settings);
      alert("Notification settings saved successfully!");
      onClose?.();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    }
  };

  const handleTestNotification = async (type) => {
    try {
      setTestResults((prev) => ({ ...prev, [type]: "testing" }));

      const result = await testNotificationMutation.mutateAsync({
        type,
        settings,
      });

      setTestResults((prev) => ({
        ...prev,
        [type]: result.success ? "success" : "failed",
      }));

      // Clear result after 3 seconds
      setTimeout(() => {
        setTestResults((prev) => ({ ...prev, [type]: null }));
      }, 3000);
    } catch (error) {
      console.error("Test notification failed:", error);
      setTestResults((prev) => ({ ...prev, [type]: "failed" }));

      setTimeout(() => {
        setTestResults((prev) => ({ ...prev, [type]: null }));
      }, 3000);
    }
  };

  const renderTestButton = (type, label) => {
    const testState = testResults[type];

    return (
      <button
        onClick={() => handleTestNotification(type)}
        disabled={testState === "testing" || testNotificationMutation.isLoading}
        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
          testState === "success"
            ? "bg-green-100 text-green-800"
            : testState === "failed"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {testState === "testing" ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        ) : testState === "success" ? (
          <CheckCircleIcon className="h-4 w-4 mr-2" />
        ) : testState === "failed" ? (
          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        ) : (
          <TestTubeIcon className="h-4 w-4 mr-2" />
        )}
        {testState === "testing"
          ? "Testing..."
          : testState === "success"
          ? "Sent!"
          : testState === "failed"
          ? "Failed"
          : `Test ${label}`}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Settings
            </h2>
            <p className="text-sm text-gray-600">
              Configure your notification preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "general", name: "General", icon: BellIcon },
            { id: "alerts", name: "Alerts", icon: ExclamationTriangleIcon },
            { id: "sounds", name: "Sounds", icon: SpeakerWaveIcon },
            { id: "delivery", name: "Delivery", icon: EnvelopeIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                General Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      updateSettings({ enabled: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      Enable notifications
                    </span>
                    <div className="text-xs text-gray-500">
                      Master switch for all notifications
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.showBadge}
                    onChange={(e) =>
                      updateSettings({ showBadge: e.target.checked })
                    }
                    disabled={!settings.enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      Show notification badge
                    </span>
                    <div className="text-xs text-gray-500">
                      Display unread count on notification bell
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.groupSimilar}
                    onChange={(e) =>
                      updateSettings({ groupSimilar: e.target.checked })
                    }
                    disabled={!settings.enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      Group similar notifications
                    </span>
                    <div className="text-xs text-gray-500">
                      Combine related notifications to reduce clutter
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoMarkAsRead}
                    onChange={(e) =>
                      updateSettings({ autoMarkAsRead: e.target.checked })
                    }
                    disabled={!settings.enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      Auto-mark as read
                    </span>
                    <div className="text-xs text-gray-500">
                      Automatically mark notifications as read when viewed
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Retention Settings */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-900">
                Data Management
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Notifications
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={settings.maxNotifications}
                    onChange={(e) =>
                      updateSettings({
                        maxNotifications: parseInt(e.target.value),
                      })
                    }
                    disabled={!settings.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum notifications to keep
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.retentionDays}
                    onChange={(e) =>
                      updateSettings({
                        retentionDays: parseInt(e.target.value),
                      })
                    }
                    disabled={!settings.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-delete after this period
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Settings */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Alert Types</h3>

              <div className="space-y-3">
                {[
                  {
                    key: "priceAlerts",
                    label: "Price Alerts",
                    desc: "Price threshold and movement alerts",
                  },
                  {
                    key: "portfolioAlerts",
                    label: "Portfolio Alerts",
                    desc: "Portfolio value and performance alerts",
                  },
                  {
                    key: "tradingAlerts",
                    label: "Trading Alerts",
                    desc: "Order fills, failures, and opportunities",
                  },
                  {
                    key: "systemAlerts",
                    label: "System Alerts",
                    desc: "System maintenance and updates",
                  },
                  {
                    key: "securityAlerts",
                    label: "Security Alerts",
                    desc: "Login attempts and security events",
                  },
                  {
                    key: "newsAlerts",
                    label: "News Alerts",
                    desc: "Market news and company updates",
                  },
                ].map((alert) => (
                  <label
                    key={alert.key}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={settings[alert.key]}
                      onChange={(e) =>
                        updateSettings({ [alert.key]: e.target.checked })
                      }
                      disabled={!settings.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">
                        {alert.label}
                      </span>
                      <div className="text-xs text-gray-500">{alert.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filtering */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-900">
                Priority Filtering
              </h4>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.priorityFiltering}
                  onChange={(e) =>
                    updateSettings({ priorityFiltering: e.target.checked })
                  }
                  disabled={!settings.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Enable priority filtering
                  </span>
                  <div className="text-xs text-gray-500">
                    Only show high and medium priority notifications
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.deduplicate}
                  onChange={(e) =>
                    updateSettings({ deduplicate: e.target.checked })
                  }
                  disabled={!settings.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <div>
                  <span className="text-sm text-gray-900">
                    Remove duplicates
                  </span>
                  <div className="text-xs text-gray-500">
                    Prevent duplicate notifications for the same event
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Sound Settings */}
        {activeTab === "sounds" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sound Preferences
              </h3>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    updateSettings({ soundEnabled: e.target.checked })
                  }
                  disabled={!settings.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <div className="flex items-center space-x-2">
                  {settings.soundEnabled ? (
                    <SpeakerWaveIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <SpeakerXMarkIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-900">
                    Enable notification sounds
                  </span>
                </div>
              </label>

              {settings.soundEnabled && (
                <>
                  {/* Volume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume: {settings.soundVolume}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.soundVolume}
                      onChange={(e) =>
                        updateSettings({
                          soundVolume: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${settings.soundVolume}%, #e5e7eb ${settings.soundVolume}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>

                  {/* Sound Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Sound
                    </label>
                    <select
                      value={settings.soundType}
                      onChange={(e) =>
                        updateSettings({ soundType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="chime">Chime</option>
                      <option value="beep">Beep</option>
                      <option value="bell">Bell</option>
                      <option value="custom">Custom Sound</option>
                    </select>
                  </div>

                  {/* Custom Sound URL */}
                  {settings.soundType === "custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Sound URL
                      </label>
                      <input
                        type="url"
                        value={settings.customSoundUrl}
                        onChange={(e) =>
                          updateSettings({ customSoundUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/notification.mp3"
                      />
                    </div>
                  )}

                  {/* Test Sound */}
                  {showTestButtons && (
                    <div className="flex items-center space-x-3">
                      {renderTestButton("sound", "Sound")}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Delivery Settings */}
        {activeTab === "delivery" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delivery Methods
              </h3>

              <div className="space-y-4">
                {/* Browser Notifications */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.browserNotifications}
                      onChange={(e) =>
                        updateSettings({
                          browserNotifications: e.target.checked,
                        })
                      }
                      disabled={!settings.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <div className="flex items-center space-x-2">
                      <ComputerDesktopIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="text-sm text-gray-900">
                          Browser Notifications
                        </span>
                        <div className="text-xs text-gray-500">
                          Desktop notifications while browsing
                        </div>
                      </div>
                    </div>
                  </label>

                  {settings.browserNotifications && showTestButtons && (
                    <div className="mt-3">
                      {renderTestButton("browser", "Browser")}
                    </div>
                  )}
                </div>

                {/* Email Notifications */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        updateSettings({ emailNotifications: e.target.checked })
                      }
                      disabled={!settings.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <span className="text-sm text-gray-900">
                          Email Notifications
                        </span>
                        <div className="text-xs text-gray-500">
                          Important alerts sent to your email
                        </div>
                      </div>
                    </div>
                  </label>

                  {settings.emailNotifications && showTestButtons && (
                    <div className="mt-3">
                      {renderTestButton("email", "Email")}
                    </div>
                  )}
                </div>

                {/* Push Notifications */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) =>
                        updateSettings({ pushNotifications: e.target.checked })
                      }
                      disabled={!settings.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <div className="flex items-center space-x-2">
                      <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />
                      <div>
                        <span className="text-sm text-gray-900">
                          Mobile Push Notifications
                        </span>
                        <div className="text-xs text-gray-500">
                          Push notifications to mobile devices
                        </div>
                      </div>
                    </div>
                  </label>

                  {settings.pushNotifications && showTestButtons && (
                    <div className="mt-3">
                      {renderTestButton("push", "Push")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-900">
                Quiet Hours
              </h4>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.quietHoursEnabled}
                  onChange={(e) =>
                    updateSettings({ quietHoursEnabled: e.target.checked })
                  }
                  disabled={!settings.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm text-gray-900">
                    Enable quiet hours
                  </span>
                </div>
              </label>

              {settings.quietHoursEnabled && (
                <div className="ml-8 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) =>
                        updateSettings({ quietHoursStart: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) =>
                        updateSettings({ quietHoursEnd: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <div className="text-sm text-gray-600">
          Changes are saved automatically
        </div>

        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {updateSettingsMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test All Notifications */}
      {showTestButtons && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Test Notifications
              </h4>
              <p className="text-xs text-blue-600">
                Verify your notification setup is working
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {renderTestButton("toast", "Toast")}
              {renderTestButton("all", "All Types")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
