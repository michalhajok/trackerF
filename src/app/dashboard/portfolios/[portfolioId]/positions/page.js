// src/app/(dashboard)/dashboard/portfolios/[portfolioId]/positions/page.js
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePortfolios } from "@/hooks/usePortfolios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
} from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import api from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

export default function PositionsPage() {
  const { portfolioId } = useParams();
  const { data: portfolios = [] } = usePortfolios();
  const [showAddModal, setShowAddModal] = useState(false);
  const [positionFilter, setPositionFilter] = useState("all"); // 'all', 'open', 'closed'
  const [sortBy, setSortBy] = useState("openTime"); // 'symbol', 'openTime', 'pl', 'value'
  const [searchTerm, setSearchTerm] = useState("");

  // Get portfolio info
  const portfolio = portfolios.find((p) => p._id === portfolioId);

  // Fetch positions for this portfolio
  const {
    data: positions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["positions", portfolioId],
    queryFn: () =>
      api
        .get(`/portfolios/${portfolioId}/positions`)
        .then((res) => res.data.data || res.data),
    enabled: !!portfolioId,
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

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

  // Filter and sort positions
  const filteredPositions = positions
    .filter((pos) => {
      if (positionFilter === "open" && pos.status !== "open") return false;
      if (positionFilter === "closed" && pos.status !== "closed") return false;
      if (
        searchTerm &&
        !pos.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "symbol":
          return a.symbol.localeCompare(b.symbol);
        case "pl":
          return (b.grossPL || 0) - (a.grossPL || 0);
        case "value":
          return (b.marketValue || 0) - (a.marketValue || 0);
        case "openTime":
        default:
          return new Date(b.openTime) - new Date(a.openTime);
      }
    });

  const openPositions = positions.filter((pos) => pos.status === "open");
  const closedPositions = positions.filter((pos) => pos.status === "closed");
  const totalValue = openPositions.reduce(
    (sum, pos) => sum + (pos.marketValue || 0),
    0
  );
  const totalPL = positions.reduce((sum, pos) => sum + (pos.grossPL || 0), 0);

  const getStatusBadge = (status) => {
    const variants = {
      open: "success",
      closed: "secondary",
      pending: "warning",
    };
    return variants[status] || "secondary";
  };

  const getTypeColor = (type) => {
    return type === "BUY" ? "text-green-600" : "text-red-600";
  };

  const getPLColor = (pl) => {
    return pl >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pozycje</h1>
          <p className="text-gray-600">Portfolio: {portfolio.name}</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Eksport
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj pozycję
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Otwarte pozycje</p>
                <p className="text-2xl font-bold">{openPositions.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zamknięte pozycje</p>
                <p className="text-2xl font-bold">{closedPositions.length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wartość pozycji</p>
                <p className="text-2xl font-bold">
                  {totalValue.toLocaleString("pl-PL", {
                    style: "currency",
                    currency: portfolio.currency,
                  })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Łączny P&L</p>
                <p className={`text-2xl font-bold ${getPLColor(totalPL)}`}>
                  {totalPL.toLocaleString("pl-PL", {
                    style: "currency",
                    currency: portfolio.currency,
                  })}
                </p>
              </div>
              <div
                className={`w-8 h-8 ${
                  totalPL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalPL >= 0 ? <TrendingUp /> : <TrendingDown />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Szukaj symbolu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-64"
            />

            <Select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">Wszystkie pozycje</option>
              <option value="open">Tylko otwarte</option>
              <option value="closed">Tylko zamknięte</option>
            </Select>

            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="openTime">Data otwarcia</option>
              <option value="symbol">Symbol</option>
              <option value="pl">P&L</option>
              <option value="value">Wartość</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      {error && (
        <Alert variant="error">
          Błąd podczas ładowania pozycji: {error.message}
        </Alert>
      )}

      {filteredPositions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak pozycji
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || positionFilter !== "all"
                ? "Brak pozycji spełniających kryteria wyszukiwania"
                : "W tym portfelu nie ma jeszcze żadnych pozycji"}
            </p>
            {!searchTerm && positionFilter === "all" && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pierwszą pozycję
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pozycje ({filteredPositions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wolumen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena otwarcia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wartość
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPositions.map((position) => (
                    <tr key={position._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {position.symbol}
                        </div>
                        {position.name && (
                          <div className="text-sm text-gray-500">
                            {position.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${getTypeColor(
                            position.type
                          )}`}
                        >
                          {position.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.volume?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.openPrice?.toLocaleString("pl-PL", {
                          style: "currency",
                          currency: portfolio.currency,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.marketValue?.toLocaleString("pl-PL", {
                          style: "currency",
                          currency: portfolio.currency,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getPLColor(position.grossPL)}>
                          {position.grossPL?.toLocaleString("pl-PL", {
                            style: "currency",
                            currency: portfolio.currency,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadge(position.status)}>
                          {position.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(position.openTime).toLocaleDateString(
                            "pl-PL"
                          )}
                        </div>
                        {position.closeTime && (
                          <div className="text-xs text-gray-400 mt-1">
                            Zamknięto:{" "}
                            {new Date(position.closeTime).toLocaleDateString(
                              "pl-PL"
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Position Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>
          <ModalTitle>Dodaj nową pozycję</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input label="Symbol" placeholder="np. AAPL" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Typ">
                <option value="BUY">Kupno</option>
                <option value="SELL">Sprzedaż</option>
              </Select>
              <Input label="Wolumen" type="number" placeholder="100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cena otwarcia"
                type="number"
                step="0.01"
                placeholder="150.00"
              />
              <Input label="Data otwarcia" type="date" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Anuluj
              </Button>
              <Button>Dodaj pozycję</Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
