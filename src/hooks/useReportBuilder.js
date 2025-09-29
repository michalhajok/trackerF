/**
 * useReportBuilder.js - Dedicated hook for report builder functionality
 * Handles report configuration, templates, and generation
 */

import { useState, useCallback, useMemo } from "react";
import { useCreateReport, useCreateTaxReport } from "./useReports";
import { useCashOperations } from "./useApi";

export const useReportBuilder = () => {
  const [config, setConfig] = useState({
    // Basic info
    name: "",
    description: "",
    type: "portfolio", // portfolio, tax, performance, custom
    format: "pdf", // pdf, excel, csv, json

    // Date range
    dateRange: {
      preset: "1M", // 1W, 1M, 3M, 6M, 1Y, YTD, custom
      start: null,
      end: null,
    },

    // Report sections
    sections: {
      coverPage: true,
      summary: true,
      positions: true,
      closedPositions: false,
      transactions: true,
      performance: true,
      allocation: true,
      cashFlow: false,
      dividends: false,
      fees: false,
      taxes: false,
      benchmarks: false,
      charts: true,
    },

    // Filters
    filters: {
      symbols: [], // Specific symbols to include
      accounts: [], // Specific accounts
      categories: [], // Position categories
      minAmount: null,
      maxAmount: null,
      onlyProfit: false,
      onlyLoss: false,
    },

    // Formatting options
    formatting: {
      currency: "USD",
      locale: "en-US",
      includeCharts: true,
      includeLogos: true,
      pageOrientation: "portrait", // portrait, landscape
      fontSize: "medium", // small, medium, large
      colorTheme: "professional", // professional, colorful, minimal
      watermark: "",
    },

    // Scheduling (for future reports)
    schedule: {
      enabled: false,
      frequency: "monthly", // daily, weekly, monthly, quarterly, yearly
      dayOfWeek: 1, // 0-6 for weekly
      dayOfMonth: 1, // 1-31 for monthly
      time: "09:00",
      recipients: [],
      timezone: "UTC",
    },
  });

  const createReportMutation = useCreateReport();
  const createTaxReportMutation = useCreateTaxReport();

  // Update configuration
  const updateConfig = useCallback((updates) => {
    setConfig((prev) => {
      if (typeof updates === "function") {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  }, []);

  // Update specific section
  const updateSection = useCallback((section, enabled) => {
    setConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: enabled },
    }));
  }, []);

  // Update filters
  const updateFilter = useCallback((filter, value) => {
    setConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [filter]: value },
    }));
  }, []);

  // Update formatting
  const updateFormatting = useCallback((key, value) => {
    setConfig((prev) => ({
      ...prev,
      formatting: { ...prev.formatting, [key]: value },
    }));
  }, []);

  // Update date range
  const updateDateRange = useCallback((updates) => {
    setConfig((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, ...updates },
    }));
  }, []);

  // Set date range preset
  const setDateRangePreset = useCallback(
    (preset) => {
      const end = new Date();
      let start = new Date();

      switch (preset) {
        case "1W":
          start.setDate(end.getDate() - 7);
          break;
        case "1M":
          start.setMonth(end.getMonth() - 1);
          break;
        case "3M":
          start.setMonth(end.getMonth() - 3);
          break;
        case "6M":
          start.setMonth(end.getMonth() - 6);
          break;
        case "1Y":
          start.setFullYear(end.getFullYear() - 1);
          break;
        case "YTD":
          start = new Date(end.getFullYear(), 0, 1);
          break;
        case "custom":
          // Don't auto-set dates for custom range
          updateDateRange({ preset });
          return;
      }

      updateDateRange({
        preset,
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      });
    },
    [updateDateRange]
  );

  // Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    if (!config.name.trim()) {
      errors.push("Report name is required");
    }

    if (config.name.length > 100) {
      errors.push("Report name must be less than 100 characters");
    }

    if (config.dateRange.preset === "custom") {
      if (!config.dateRange.start) {
        errors.push("Start date is required for custom range");
      }
      if (!config.dateRange.end) {
        errors.push("End date is required for custom range");
      }
      if (
        config.dateRange.start &&
        config.dateRange.end &&
        new Date(config.dateRange.start) >= new Date(config.dateRange.end)
      ) {
        errors.push("Start date must be before end date");
      }
    }

    const enabledSections = Object.values(config.sections).some(Boolean);
    if (!enabledSections) {
      errors.push("At least one section must be enabled");
    }

    if (config.schedule.enabled) {
      if (!config.schedule.recipients.length) {
        errors.push("Recipients are required for scheduled reports");
      }

      if (
        config.schedule.frequency === "weekly" &&
        (config.schedule.dayOfWeek < 0 || config.schedule.dayOfWeek > 6)
      ) {
        errors.push("Invalid day of week for weekly schedule");
      }

      if (
        config.schedule.frequency === "monthly" &&
        (config.schedule.dayOfMonth < 1 || config.schedule.dayOfMonth > 31)
      ) {
        errors.push("Invalid day of month for monthly schedule");
      }
    }

    return errors;
  }, [config]);

  const isValid = validationErrors.length === 0;

  // Generate report
  const generateReport = useCallback(async () => {
    if (!isValid) {
      throw new Error(
        "Configuration is invalid: " + validationErrors.join(", ")
      );
    }

    try {
      let result;

      if (config.type === "tax") {
        result = await createTaxReportMutation.mutateAsync(config);
      } else {
        result = await createReportMutation.mutateAsync(config);
      }

      return result;
    } catch (error) {
      console.error("Report generation failed:", error);
      throw error;
    }
  }, [
    config,
    isValid,
    validationErrors,
    createReportMutation,
    createTaxReportMutation,
  ]);

  // Reset to defaults
  const resetConfig = useCallback(() => {
    setConfig({
      name: "",
      description: "",
      type: "portfolio",
      format: "pdf",
      dateRange: { preset: "1M", start: null, end: null },
      sections: {
        coverPage: true,
        summary: true,
        positions: true,
        closedPositions: false,
        transactions: true,
        performance: true,
        allocation: true,
        cashFlow: false,
        dividends: false,
        fees: false,
        taxes: false,
        benchmarks: false,
        charts: true,
      },
      filters: {
        symbols: [],
        accounts: [],
        categories: [],
        minAmount: null,
        maxAmount: null,
        onlyProfit: false,
        onlyLoss: false,
      },
      formatting: {
        currency: "USD",
        locale: "en-US",
        includeCharts: true,
        includeLogos: true,
        pageOrientation: "portrait",
        fontSize: "medium",
        colorTheme: "professional",
        watermark: "",
      },
      schedule: {
        enabled: false,
        frequency: "monthly",
        dayOfWeek: 1,
        dayOfMonth: 1,
        time: "09:00",
        recipients: [],
        timezone: "UTC",
      },
    });
  }, []);

  // Load from template
  const loadTemplate = useCallback((template) => {
    setConfig((prev) => ({
      ...prev,
      ...template,
      name: template.name || prev.name,
      type: template.type || prev.type,
      sections: { ...prev.sections, ...template.sections },
      formatting: { ...prev.formatting, ...template.formatting },
    }));
  }, []);

  // Export configuration
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Import configuration
  const importConfig = useCallback((configJson) => {
    try {
      const importedConfig = JSON.parse(configJson);
      setConfig(importedConfig);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Invalid configuration format" };
    }
  }, []);

  return {
    config,
    updateConfig,
    updateSection,
    updateFilter,
    updateFormatting,
    updateDateRange,
    setDateRangePreset,
    validationErrors,
    isValid,
    generateReport,
    resetConfig,
    loadTemplate,
    exportConfig,
    importConfig,
    isGenerating:
      createReportMutation.isLoading || createTaxReportMutation.isLoading,
  };
};

