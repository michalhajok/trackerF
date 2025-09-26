/**
 * WatchlistForm.js - Form component for creating and editing watchlists
 * Handles watchlist creation, editing, and symbol management
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateWatchlist,
  useUpdateWatchlist,
  useWatchlistTemplates,
} from "../../hooks/useWatchlist";
import { useSymbolSearch } from "../../hooks/useMarketData";
import SymbolSearch from "./SymbolSearch";

const WatchlistForm = ({
  watchlist = null, // null for create, watchlist object for edit
  isOpen = false,
  onClose,
  onSuccess,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    symbols: [],
    tags: [],
    isPublic: false,
    isFavorite: false,
    color: "#3B82F6", // Blue default
    template: "",
  });

  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Basic info, 2: Symbols, 3: Settings

  // Hooks
  const createWatchlistMutation = useCreateWatchlist();
  const updateWatchlistMutation = useUpdateWatchlist();
  const { data: templates } = useWatchlistTemplates();

  // Initialize form data when editing
  useEffect(() => {
    if (watchlist && isOpen) {
      setFormData({
        name: watchlist.name || "",
        description: watchlist.description || "",
        symbols: [...(watchlist.symbols || [])],
        tags: [...(watchlist.tags || [])],
        isPublic: watchlist.isPublic || false,
        isFavorite: watchlist.isFavorite || false,
        color: watchlist.color || "#3B82F6",
        template: "",
      });
    } else if (!watchlist && isOpen) {
      // Reset form for new watchlist
      setFormData({
        name: "",
        description: "",
        symbols: [],
        tags: [],
        isPublic: false,
        isFavorite: false,
        color: "#3B82F6",
        template: "",
      });
    }
  }, [watchlist, isOpen]);

  // Form validation
  useEffect(() => {
    const newErrors = {};

    if (step >= 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Watchlist name is required";
      }

      if (formData.name.length > 50) {
        newErrors.name = "Name must be 50 characters or less";
      }
    }

    if (step >= 2) {
      if (formData.symbols.length === 0) {
        newErrors.symbols = "Add at least one symbol";
      }

      if (formData.symbols.length > 100) {
        newErrors.symbols = "Maximum 100 symbols allowed";
      }
    }

    setErrors(newErrors);
  }, [formData, step]);

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addSymbol = (symbol) => {
    if (!formData.symbols.includes(symbol)) {
      setFormData((prev) => ({
        ...prev,
        symbols: [...prev.symbols, symbol],
      }));
    }
  };

  const removeSymbol = (symbol) => {
    setFormData((prev) => ({
      ...prev,
      symbols: prev.symbols.filter((s) => s !== symbol),
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const applyTemplate = (template) => {
    const templateData = templates.find((t) => t.id === template);
    if (templateData) {
      setFormData((prev) => ({
        ...prev,
        name: templateData.name,
        description: templateData.description,
        symbols: [...templateData.symbols],
        tags: [...templateData.tags],
        template: template,
      }));
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const watchlistData = {
        ...formData,
        symbols: formData.symbols,
        tags: formData.tags,
      };

      let result;
      if (watchlist) {
        // Update existing watchlist
        result = await updateWatchlistMutation.mutateAsync({
          id: watchlist.id,
          updates: watchlistData,
        });
      } else {
        // Create new watchlist
        result = await createWatchlistMutation.mutateAsync(watchlistData);
      }

      onSuccess?.(result);
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        symbols: [],
        tags: [],
        isPublic: false,
        isFavorite: false,
        color: "#3B82F6",
        template: "",
      });
      setStep(1);
    } catch (error) {
      console.error("Form submission failed:", error);
      setErrors({ submit: "Failed to save watchlist" });
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isSubmitting =
    createWatchlistMutation.isLoading || updateWatchlistMutation.isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div
          className={`inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {watchlist ? "Edit Watchlist" : "Create New Watchlist"}
              </h2>
              <p className="text-sm text-gray-600">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Basic Information"
                  : step === 2
                  ? "Add Symbols"
                  : "Settings & Preferences"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNum ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Template Selection */}
                {!watchlist && templates && templates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Start with a Template (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {templates.slice(0, 3).map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template.id)}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {template.symbols?.length || 0} symbols
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {template.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watchlist Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="My Technology Stocks"
                    maxLength="50"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData({ description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Track my favorite tech companies..."
                    rows={3}
                    maxLength="200"
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formData.description.length}/200
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="flex items-center space-x-3">
                    {[
                      "#3B82F6",
                      "#EF4444",
                      "#10B981",
                      "#F59E0B",
                      "#8B5CF6",
                      "#EC4899",
                      "#6B7280",
                      "#F97316",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateFormData({ color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color
                            ? "border-gray-400 scale-110"
                            : "border-gray-200 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Add Symbols */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Symbol Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Symbols to Watchlist
                  </label>

                  <SymbolSearch
                    onSymbolSelect={addSymbol}
                    excludeSymbols={formData.symbols}
                    placeholder="Search for stocks, ETFs, crypto..."
                    showRecent={true}
                  />
                </div>

                {/* Selected Symbols */}
                {formData.symbols.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Selected Symbols ({formData.symbols.length})
                    </label>

                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      <div className="divide-y divide-gray-200">
                        {formData.symbols.map((symbol, index) => (
                          <div
                            key={symbol}
                            className="flex items-center justify-between p-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500 w-8">
                                #{index + 1}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {symbol}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock symbol
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSymbol(symbol)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {errors.symbols && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{errors.symbols}</p>
                  </div>
                )}

                {/* Quick Add Popular Symbols */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Add Popular Symbols
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "AAPL",
                      "GOOGL",
                      "MSFT",
                      "TSLA",
                      "AMZN",
                      "NVDA",
                      "META",
                      "NFLX",
                    ].map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        onClick={() => addSymbol(symbol)}
                        disabled={formData.symbols.includes(symbol)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.symbols.includes(symbol)
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {formData.symbols.includes(symbol) ? (
                          <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        ) : (
                          <PlusIcon className="h-4 w-4 inline mr-1" />
                        )}
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 relative">
                      <TagIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter tag name..."
                        maxLength="20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={
                        !currentTag.trim() ||
                        formData.tags.includes(currentTag.trim())
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>

                  {/* Tag List */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Privacy & Sharing
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          updateFormData({ isPublic: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="text-sm text-gray-900">
                            Make watchlist public
                          </span>
                          <div className="text-xs text-gray-500">
                            Others can view and copy this watchlist
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isFavorite}
                        onChange={(e) =>
                          updateFormData({ isFavorite: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-5 w-5 text-yellow-500" />
                        <div>
                          <span className="text-sm text-gray-900">
                            Add to favorites
                          </span>
                          <div className="text-xs text-gray-500">
                            Pin to top of your watchlists
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Watchlist Preview
                  </h4>

                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formData.name || "Untitled Watchlist"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.description || "No description"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formData.symbols.length} symbols</span>
                    <span>{formData.tags.length} tags</span>
                    <span>{formData.isPublic ? "Public" : "Private"}</span>
                    {formData.isFavorite && (
                      <span className="text-yellow-600">⭐ Favorite</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.submit && (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={Object.keys(errors).length > 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={Object.keys(errors).length > 0 || isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {watchlist ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        {watchlist ? "Update Watchlist" : "Create Watchlist"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Quick Watchlist Creator Component
export const QuickWatchlistForm = ({ onWatchlistCreated, className = "" }) => {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createWatchlistMutation = useCreateWatchlist();

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const result = await createWatchlistMutation.mutateAsync({
        name: name.trim(),
        description: "",
        symbols: [],
        tags: [],
        isPublic: false,
        isFavorite: false,
      });

      onWatchlistCreated?.(result);
      setName("");
    } catch (error) {
      console.error("Quick create failed:", error);
      alert("Failed to create watchlist");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form
      onSubmit={handleQuickCreate}
      className={`flex items-center space-x-3 ${className}`}
    >
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Quick create watchlist..."
          maxLength="50"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || isCreating}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isCreating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create
          </>
        )}
      </button>
    </form>
  );
};

export default WatchlistForm;
