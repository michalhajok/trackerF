/**
 * useReports.js - Dedicated hook for reports management
 * Handles report generation, scheduling, and download operations
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints } from "../lib/api";

const QUERY_KEYS = {
  reports: "reports",
  report: "report",
  scheduled: "reports-scheduled",
  status: "report-status",
};

export const useReports = (params = {}) => {
  const [filters, setFilters] = useState({
    type: "all", // all, portfolio, tax, performance, custom
    status: "all", // all, pending, completed, failed
    format: "all", // all, pdf, excel, csv
    dateRange: { start: null, end: null },
    sortBy: "createdAt",
    sortOrder: "desc",
    ...params,
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.reports, filters],
    queryFn: () => apiEndpoints.reports.getAll(filters),
    staleTime: 60000, // 1 minute
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      status: "all",
      format: "all",
      dateRange: { start: null, end: null },
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  }, []);

  return {
    ...query,
    filters,
    updateFilters,
    clearFilters,
    reports: query.data?.data || [],
    totalCount: query.data?.pagination?.totalCount || 0,
  };
};

export const useReport = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.report, id],
    queryFn: () => apiEndpoints.reports.getById(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

export const useReportStatus = (id, options = {}) => {
  const { autoRefresh = false, refreshInterval = 5000 } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.status, id],
    queryFn: () => apiEndpoints.reports.getStatus(id),
    enabled: !!id,
    staleTime: 0, // Always fresh for status checks
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchIntervalInBackground: autoRefresh,
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.scheduled],
    queryFn: () => apiEndpoints.reports.getScheduled(),
    staleTime: 300000, // 5 minutes
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.create,
    onSuccess: (newReport) => {
      // Add to reports cache
      queryClient.setQueryData([QUERY_KEYS.reports], (oldData) => {
        if (!oldData) return { data: [newReport.data] };
        return {
          ...oldData,
          data: [newReport.data, ...(oldData.data || [])],
        };
      });

      queryClient.invalidateQueries([QUERY_KEYS.reports]);
    },
  });
};

export const useCreateTaxReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.createTax,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.reports]);
    },
  });
};

export const useDownloadReport = () => {
  const [downloading, setDownloading] = useState({});

  const downloadReport = useCallback(async (reportId, filename) => {
    setDownloading((prev) => ({ ...prev, [reportId]: true }));

    try {
      const response = await apiEndpoints.reports.download(reportId);

      // Create blob and trigger download
      const blob = new Blob([response], {
        type: response.type || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error("Download error:", error);
      return {
        success: false,
        error: error.message || "Download failed",
      };
    } finally {
      setDownloading((prev) => ({ ...prev, [reportId]: false }));
    }
  }, []);

  return {
    downloadReport,
    downloading,
    isDownloading: (reportId) => downloading[reportId] || false,
  };
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.delete,
    onMutate: async (reportId) => {
      await queryClient.cancelQueries([QUERY_KEYS.reports]);

      const previousData = queryClient.getQueryData([QUERY_KEYS.reports]);

      queryClient.setQueryData([QUERY_KEYS.reports], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.filter((r) => r._id !== reportId) || [],
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEYS.reports], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.reports]);
    },
  });
};

export const useRetryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiEndpoints.reports.retry,
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries([QUERY_KEYS.report, reportId]);
      queryClient.invalidateQueries([QUERY_KEYS.reports]);
      queryClient.invalidateQueries([QUERY_KEYS.status, reportId]);
    },
  });
};

export const useReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    type: "portfolio", // portfolio, tax, performance, custom
    format: "pdf", // pdf, excel, csv
    dateRange: {
      start: null,
      end: null,
      preset: "1M", // 1W, 1M, 3M, 6M, 1Y, custom
    },
    sections: {
      summary: true,
      positions: true,
      transactions: true,
      performance: true,
      allocation: true,
      cashFlow: false,
      dividends: false,
      fees: false,
    },
    filters: {
      symbols: [],
      accounts: [],
      categories: [],
      minAmount: null,
    },
    formatting: {
      currency: "USD",
      locale: "en-US",
      includeCharts: true,
      includeLogos: true,
      pageOrientation: "portrait", // portrait, landscape
      fontSize: "medium", // small, medium, large
    },
    schedule: {
      enabled: false,
      frequency: "monthly", // daily, weekly, monthly, quarterly
      dayOfWeek: 1, // For weekly
      dayOfMonth: 1, // For monthly
      time: "09:00",
      recipients: [],
    },
  });

  const updateConfig = useCallback((updates) => {
    setReportConfig((prev) => {
      if (typeof updates === "function") {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  }, []);

  const updateSection = useCallback((section, enabled) => {
    setReportConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: enabled },
    }));
  }, []);

  const updateFilter = useCallback((filter, value) => {
    setReportConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [filter]: value },
    }));
  }, []);

  const updateFormatting = useCallback((key, value) => {
    setReportConfig((prev) => ({
      ...prev,
      formatting: { ...prev.formatting, [key]: value },
    }));
  }, []);

  const updateSchedule = useCallback((updates) => {
    setReportConfig((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, ...updates },
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setReportConfig({
      name: "",
      description: "",
      type: "portfolio",
      format: "pdf",
      dateRange: { start: null, end: null, preset: "1M" },
      sections: {
        summary: true,
        positions: true,
        transactions: true,
        performance: true,
        allocation: true,
        cashFlow: false,
        dividends: false,
        fees: false,
      },
      filters: { symbols: [], accounts: [], categories: [], minAmount: null },
      formatting: {
        currency: "USD",
        locale: "en-US",
        includeCharts: true,
        includeLogos: true,
        pageOrientation: "portrait",
        fontSize: "medium",
      },
      schedule: {
        enabled: false,
        frequency: "monthly",
        dayOfWeek: 1,
        dayOfMonth: 1,
        time: "09:00",
        recipients: [],
      },
    });
  }, []);

  const validateConfig = useCallback(() => {
    const errors = [];

    if (!reportConfig.name.trim()) {
      errors.push("Report name is required");
    }

    if (!reportConfig.type) {
      errors.push("Report type is required");
    }

    if (
      reportConfig.dateRange.preset === "custom" &&
      (!reportConfig.dateRange.start || !reportConfig.dateRange.end)
    ) {
      errors.push("Custom date range requires start and end dates");
    }

    const enabledSections = Object.values(reportConfig.sections).some(Boolean);
    if (!enabledSections) {
      errors.push("At least one section must be enabled");
    }

    if (
      reportConfig.schedule.enabled &&
      !reportConfig.schedule.recipients.length
    ) {
      errors.push("Scheduled reports require at least one recipient");
    }

    return errors;
  }, [reportConfig]);

  const isValid = useMemo(() => {
    return validateConfig().length === 0;
  }, [validateConfig]);

  return {
    reportConfig,
    updateConfig,
    updateSection,
    updateFilter,
    updateFormatting,
    updateSchedule,
    resetConfig,
    validateConfig,
    isValid,
  };
};

export const useReportTemplates = () => {
  const [templates] = useState([
    {
      id: "basic-portfolio",
      name: "Basic Portfolio Report",
      description: "Overview of positions and performance",
      type: "portfolio",
      sections: ["summary", "positions", "performance"],
      format: "pdf",
    },
    {
      id: "tax-report",
      name: "Tax Report",
      description: "Capital gains and tax information",
      type: "tax",
      sections: ["summary", "transactions", "gains"],
      format: "pdf",
    },
    {
      id: "performance-analysis",
      name: "Performance Analysis",
      description: "Detailed performance metrics and charts",
      type: "performance",
      sections: ["summary", "performance", "allocation", "benchmarks"],
      format: "pdf",
    },
    {
      id: "monthly-summary",
      name: "Monthly Summary",
      description: "Monthly portfolio overview",
      type: "portfolio",
      sections: ["summary", "positions", "transactions", "performance"],
      format: "pdf",
      schedule: { frequency: "monthly", dayOfMonth: 1 },
    },
  ]);

  const applyTemplate = useCallback(
    (templateId, currentConfig) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return currentConfig;

      const sections = {};
      Object.keys(currentConfig.sections).forEach((section) => {
        sections[section] = template.sections.includes(section);
      });

      return {
        ...currentConfig,
        name: template.name,
        description: template.description,
        type: template.type,
        format: template.format,
        sections,
        schedule: template.schedule
          ? { ...currentConfig.schedule, ...template.schedule }
          : currentConfig.schedule,
      };
    },
    [templates]
  );

  return {
    templates,
    applyTemplate,
  };
};

export const useReportHistory = (reportId) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!reportId) return;

    setIsLoading(true);
    try {
      // Mock history data - replace with actual API call
      const mockHistory = [
        {
          id: "1",
          status: "completed",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86400000 + 30000).toISOString(),
          fileSize: "2.5 MB",
          downloadCount: 3,
        },
        {
          id: "2",
          status: "completed",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          completedAt: new Date(Date.now() - 172800000 + 45000).toISOString(),
          fileSize: "2.1 MB",
          downloadCount: 1,
        },
      ];

      setHistory(mockHistory);
    } catch (error) {
      console.error("Failed to fetch report history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    refetch: fetchHistory,
  };
};

export const useReportAnalytics = () => {
  const { reports } = useReports();

  const analytics = useMemo(() => {
    const totalReports = reports.length;
    const completedReports = reports.filter(
      (r) => r.status === "completed"
    ).length;
    const failedReports = reports.filter((r) => r.status === "failed").length;
    const pendingReports = reports.filter((r) => r.status === "pending").length;

    const typeBreakdown = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {});

    const formatBreakdown = reports.reduce((acc, report) => {
      acc[report.format] = (acc[report.format] || 0) + 1;
      return acc;
    }, {});

    const avgGenerationTime =
      reports
        .filter((r) => r.status === "completed" && r.generationTime)
        .reduce((sum, r) => sum + r.generationTime, 0) / completedReports || 0;

    const recentActivity = reports
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalReports,
      completedReports,
      failedReports,
      pendingReports,
      successRate:
        totalReports > 0 ? (completedReports / totalReports) * 100 : 0,
      typeBreakdown,
      formatBreakdown,
      avgGenerationTime,
      recentActivity,
    };
  }, [reports]);

  return analytics;
};

export default useReports;
