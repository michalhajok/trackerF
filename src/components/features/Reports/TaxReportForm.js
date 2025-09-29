/**
 * TaxReportForm.js - Tax report specific form component
 * Specialized form for tax report generation with tax-specific options
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCreateTaxReport } from "../../hooks/useReports";

const TaxReportForm = ({
  onReportGenerated,
  initialYear = new Date().getFullYear() - 1,
  className = "",
}) => {
  const [taxConfig, setTaxConfig] = useState({
    // Basic settings
    taxYear: initialYear,
    reportName: `Tax Report ${initialYear}`,
    country: "US", // US, PL, GB, etc.
    currency: "USD",

    // Tax jurisdiction
    state: "", // For US taxes
    taxIdNumber: "",

    // Report sections
    sections: {
      capitalGains: true,
      dividendIncome: true,
      interestIncome: true,
      foreignIncome: true,
      tradingFees: true,
      withholdingTax: true,
      currencyConversions: true,
      summary: true,
    },

    // Calculation methods
    methods: {
      costBasis: "FIFO", // FIFO, LIFO, SpecificId, Average
      shortTermThreshold: 365, // days
      roundingPrecision: 2,
      includeCrypto: true,
      includeOptions: true,
      includeFutures: false,
    },

    // Filters
    filters: {
      minAmount: 0,
      onlyRealized: true,
      excludeWashSales: true,
      includeAll: false, // Include all transactions regardless of amount
    },

    // Format options
    formatting: {
      format: "pdf",
      includeDetails: true,
      includeCalculations: true,
      includeSupportingDocs: false,
      groupByType: true,
      sortBy: "date", // date, amount, symbol
    },

    // Compliance
    compliance: {
      includeDisclaimer: true,
      certifyAccuracy: false,
      preparerInfo: {
        name: "",
        firm: "",
        license: "",
      },
    },
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [estimatedTax, setEstimatedTax] = useState(null);

  const createTaxReportMutation = useCreateTaxReport();

  // Validation
  useEffect(() => {
    const errors = [];

    if (!taxConfig.reportName.trim()) {
      errors.push("Report name is required");
    }

    if (
      taxConfig.taxYear < 2020 ||
      taxConfig.taxYear > new Date().getFullYear()
    ) {
      errors.push("Invalid tax year");
    }

    if (taxConfig.country === "US" && !taxConfig.state) {
      errors.push("State is required for US tax reports");
    }

    // At least one section must be enabled
    const sectionsEnabled = Object.values(taxConfig.sections).some(Boolean);
    if (!sectionsEnabled) {
      errors.push("At least one report section must be enabled");
    }

    setValidationErrors(errors);
  }, [taxConfig]);

  const updateConfig = (updates) => {
    setTaxConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateSection = (section, enabled) => {
    setTaxConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: enabled },
    }));
  };

  const updateMethod = (method, value) => {
    setTaxConfig((prev) => ({
      ...prev,
      methods: { ...prev.methods, [method]: value },
    }));
  };

  const updateFilter = (filter, value) => {
    setTaxConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [filter]: value },
    }));
  };

  const updateFormatting = (key, value) => {
    setTaxConfig((prev) => ({
      ...prev,
      formatting: { ...prev.formatting, [key]: value },
    }));
  };

  const handleGenerateReport = async () => {
    if (validationErrors.length > 0) return;

    try {
      const result = await createTaxReportMutation.mutateAsync(taxConfig);
      onReportGenerated?.(result);

      // Show success message
      alert(
        "Tax report generated successfully! Check your reports list to download."
      );
    } catch (error) {
      console.error("Tax report generation failed:", error);
      alert("Tax report generation failed: " + error.message);
    }
  };

  // Mock tax estimation (would be calculated from actual data)
  useEffect(() => {
    // Simulate tax calculation
    setTimeout(() => {
      setEstimatedTax({
        shortTermGains: 5420.5,
        longTermGains: 12680.3,
        dividends: 1250.75,
        interest: 45.2,
        fees: 234.5,
        estimatedTax: 3847.25,
        effectiveRate: 18.2,
      });
    }, 1000);
  }, [taxConfig.taxYear, taxConfig.methods.costBasis]);

  const getTaxRateInfo = (country) => {
    const rates = {
      US: { shortTerm: "Up to 37%", longTerm: "0%, 15%, or 20%" },
      PL: { shortTerm: "19%", longTerm: "19%" },
      GB: { shortTerm: "10% or 20%", longTerm: "10% or 20%" },
    };
    return rates[country] || rates.US;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-3">
          <ReceiptPercentIcon className="h-6 w-6 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tax Report Generator
            </h2>
            <p className="text-sm text-gray-600">
              Generate comprehensive tax documentation
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Basic Tax Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Year *
              </label>
              <select
                value={taxConfig.taxYear}
                onChange={(e) =>
                  updateConfig({ taxYear: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Name *
              </label>
              <input
                type="text"
                value={taxConfig.reportName}
                onChange={(e) => updateConfig({ reportName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tax Report 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={taxConfig.country}
                onChange={(e) => updateConfig({ country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US">United States</option>
                <option value="PL">Poland</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="DE">Germany</option>
              </select>
            </div>

            {taxConfig.country === "US" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={taxConfig.state}
                  onChange={(e) => updateConfig({ state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CA, NY, TX..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Tax Calculation Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Calculation Methods
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  Tax Rate Information ({taxConfig.country})
                </p>
                <div className="mt-1 space-y-1 text-blue-700">
                  <p>
                    Short-term gains:{" "}
                    {getTaxRateInfo(taxConfig.country).shortTerm}
                  </p>
                  <p>
                    Long-term gains:{" "}
                    {getTaxRateInfo(taxConfig.country).longTerm}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Basis Method
              </label>
              <select
                value={taxConfig.methods.costBasis}
                onChange={(e) => updateMethod("costBasis", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FIFO">First In, First Out (FIFO)</option>
                <option value="LIFO">Last In, First Out (LIFO)</option>
                <option value="SpecificId">Specific Identification</option>
                <option value="Average">Average Cost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short-term Threshold (days)
              </label>
              <input
                type="number"
                value={taxConfig.methods.shortTermThreshold}
                onChange={(e) =>
                  updateMethod("shortTermThreshold", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="730"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Asset Types to Include
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxConfig.methods.includeCrypto}
                  onChange={(e) =>
                    updateMethod("includeCrypto", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Cryptocurrency
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxConfig.methods.includeOptions}
                  onChange={(e) =>
                    updateMethod("includeOptions", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Options</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={taxConfig.methods.includeFutures}
                  onChange={(e) =>
                    updateMethod("includeFutures", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Futures</span>
              </label>
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Report Sections</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries({
              capitalGains: "Capital Gains & Losses",
              dividendIncome: "Dividend Income",
              interestIncome: "Interest Income",
              foreignIncome: "Foreign Income",
              tradingFees: "Trading Fees & Expenses",
              withholdingTax: "Foreign Tax Withheld",
              currencyConversions: "Currency Conversions",
              summary: "Tax Summary & Totals",
            }).map(([section, label]) => (
              <label
                key={section}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={taxConfig.sections[section]}
                  onChange={(e) => updateSection(section, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Filters & Options
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount Threshold
              </label>
              <input
                type="number"
                step="0.01"
                value={taxConfig.filters.minAmount}
                onChange={(e) =>
                  updateFilter("minAmount", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Exclude transactions below this amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rounding Precision
              </label>
              <select
                value={taxConfig.methods.roundingPrecision}
                onChange={(e) =>
                  updateMethod("roundingPrecision", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 decimals ($1.23)</option>
                <option value={0}>Whole dollars ($1)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={taxConfig.filters.onlyRealized}
                onChange={(e) => updateFilter("onlyRealized", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Only realized gains/losses
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={taxConfig.filters.excludeWashSales}
                onChange={(e) =>
                  updateFilter("excludeWashSales", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Apply wash sale rules
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={taxConfig.formatting.includeDetails}
                onChange={(e) =>
                  updateFormatting("includeDetails", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include detailed transaction listings
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={taxConfig.formatting.includeCalculations}
                onChange={(e) =>
                  updateFormatting("includeCalculations", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show calculation methodology
              </span>
            </label>
          </div>
        </div>

        {/* Tax Estimate Preview */}
        {estimatedTax && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Estimated Tax Impact
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">
                  ${estimatedTax.shortTermGains.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Short-term Gains</div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">
                  ${estimatedTax.longTermGains.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Long-term Gains</div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-600">
                  ${estimatedTax.dividends.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600">Dividend Income</div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <div className="text-lg font-bold text-orange-600">
                  ${estimatedTax.estimatedTax.toLocaleString()}
                </div>
                <div className="text-sm text-orange-600">Est. Tax Owed</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Tax Estimate Disclaimer</p>
                  <p className="mt-1">
                    This is an estimate based on available data. Consult a tax
                    professional for accurate calculations and advice. Effective
                    rate: {estimatedTax.effectiveRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance & Certification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Compliance</h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={taxConfig.compliance.includeDisclaimer}
                onChange={(e) =>
                  updateConfig({
                    compliance: {
                      ...taxConfig.compliance,
                      includeDisclaimer: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include tax disclaimer
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={taxConfig.compliance.certifyAccuracy}
                onChange={(e) =>
                  updateConfig({
                    compliance: {
                      ...taxConfig.compliance,
                      certifyAccuracy: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              />
              <span className="ml-2 text-sm text-gray-700">
                I certify that the information in this report is accurate to the
                best of my knowledge
              </span>
            </label>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Configuration Issues
                </h4>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateReport}
            disabled={
              validationErrors.length > 0 || createTaxReportMutation.isLoading
            }
            className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
          >
            {createTaxReportMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Tax Report...
              </>
            ) : (
              <>
                <ReceiptPercentIcon className="h-5 w-5 mr-3" />
                Generate Tax Report
              </>
            )}
          </button>
        </div>

        {/* Important Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 mt-1" />
            <div className="text-sm text-gray-700">
              <h4 className="font-medium text-gray-900 mb-2">
                Important Tax Notice
              </h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>This report is for informational purposes only</li>
                <li>Consult a qualified tax professional for tax advice</li>
                <li>Tax laws vary by jurisdiction and change frequently</li>
                <li>Verify all calculations before filing tax returns</li>
                <li>Keep records of all supporting documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxReportForm;
