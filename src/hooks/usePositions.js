import { useState, useEffect } from "react";
import { get } from "./useApi";
// import { usePortfolio } from "@/contexts/PortfolioContext";

export function usePositions(portfolioId, filters) {
  // const { portfolioId } = usePortfolio();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!portfolioId) return;
    setLoading(true);
    setError(null);

    get(`/positions/?portfolioId=${portfolioId}`, { params: filters })
      .then((data) => setPositions(data.positions))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [portfolioId, JSON.stringify(filters)]);

  return { positions, loading, error };
}
