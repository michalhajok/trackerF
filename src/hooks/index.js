export { useAuth } from "./useAuth";
export { useApi, useApiEndpoint } from "./useApi";
export {
  useLocalStorage,
  useUserPreferences,
  useFormDraft,
} from "./useLocalStorage";
export {
  useDebounce,
  useDebouncedCallback,
  useDebouncedSearch,
  useDebouncedValidation,
} from "./useDebounce";

// React Query Hooks - Queries
export {
  usePositions,
  useOpenPositions,
  useClosedPositions,
  usePosition,
  usePositionStats,
  usePositionPerformance,
} from "./queries/usePositions";

export {
  useCashOperations,
  useCashOperationsByType,
  useCashOperation,
  useCashBalance,
  useCashFlowStats,
  useMonthlyCashFlow,
} from "./queries/useCashOperations";

export {
  useOrders,
  usePendingOrders,
  useExecutedOrders,
  useCancelledOrders,
  useOrder,
  useOrderStats,
} from "./queries/useOrders";

export {
  useDashboardStats,
  usePortfolioPerformance,
  usePortfolioAllocation,
  useProfitLossAnalysis,
  useMonthlyPerformance,
  useSectorAllocation,
  useTopPerformers,
  useWorstPerformers,
  useRecentActivity,
  useDividendStats,
  useRiskMetrics,
  usePeriodComparison,
} from "./queries/useAnalytics";

// React Query Hooks - Mutations
export {
  useCreatePosition,
  useUpdatePosition,
  useClosePosition,
  useDeletePosition,
} from "./mutations/useCreatePosition";

export {
  useCreateCashOperation,
  useUpdateCashOperation,
  useDeleteCashOperation,
} from "./mutations/useCreateCashOperation";

export {
  useCreateOrder,
  useUpdateOrder,
  useExecuteOrder,
  useCancelOrder,
  useDeleteOrder,
} from "./mutations/useCreateOrder";

// Additional Utility Hooks
export { useWindowSize } from "./useWindowSize";
export { useClickOutside } from "./useClickOutside";
export { usePrevious } from "./usePrevious";
export { useToggle } from "./useToggle";
export { useTimeout } from "./useTimeout";
export { useInterval } from "./useInterval";
export { useCopyToClipboard } from "./useCopyToClipboard";
export { useForm } from "./useForm";
export { usePagination } from "./usePagination";
export { useSort } from "./useSort";
export { useFilter } from "./useFilter";