export const useReportTemplates = () => {
  const templates = useMemo(
    () => [
      {
        id: "basic-portfolio",
        name: "Basic Portfolio Report",
        description: "Simple overview of current positions and performance",
        type: "portfolio",
        format: "pdf",
        sections: {
          summary: true,
          positions: true,
          performance: true,
          allocation: true,
          charts: true,
        },
        dateRange: { preset: "1M" },
      },
      {
        id: "comprehensive-portfolio",
        name: "Comprehensive Portfolio Report",
        description: "Detailed analysis with all sections included",
        type: "portfolio",
        format: "pdf",
        sections: {
          coverPage: true,
          summary: true,
          positions: true,
          closedPositions: true,
          transactions: true,
          performance: true,
          allocation: true,
          cashFlow: true,
          dividends: true,
          fees: true,
          charts: true,
        },
        dateRange: { preset: "3M" },
      },
      {
        id: "tax-report-annual",
        name: "Annual Tax Report",
        description: "Complete tax documentation for annual filing",
        type: "tax",
        format: "pdf",
        sections: {
          summary: true,
          closedPositions: true,
          transactions: true,
          dividends: true,
          fees: true,
          taxes: true,
        },
        dateRange: { preset: "1Y" },
        formatting: {
          includeCharts: false,
          colorTheme: "minimal",
        },
      },
      {
        id: "performance-analysis",
        name: "Performance Analysis",
        description: "Detailed performance metrics and comparisons",
        type: "performance",
        format: "pdf",
        sections: {
          summary: true,
          performance: true,
          allocation: true,
          benchmarks: true,
          charts: true,
        },
        dateRange: { preset: "6M" },
        formatting: {
          colorTheme: "colorful",
          includeCharts: true,
        },
      },
      {
        id: "monthly-summary",
        name: "Monthly Summary",
        description: "Monthly portfolio overview for regular monitoring",
        type: "portfolio",
        format: "pdf",
        sections: {
          summary: true,
          positions: true,
          transactions: true,
          performance: true,
          charts: false,
        },
        dateRange: { preset: "1M" },
        schedule: {
          enabled: true,
          frequency: "monthly",
          dayOfMonth: 1,
          time: "09:00",
        },
      },
      {
        id: "quarterly-board",
        name: "Quarterly Board Report",
        description: "Executive summary for board presentations",
        type: "performance",
        format: "pdf",
        sections: {
          coverPage: true,
          summary: true,
          performance: true,
          allocation: true,
          benchmarks: true,
          charts: true,
        },
        dateRange: { preset: "3M" },
        formatting: {
          colorTheme: "professional",
          pageOrientation: "landscape",
          fontSize: "large",
        },
      },
      {
        id: "excel-export",
        name: "Excel Data Export",
        description: "Raw data export for external analysis",
        type: "custom",
        format: "excel",
        sections: {
          positions: true,
          closedPositions: true,
          transactions: true,
          cashFlow: true,
          dividends: true,
          fees: true,
        },
        dateRange: { preset: "YTD" },
        formatting: {
          includeCharts: false,
          includeLogos: false,
        },
      },
    ],
    []
  );

  const getTemplate = useCallback(
    (templateId) => {
      return templates.find((t) => t.id === templateId);
    },
    [templates]
  );

  const getTemplatesByType = useCallback(
    (type) => {
      return templates.filter((t) => t.type === type);
    },
    [templates]
  );

  return {
    templates,
    getTemplate,
    getTemplatesByType,
  };
};

