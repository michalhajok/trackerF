// src/lib/riskManagement.js - CRITICAL MISSING
export const riskCalculations = {
  calculatePositionSize: (portfolioValue, riskPercent, stopLossPercent) => {
    if (!portfolioValue || !riskPercent || !stopLossPercent) return 0;
    return (portfolioValue * (riskPercent / 100)) / (stopLossPercent / 100);
  },

  calculatePortfolioHeat: (positions) => {
    return positions.reduce((heat, position) => {
      if (position.status !== "open") return heat;
      const risk =
        Math.abs((position.unrealizedPL || 0) / (position.currentValue || 1)) *
        100;
      return heat + Math.min(risk, 10); // Cap individual position risk at 10%
    }, 0);
  },

  assessRiskLevel: (heat) => {
    if (heat < 5) return { level: "Low", color: "green" };
    if (heat < 15) return { level: "Medium", color: "yellow" };
    return { level: "High", color: "red" };
  },
};
