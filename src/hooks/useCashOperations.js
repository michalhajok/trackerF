"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post, patch, del } from "@/hooks/useApi";
import { useToast } from "@/contexts/ToastContext";
import { usePortfolio } from "@/contexts/PortfolioContext";

/**
 * Hook for fetching cash operations list
 */
export function useCashOperations(filters = {}) {
  // const { portfolioId } = usePortfolio();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOperations = useCallback(() => {
    setLoading(true);
    setError(null);
    get(`/cash-operations`, {
      params: { ...filters },
    })
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return { data, loading, error, refresh: fetchOperations };
}

/**
 * Hook for creating a new cash operation
 */
export function useCreateCashOperation() {
  const { portfolioId } = usePortfolio();
  const { toast } = useToast();

  const create = useCallback(
    (operationData) => {
      return post(`/portfolios/${portfolioId}/cash-operations`, operationData)
        .then((res) => {
          const typeMap = {
            deposit: "Wpłata została dodana",
            withdrawal: "Wypłata została dodana",
            dividend: "Dywidenda została dodana",
            fee: "Opłata została dodana",
          };
          toast.success(
            typeMap[res.data.type] || "Operacja gotówkowa została utworzona"
          );
          return res;
        })
        .catch((err) => {
          toast.error(
            err.response?.data?.message || "Błąd podczas tworzenia operacji"
          );
          throw err;
        });
    },
    [portfolioId, toast]
  );

  return { create };
}

/**
 * Hook for updating a cash operation
 */
export function useUpdateCashOperation() {
  const { portfolioId } = usePortfolio();
  const { toast } = useToast();

  const update = useCallback(
    ({ id, ...data }) => {
      return patch(`/portfolios/${portfolioId}/cash-operations/${id}`, data)
        .then((res) => {
          toast.success("Operacja została zaktualizowana");
          return res;
        })
        .catch((err) => {
          toast.error(
            err.response?.data?.message || "Błąd podczas aktualizacji operacji"
          );
          throw err;
        });
    },
    [portfolioId, toast]
  );

  return { update };
}

/**
 * Hook for deleting a cash operation
 */
export function useDeleteCashOperation() {
  const { portfolioId } = usePortfolio();
  const { toast } = useToast();

  const remove = useCallback(
    (id) => {
      return del(`/portfolios/${portfolioId}/cash-operations/${id}`)
        .then((res) => {
          toast.success("Operacja została usunięta");
          return res;
        })
        .catch((err) => {
          toast.error(
            err.response?.data?.message || "Błąd podczas usuwania operacji"
          );
          throw err;
        });
    },
    [portfolioId, toast]
  );

  return { remove };
}

/**
 * Hook for fetching cash balance
 */
export function useCashBalance() {
  const { portfolioId } = usePortfolio();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!portfolioId) return;
    setLoading(true);
    get(`/portfolios/${portfolioId}/cash-operations/balance`)
      .then((res) => setBalance(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  return { balance, loading, error };
}

/**
 * Hook for cash flow statistics
 */
export function useCashFlowStats(period = "1y") {
  const { portfolioId } = usePortfolio();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!portfolioId) return;
    setLoading(true);
    get(`/portfolios/${portfolioId}/cash-operations/flow-stats`, {
      params: { period },
    })
      .then((res) => setStats(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [portfolioId, period]);

  return { stats, loading, error };
}

/**
 * Hook for monthly cash flow
 */

export function useMonthlyCashFlow(year) {
  const { portfolioId } = usePortfolio();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!portfolioId || !year) return;
    setLoading(true);
    get(`/portfolios/${portfolioId}/cash-operations/monthly-flow`, {
      params: { year },
    })
      .then((res) => setFlow(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [portfolioId, year]);

  return { flow, loading, error };
}

export default useCashOperations;
