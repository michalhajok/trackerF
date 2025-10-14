// src/contexts/PortfolioContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { get } from "@/hooks/useApi";

// Create context
const PortfolioContext = createContext({
  portfolioId: null,
  portfolio: null,
  portfolios: [],
  selectPortfolio: () => {},
  loading: false,
  error: null,
});

// Provider component
export function PortfolioProvider({ children }) {
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioId, setPortfolioId] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load list of portfolios
  useEffect(() => {
    setLoading(true);
    get("/portfolios")
      .then((res) => setPortfolios(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Load selected portfolio details
  useEffect(() => {
    if (!portfolioId) {
      setPortfolio(null);
      return;
    }
    setLoading(true);
    get(`/portfolios/${portfolioId}`)
      .then((res) => setPortfolio(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  const selectPortfolio = (id) => {
    setPortfolioId(id);
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolioId,
        portfolio,
        portfolios,
        selectPortfolio,
        loading,
        error,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

// Hook to use context
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
