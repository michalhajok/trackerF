/**
 * Settings Page
 * User profile settings and application preferences
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { apiEndpoints } from "@/lib/api";
import {
  User,
  Lock,
  Bell,
  Palette,
  Download,
  Upload,
  Shield,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/contexts/ToastContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data Management", icon: Download },
  ];

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => apiEndpoints.user.getSettings(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const settings = settingsData?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">
          Manage your account and application preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "preferences" && (
            <PreferencesTab settings={settings} />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab settings={settings} />
          )}
          {activeTab === "data" && <DataManagementTab />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Account Type</span>
                <span className="text-sm font-medium">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Member Since</span>
                <span className="text-sm font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Storage Used</span>
                <span className="text-sm font-medium">2.3 MB</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user }) {
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => apiEndpoints.user.updateProfile(data),
    onSuccess: () => {
      success("Profile updated successfully!");
    },
    onError: (error) => {
      showError(error.message || "Failed to update profile");
    },
  });

  const onSubmit = async (data) => {
    await updateProfileMutation.mutateAsync(data);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Profile Information
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || updateProfileMutation.isPending}
          >
            {isSubmitting || updateProfileMutation.isPending ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Security Tab Component
function SecurityTab() {
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => apiEndpoints.user.changePassword(data),
    onSuccess: () => {
      success("Password changed successfully!");
      reset();
    },
    onError: (error) => {
      showError(error.message || "Failed to change password");
    },
  });

  const onSubmit = async (data) => {
    await changePasswordMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Change Password
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Current Password
            </label>
            <Input
              id="currentPassword"
              type="password"
              error={!!errors.currentPassword}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-error-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              error={!!errors.newPassword}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-error-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || changePasswordMutation.isPending}
            >
              {isSubmitting || changePasswordMutation.isPending ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Two-Factor Authentication
        </h3>
        <p className="text-slate-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor
          authentication.
        </p>
        <Button variant="outline">
          <Shield className="w-4 h-4 mr-2" />
          Enable 2FA
        </Button>
      </Card>
    </div>
  );
}

// Preferences Tab Component
function PreferencesTab({ settings }) {
  const [preferences, setPreferences] = useState({
    currency: settings.currency || "PLN",
    dateFormat: settings.dateFormat || "DD/MM/YYYY",
    language: settings.language || "en",
    theme: settings.theme || "light",
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Preferences</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Default Currency
          </label>
          <Select
            value={preferences.currency}
            onValueChange={(value) =>
              setPreferences((prev) => ({ ...prev, currency: value }))
            }
          >
            <option value="PLN">Polish Złoty (PLN)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date Format
          </label>
          <Select
            value={preferences.dateFormat}
            onValueChange={(value) =>
              setPreferences((prev) => ({ ...prev, dateFormat: value }))
            }
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Theme
          </label>
          <Select
            value={preferences.theme}
            onValueChange={(value) =>
              setPreferences((prev) => ({ ...prev, theme: value }))
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </Card>
  );
}

// Notifications Tab Component
function NotificationsTab({ settings }) {
  const [notifications, setNotifications] = useState({
    emailNotifications: settings.emailNotifications ?? true,
    priceAlerts: settings.priceAlerts ?? true,
    portfolioReports: settings.portfolioReports ?? false,
    systemUpdates: settings.systemUpdates ?? true,
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900">
              Email Notifications
            </h4>
            <p className="text-sm text-slate-500">
              Receive notifications via email
            </p>
          </div>
          <Checkbox
            checked={notifications.emailNotifications}
            onCheckedChange={(checked) =>
              setNotifications((prev) => ({
                ...prev,
                emailNotifications: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900">Price Alerts</h4>
            <p className="text-sm text-slate-500">
              Get notified of significant price changes
            </p>
          </div>
          <Checkbox
            checked={notifications.priceAlerts}
            onCheckedChange={(checked) =>
              setNotifications((prev) => ({ ...prev, priceAlerts: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900">
              Portfolio Reports
            </h4>
            <p className="text-sm text-slate-500">
              Weekly portfolio performance summaries
            </p>
          </div>
          <Checkbox
            checked={notifications.portfolioReports}
            onCheckedChange={(checked) =>
              setNotifications((prev) => ({
                ...prev,
                portfolioReports: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900">
              System Updates
            </h4>
            <p className="text-sm text-slate-500">
              Important updates and announcements
            </p>
          </div>
          <Checkbox
            checked={notifications.systemUpdates}
            onCheckedChange={(checked) =>
              setNotifications((prev) => ({ ...prev, systemUpdates: checked }))
            }
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </Card>
  );
}

// Data Management Tab Component
function DataManagementTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Export Data
        </h3>
        <p className="text-slate-600 mb-4">
          Download your portfolio data in various formats for backup or
          analysis.
        </p>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export All Data (JSON)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Positions (CSV)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Cash Operations (CSV)
          </Button>
        </div>
      </Card>

      <Card className="p-6 border-error-200">
        <h3 className="text-lg font-semibold text-error-600 mb-4">
          Danger Zone
        </h3>
        <p className="text-slate-600 mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button variant="destructive" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
