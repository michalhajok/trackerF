/**
 * Complete usePositions Hook with ALL exports
 * Fixes missing useOpenPositions and useClosedPositions exports
 */

import { useState, useEffect, useMemo } from "react";
import { apiEndpoints } from "@/lib/api";

// Main usePositions hook
const usePositions = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert params to string for dependency comparison
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    const fetchPositions = async () => {
      try {
        console.log("🔍 Fetching positions with params:", params);
        setLoading(true);
        setError(null);

        const response = await apiEndpoints.positions.getAll(params);

        // Check if component was unmounted
        if (cancelled) return;

        console.log("✅ Positions fetched:", response);

        if (response?.success && response?.data) {
          setData(response.data);
        } else if (Array.isArray(response)) {
          // Handle direct array response
          setData(response);
        } else {
          console.warn("⚠️ Unexpected response format:", response);
          setData([]);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("❌ Error fetching positions:", err);
        setError(err.message || "Failed to fetch positions");
        setData([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPositions();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [paramsKey]); // ✅ Proper dependency array

  // Refetch function
  const refetch = () => {
    setLoading(true);
    setError(null);
    // Force re-fetch by updating state
    setData(null);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

// ✅ MISSING EXPORT - useOpenPositions
export const useOpenPositions = (params = {}) => {
  console.log("🔍 useOpenPositions called with params:", params);

  const openParams = useMemo(
    () => ({
      ...params,
      status: "open",
    }),
    [params]
  );

  const result = usePositions(openParams);

  console.log("🔍 useOpenPositions result:", {
    loading: result.loading,
    dataLength: result.data?.length,
    error: result.error,
  });

  return {
    ...result,
    openPositions: result.data || [],
  };
};

// ✅ MISSING EXPORT - useClosedPositions
export const useClosedPositions = (params = {}) => {
  console.log("🔍 useClosedPositions called with params:", params);

  const closedParams = useMemo(
    () => ({
      ...params,
      status: "closed",
    }),
    [params]
  );

  const result = usePositions(closedParams);

  console.log("🔍 useClosedPositions result:", {
    loading: result.loading,
    dataLength: result.data?.length,
    error: result.error,
  });

  return {
    ...result,
    closedPositions: result.data || [],
  };
};

// ✅ ADDITIONAL USEFUL EXPORTS
export const usePositionsBySymbol = (symbol, params = {}) => {
  const symbolParams = useMemo(
    () => ({
      ...params,
      symbol,
    }),
    [symbol, params]
  );

  return usePositions(symbolParams);
};

export const useAllPositions = (params = {}) => {
  const result = usePositions(params);

  const memoizedData = useMemo(() => {
    if (!result.data) return { open: [], closed: [] };

    return {
      open: result.data.filter((pos) => pos.status === "open"),
      closed: result.data.filter((pos) => pos.status === "closed"),
      all: result.data,
    };
  }, [result.data]);

  return {
    ...result,
    positions: memoizedData,
  };
};

// Default export
export default usePositions;