export const useReportPreview = (config) => {
  const [previewData, setPreviewData] = useState({
    sections: [],
    estimatedPages: 0,
    estimatedSize: "0 MB",
    generationTime: "0 seconds",
  });

  const { data: cashOperations } = useCashOperations({
    dateFrom: config.dateRange.start,
    dateTo: config.dateRange.end,
  });

  // Calculate preview data based on configuration
  useMemo(() => {
    const sections = [];
    let pageCount = 0;

    // Cover page
    if (config.sections.coverPage) {
      sections.push({
        name: "Cover Page",
        pages: 1,
        description: "Title and report info",
      });
      pageCount += 1;
    }

    // Summary
    if (config.sections.summary) {
      sections.push({
        name: "Executive Summary",
        pages: 1,
        description: "Key metrics and highlights",
      });
      pageCount += 1;
    }

    // Positions
    if (config.sections.positions) {
      const estimatedPositions = 20; // Mock data - would come from actual query
      const positionPages = Math.ceil(estimatedPositions / 10);
      sections.push({
        name: "Current Positions",
        pages: positionPages,
        description: `${estimatedPositions} positions`,
      });
      pageCount += positionPages;
    }

    // Closed positions
    if (config.sections.closedPositions) {
      const estimatedClosed = 50; // Mock data
      const closedPages = Math.ceil(estimatedClosed / 15);
      sections.push({
        name: "Closed Positions",
        pages: closedPages,
        description: `${estimatedClosed} closed positions`,
      });
      pageCount += closedPages;
    }

    // Transactions
    if (config.sections.transactions) {
      const transactionCount = cashOperations?.length || 100;
      const transactionPages = Math.ceil(transactionCount / 20);
      sections.push({
        name: "Transactions",
        pages: transactionPages,
        description: `${transactionCount} transactions`,
      });
      pageCount += transactionPages;
    }

    // Performance
    if (config.sections.performance) {
      sections.push({
        name: "Performance Analysis",
        pages: 2,
        description: "Returns, volatility, and metrics",
      });
      pageCount += 2;
    }

    // Allocation
    if (config.sections.allocation) {
      sections.push({
        name: "Portfolio Allocation",
        pages: 1,
        description: "Asset allocation breakdown",
      });
      pageCount += 1;
    }

    // Cash flow
    if (config.sections.cashFlow) {
      sections.push({
        name: "Cash Flow Analysis",
        pages: 1,
        description: "Deposits, withdrawals, and cash summary",
      });
      pageCount += 1;
    }

    // Additional sections
    if (config.sections.dividends) {
      sections.push({
        name: "Dividend Income",
        pages: 1,
        description: "Dividend payments received",
      });
      pageCount += 1;
    }

    if (config.sections.fees) {
      sections.push({
        name: "Fees & Expenses",
        pages: 1,
        description: "Trading fees and expenses",
      });
      pageCount += 1;
    }

    if (config.sections.taxes) {
      sections.push({
        name: "Tax Information",
        pages: 1,
        description: "Tax calculations and obligations",
      });
      pageCount += 1;
    }

    if (config.sections.benchmarks) {
      sections.push({
        name: "Benchmark Comparison",
        pages: 1,
        description: "Performance vs market indices",
      });
      pageCount += 1;
    }

    // Estimate file size (rough calculation)
    let sizeEstimate = pageCount * 0.2; // 200KB per page base
    if (config.formatting.includeCharts) {
      sizeEstimate += pageCount * 0.3; // Additional 300KB for charts
    }
    if (config.formatting.includeLogos) {
      sizeEstimate += 0.1; // 100KB for logos
    }

    // Estimate generation time
    const generationTime = Math.max(
      5,
      pageCount * 2 + (config.formatting.includeCharts ? 10 : 0)
    );

    setPreviewData({
      sections,
      estimatedPages: pageCount,
      estimatedSize:
        sizeEstimate > 1
          ? `${sizeEstimate.toFixed(1)} MB`
          : `${(sizeEstimate * 1000).toFixed(0)} KB`,
      generationTime: `${generationTime} seconds`,
    });
  }, [config, cashOperations]);

  return previewData;
};

// export const useReportBuilder = () => {
//   const builderHook = useReportBuilderConfig();
//   const templatesHook = useReportTemplates();
//   const previewData = useReportPreview(builderHook.config);

//   return {
//     ...builderHook,
//     ...templatesHook,
//     preview: previewData,
//   };
// };

export default useReportBuilder;
