// src/lib/portfolioAnalytics.js - MISSING
export const portfolioMetrics = {
  calculateSharpeRatio: (returns, riskFreeRate = 0.02) => {
    const excess = returns.map((r) => r - riskFreeRate);
    const avgExcess = excess.reduce((a, b) => a + b, 0) / excess.length;
    const variance =
      excess.reduce((acc, val) => acc + Math.pow(val - avgExcess, 2), 0) /
      excess.length;
    const stdDev = Math.sqrt(variance);
    return avgExcess / stdDev;
  },

  calculateMaxDrawdown: (values) => {
    let maxDrawdown = 0;
    let peak = values[0];

    for (const value of values) {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
  },

  calculateVolatility: (returns) => {
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
      returns.length;
    return Math.sqrt(variance);
  },

  calculateWinRate: (positions) => {
    const closedPositions = positions.filter((p) => p.status === "closed");
    const winners = closedPositions.filter((p) => (p.grossPL || 0) > 0);
    return closedPositions.length
      ? (winners.length / closedPositions.length) * 100
      : 0;
  },
};
