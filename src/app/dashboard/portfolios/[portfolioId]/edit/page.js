// src/app/(dashboard)/dashboard/portfolios/[portfolioId]/edit/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortfolios, useUpdatePortfolio } from "@/hooks/usePortfolios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

export default function EditPortfolioPage() {
  const { portfolioId } = useParams();
  const router = useRouter();
  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios();
  const {
    mutate: updatePortfolio,
    isLoading: updating,
    error,
  } = useUpdatePortfolio(portfolioId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    settings: {
      autoSync: true,
      notificationsEnabled: true,
      displayPreferences: {
        showInDashboard: true,
        colorCode: "#3B82F6",
      },
    },
  });

  const portfolio = portfolios.find((p) => p._id === portfolioId);

  useEffect(() => {
    if (portfolio) {
      setFormData({
        name: portfolio.name || "",
        description: portfolio.description || "",
        settings: {
          autoSync: portfolio.settings?.autoSync ?? true,
          notificationsEnabled:
            portfolio.settings?.notificationsEnabled ?? true,
          displayPreferences: {
            showInDashboard:
              portfolio.settings?.displayPreferences?.showInDashboard ?? true,
            colorCode:
              portfolio.settings?.displayPreferences?.colorCode || "#3B82F6",
          },
        },
      });
    }
  }, [portfolio]);

  if (portfoliosLoading) return <LoadingSpinner size="lg" />;

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Portfolio nie znaleziony
        </h2>
        <Button asChild>
          <Link href="/dashboard/portfolios">Powrót do listy portfeli</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePortfolio(formData, {
      onSuccess: () => {
        router.push(`/dashboard/portfolios/${portfolioId}`);
      },
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleDisplayPreferenceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        displayPreferences: {
          ...prev.settings.displayPreferences,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edytuj Portfolio</h1>
        <p className="text-gray-600">
          Zmień ustawienia portfela {portfolio.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Podstawowe Informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nazwa Portfela"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="Wprowadź nazwę portfela"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Opcjonalny opis portfela"
              />
            </div>

            {/* Read-only broker info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broker
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                  {portfolio.broker}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waluta
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                  {portfolio.currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Automatyczna synchronizacja
                </label>
                <p className="text-xs text-gray-500">
                  Automatycznie pobieraj dane z brokera
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.settings.autoSync}
                onChange={(e) =>
                  handleSettingsChange("autoSync", e.target.checked)
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Powiadomienia
                </label>
                <p className="text-xs text-gray-500">
                  Otrzymuj powiadomienia o zmianach w portfelu
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.settings.notificationsEnabled}
                onChange={(e) =>
                  handleSettingsChange("notificationsEnabled", e.target.checked)
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pokaż na dashboardzie
                </label>
                <p className="text-xs text-gray-500">
                  Wyświetlaj ten portfel na głównym dashboardzie
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.settings.displayPreferences.showInDashboard}
                onChange={(e) =>
                  handleDisplayPreferenceChange(
                    "showInDashboard",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kolor portfela
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.settings.displayPreferences.colorCode}
                  onChange={(e) =>
                    handleDisplayPreferenceChange("colorCode", e.target.value)
                  }
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.settings.displayPreferences.colorCode}
                  onChange={(e) =>
                    handleDisplayPreferenceChange("colorCode", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            Błąd podczas zapisywania: {error.message}
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/portfolios/${portfolioId}`}>Anuluj</Link>
          </Button>
          <Button type="submit" loading={updating} disabled={updating}>
            {updating ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </div>
  );
}
