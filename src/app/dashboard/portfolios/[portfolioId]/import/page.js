// src/app/(dashboard)/dashboard/portfolios/[portfolioId]/import/page.js
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortfolios } from "@/hooks/usePortfolios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Upload,
  FileText,
  Database,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function ImportPage() {
  const { portfolioId } = useParams();
  const router = useRouter();
  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios();

  const [importMethod, setImportMethod] = useState("file"); // 'file', 'broker', 'manual'
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  const portfolio = portfolios.find((p) => p._id === portfolioId);

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
  };

  const handleFileImport = async () => {
    if (!selectedFile) {
      setError("Wybierz plik do importu");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("portfolioId", portfolioId);

      const response = await fetch(
        `/api/proxy/portfolios/${portfolioId}/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResults(result.data);
      } else {
        setError(result.message || "Błąd podczas importu pliku");
      }
    } catch (err) {
      setError("Błąd połączenia podczas importu");
      console.error("Import error:", err);
    } finally {
      setImporting(false);
    }
  };

  const handleBrokerSync = async () => {
    if (!portfolio.canSync || !portfolio.canSync()) {
      setError("Synchronizacja z brokerem nie jest dostępna dla tego portfela");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/proxy/portfolios/${portfolioId}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResults({
          method: "broker",
          message: "Synchronizacja z brokerem rozpoczęta",
          status: "in_progress",
        });
      } else {
        setError(result.message || "Błąd podczas synchronizacji z brokerem");
      }
    } catch (err) {
      setError("Błąd połączenia podczas synchronizacji");
      console.error("Broker sync error:", err);
    } finally {
      setImporting(false);
    }
  };

  const supportedFormats = [
    {
      name: "CSV",
      description: "Pliki CSV z danymi transakcji",
      extension: ".csv",
    },
    {
      name: "Excel",
      description: "Pliki Excel (.xlsx, .xls)",
      extension: ".xlsx,.xls",
    },
    {
      name: "JSON",
      description: "Pliki JSON z danymi API",
      extension: ".json",
    },
    {
      name: "XML",
      description: "Pliki XML z raportami brokerów",
      extension: ".xml",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Danych</h1>
        <p className="text-gray-600">
          Importuj dane do portfela {portfolio.name}
        </p>
      </div>

      {/* Import Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Import */}
        <Card
          className={`cursor-pointer transition-all ${
            importMethod === "file"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => setImportMethod("file")}
        >
          <CardHeader className="text-center">
            <Upload className="w-12 h-12 mx-auto text-primary-600 mb-2" />
            <CardTitle>Import z Pliku</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Prześlij plik z danymi transakcji w formacie CSV, Excel, JSON lub
              XML
            </p>
          </CardContent>
        </Card>

        {/* Broker Sync */}
        <Card
          className={`cursor-pointer transition-all ${
            importMethod === "broker"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => setImportMethod("broker")}
        >
          <CardHeader className="text-center">
            <Database className="w-12 h-12 mx-auto text-primary-600 mb-2" />
            <CardTitle>Synchronizacja z Brokerem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Pobierz dane bezpośrednio z API brokera {portfolio.broker}
            </p>
            {!portfolio.canSync ||
              (!portfolio.canSync() && (
                <Badge variant="warning" className="mt-2">
                  Niedostępne
                </Badge>
              ))}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card
          className={`cursor-pointer transition-all ${
            importMethod === "manual"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => setImportMethod("manual")}
        >
          <CardHeader className="text-center">
            <FileText className="w-12 h-12 mx-auto text-primary-600 mb-2" />
            <CardTitle>Wprowadzenie Ręczne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Dodaj pozycje i transakcje ręcznie przez formularz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Content */}
      {importMethod === "file" && (
        <Card>
          <CardHeader>
            <CardTitle>Import z Pliku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supported Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Obsługiwane formaty:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportedFormats.map((format) => (
                  <div
                    key={format.name}
                    className="text-center p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="font-medium text-sm">{format.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wybierz plik
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json,.xml"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Wybrany plik: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Import Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Opcje importu:</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">
                    Pomiń duplikaty (na podstawie daty i symbolu)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">
                    Automatycznie zaktualizuj kursy walut
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" />
                  <span className="text-sm">
                    Usuń istniejące dane przed importem
                  </span>
                </label>
              </div>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleFileImport}
              disabled={!selectedFile || importing}
              loading={importing}
              //   className="w-full"
              variant="secondary"
            >
              {importing ? "Importowanie..." : "Importuj dane"}
            </Button>

            {/* Template Download */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Potrzebujesz szablonu?
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Pobierz szablon CSV z przykładowymi danymi, aby łatwiej
                przygotować import.
              </p>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Pobierz szablon CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {importMethod === "broker" && (
        <Card>
          <CardHeader>
            <CardTitle>Synchronizacja z Brokerem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <div>
                <p className="font-medium">Informacje o synchronizacji</p>
                <p className="text-sm">
                  Synchronizacja pobierze najnowsze dane z Twojego konta{" "}
                  {portfolio.broker}. Proces może potrwać kilka minut.
                </p>
              </div>
            </Alert>

            {portfolio.brokerConfig?.lastSync && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Ostatnia synchronizacja:
                </h4>
                <p className="text-sm text-gray-600">
                  {new Date(portfolio.brokerConfig.lastSync).toLocaleString(
                    "pl-PL"
                  )}
                </p>
                <Badge
                  variant={
                    portfolio.brokerConfig.lastSyncStatus === "success"
                      ? "success"
                      : "error"
                  }
                  className="mt-2"
                >
                  {portfolio.brokerConfig.lastSyncStatus}
                </Badge>
              </div>
            )}

            <Button
              onClick={handleBrokerSync}
              disabled={!portfolio.canSync || !portfolio.canSync() || importing}
              loading={importing}
              className="w-full"
            >
              {importing ? "Synchronizowanie..." : "Rozpocznij synchronizację"}
            </Button>
          </CardContent>
        </Card>
      )}

      {importMethod === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Wprowadzenie Ręczne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Przejdź do sekcji pozycji, aby dodać transakcje ręcznie.
            </p>
            <Button asChild>
              <Link href={`/dashboard/portfolios/${portfolioId}/positions`}>
                Dodaj pozycje ręcznie
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Wyniki Importu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                {importResults.message}
              </p>
              {importResults.imported && (
                <p className="text-sm text-gray-600">
                  Zaimportowano {importResults.imported} pozycji
                </p>
              )}
              {importResults.skipped && (
                <p className="text-sm text-gray-600">
                  Pominięto {importResults.skipped} duplikatów
                </p>
              )}
            </div>
            <Button asChild className="mt-4">
              <Link href={`/dashboard/portfolios/${portfolioId}/positions`}>
                Zobacz zaimportowane pozycje
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <div>
            <p className="font-medium">Błąd importu</p>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/portfolios/${portfolioId}`}>
            Powrót do portfela
          </Link>
        </Button>
      </div>
    </div>
  );
}
