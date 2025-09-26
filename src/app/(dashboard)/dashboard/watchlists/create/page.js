/**
 * /dashboard/watchlists/create/page.js - Create new watchlist page
 * Form for creating new watchlists with symbol search and templates
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  StarIcon,
  CheckIcon,
  ChartBarIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateWatchlist,
  useSearchSymbols,
  useWatchlistTemplates,
} from "../../../hooks/useWatchlists";
import { useMarketData } from "../../../hooks/useMarketData";
import SymbolCard from "../../../components/market-data/SymbolCard";

export default function CreateWatchlistPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    isPublic: false,
    tags: [],
  });

  const [symbols, setSymbols] = useState([]);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});

  // Hooks
  const createWatchlistMutation = useCreateWatchlist();
  const { data: searchResults, isLoading: searchLoading } = useSearchSymbols(
    symbolSearch,
    {
      enabled: symbolSearch.length >= 2,
    }
  );
  const { data: templates } = useWatchlistTemplates();

  // Color options
  const colorOptions = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Red", value: "#EF4444" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Pink", value: "#EC4899" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Gray", value: "#6B7280" },
  ];

  // Predefined templates
  const predefinedTemplates = [
    {
      id: "tech-giants",
      name: "Tech Giants",
      description: "Major technology companies",
      symbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"],
      color: "#3B82F6",
      tags: ["technology", "large-cap"],
    },
    {
      id: "sp500-top",
      name: "S&P 500 Top 10",
      description: "Top 10 S&P 500 companies by market cap",
      symbols: [
        "AAPL",
        "MSFT",
        "GOOGL",
        "AMZN",
        "NVDA",
        "TSLA",
        "META",
        "UNH",
        "JNJ",
        "V",
      ],
      color: "#10B981",
      tags: ["sp500", "large-cap"],
    },
    {
      id: "dividend-stocks",
      name: "Dividend Aristocrats",
      description: "High dividend yield stocks",
      symbols: ["KO", "PG", "JNJ", "PFE", "XOM", "CVX", "T", "VZ"],
      color: "#F59E0B",
      tags: ["dividends", "income"],
    },
    {
      id: "crypto-related",
      name: "Crypto Related",
      description: "Companies involved in cryptocurrency",
      symbols: ["COIN", "MSTR", "SQ", "PYPL", "NVDA", "AMD"],
      color: "#8B5CF6",
      tags: ["crypto", "fintech"],
    },
    {
      id: "growth-stocks",
      name: "Growth Stocks",
      description: "High growth potential companies",
      symbols: ["TSLA", "NVDA", "AMZN", "NFLX", "CRM", "UBER", "ZOOM"],
      color: "#EF4444",
      tags: ["growth", "momentum"],
    },
    {
      id: "renewable-energy",
      name: "Renewable Energy",
      description: "Clean energy and sustainability",
      symbols: ["TSLA", "ENPH", "SEDG", "NEE", "BEP", "ICLN"],
      color: "#10B981",
      tags: ["renewable", "esg", "energy"],
    },
  ];

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle symbol addition
  const handleAddSymbol = (symbol) => {
    if (!symbols.find((s) => s.symbol === symbol.symbol)) {
      setSymbols((prev) => [...prev, symbol]);
    }
    setSymbolSearch("");
  };

  // Handle symbol removal
  const handleRemoveSymbol = (symbolToRemove) => {
    setSymbols((prev) => prev.filter((s) => s.symbol !== symbolToRemove));
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      color: template.color,
      tags: template.tags || [],
    }));

    // Add template symbols
    const templateSymbols = template.symbols.map((symbol) => ({
      symbol,
      name: `${symbol} Company`, // This would be fetched from API in real app
      price: 0,
    }));
    setSymbols(templateSymbols);
  };

  // Handle tag management
  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      handleFormChange("tags", [...formData.tags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleFormChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Watchlist name is required";
    }

    if (symbols.length === 0) {
      newErrors.symbols = "At least one symbol is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const watchlistData = {
        ...formData,
        symbols: symbols.map((s) => s.symbol),
      };

      const result = await createWatchlistMutation.mutateAsync(watchlistData);
      router.push(`/dashboard/watchlists/${result.id}`);
    } catch (error) {
      console.error("Failed to create watchlist:", error);
      setErrors({ submit: "Failed to create watchlist. Please try again." });
    }
  };

  const handleCancel = () => {
    if (formData.name || symbols.length > 0) {
      if (
        confirm("Are you sure you want to cancel? All changes will be lost.")
      ) {
        router.push("/dashboard/watchlists");
      }
    } else {
      router.push("/dashboard/watchlists");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Watchlists
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Watchlist
              </h1>
              <p className="text-gray-600">
                Build a custom watchlist to track your favorite symbols
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: template.color }}
                      ></div>
                      <h4 className="font-medium text-gray-900">
                        {template.name}
                      </h4>
                      {selectedTemplate?.id === template.id && (
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watchlist Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter watchlist name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your watchlist"
                    rows={3}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleFormChange("color", color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value
                            ? "border-gray-400 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      handleFormChange("isPublic", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Make this watchlist public (others can view and copy)
                  </label>
                </div>
              </div>
            </div>

            {/* Symbol Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Symbols</h3>
                <span className="text-sm text-gray-500">
                  {symbols.length} symbols added
                </span>
              </div>

              {/* Symbol Search */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={symbolSearch}
                    onChange={(e) => setSymbolSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.symbols ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Search for symbols to add (e.g., AAPL, Tesla, technology stocks)"
                  />
                </div>
                {errors.symbols && (
                  <p className="text-red-600 text-sm mt-1">{errors.symbols}</p>
                )}

                {/* Search Results */}
                {symbolSearch.length >= 2 && (
                  <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Searching...
                        </p>
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          onClick={() => handleAddSymbol(result)}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {result.symbol}
                              </div>
                              <div className="text-sm text-gray-500">
                                {result.name}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                ${result.price?.toFixed(2)}
                              </div>
                              <div
                                className={`text-xs ${
                                  result.changePercent >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {result.changePercent >= 0 ? "+" : ""}
                                {result.changePercent?.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : symbolSearch.length >= 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No symbols found for {symbolSearch}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Added Symbols */}
              {symbols.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Added Symbols:</h4>
                  <div className="flex flex-wrap gap-2">
                    {symbols.map((symbol) => (
                      <span
                        key={symbol.symbol}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <span className="font-medium text-blue-900">
                          {symbol.symbol}
                        </span>
                        <button
                          onClick={() => handleRemoveSymbol(symbol.symbol)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview
              </h3>

              <div className="space-y-4">
                {/* Watchlist Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <h4 className="font-semibold text-gray-900">
                      {formData.name || "Untitled Watchlist"}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {formData.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {symbols.length} symbols
                    </span>
                    {formData.isPublic && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Public
                      </span>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      createWatchlistMutation.isLoading ||
                      !formData.name ||
                      symbols.length === 0
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createWatchlistMutation.isLoading
                      ? "Creating..."
                      : "Create Watchlist"}
                  </button>

                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Tips:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use templates for quick setup</li>
                    <li>• Add relevant tags for organization</li>
                    <li>• Make it public to share with others</li>
                    <li>• You can edit everything later</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
