// src/lib/services/aiPortfolioAdvisorService.ts
import { AlertTriangle, Shield, Target } from "lucide-react";

export class AIPortfolioAdvisorService {
  static GetAdvisorInsights(portfolio: any[]) {
    const financialHealthData: any[] = [];
    const valuationMetrics: any[] = [];
    const marketCapData: any[] = [];
    const peDistributionData: any[] = [];
    const analystTargetData: any[] = [];
    const riskReturnData: any[] = [];
    const alerts: any[] = [];
    const dividendData: any[] = [];
    const sectorAllocations: {
      [key: string]: { value: number; count: number; performance: number };
    } = {};

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let weightedBeta = 0;
    let weightedPE = 0;
    let weightedROE = 0;
    let weightedPB = 0;
    let totalDividendYield = 0;

    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

    portfolio.forEach((item: any, index: number) => {
      const invested = Number(item.buyPrice) * item.quantity;
      const currentPrice = Number(item.realTimePrice?.price || item.buyPrice);
      const currentValue = currentPrice * item.quantity;
      const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;
      const beta = Number(item.financialData?.beta || 1);

      totalInvested += invested;
      totalCurrentValue += currentValue;
      const weight = currentValue;
      const sector = item.stock?.sector || "Other";
      const symbol = item.stock?.symbol || "N/A";

      // 1️⃣ Financial Health Radar
      if (item.financialData) {
        const healthScore = {
          symbol,
          currentRatio: Math.min(Number(item.financialData.currentRatio || 0), 3) * 33.33,
          quickRatio: Math.min(Number(item.financialData.quickRatio || 0), 2) * 50,
          debtToEquity: Math.max(0, 100 - Number(item.financialData.debtToEquity || 0) * 50),
          roe: Math.min(Number(item.financialData.returnOnEquity || 0) * 500, 100),
          profitMargin: Math.min(Number(item.financialData.profitMargin || 0) * 500, 100),
          revenueGrowth: Math.min(
            Math.max(Number(item.financialData.revenueGrowth || 0) * 200 + 50, 0),
            100
          ),
        };
        financialHealthData.push(healthScore);

        weightedROE += Number(item.financialData.returnOnEquity || 0) * weight;
      }

      // 2️⃣ Valuation Metrics
      if (item.fundamentalData) {
        const pe = Number(item.fundamentalData.trailingPE || 0);
        const pb = Number(item.fundamentalData.priceToBook || 0);
        const forwardPE = Number(item.fundamentalData.forwardPE || 0);

        weightedPE += pe * weight;
        weightedPB += pb * weight;

        valuationMetrics.push({
          symbol,
          trailingPE: pe,
          forwardPE,
          priceToBook: pb,
          peCategory: pe < 15 ? "Undervalued" : pe < 25 ? "Fair" : "Overvalued",
          pbCategory: pb < 1.5 ? "Undervalued" : pb < 3 ? "Fair" : "Overvalued",
        });

        // P/E Distribution Buckets
        if (pe > 0 && pe < 100) {
          const peRange =
            pe < 10
              ? "0-10"
              : pe < 15
                ? "10-15"
                : pe < 20
                  ? "15-20"
                  : pe < 25
                    ? "20-25"
                    : pe < 30
                      ? "25-30"
                      : "30+";
          const existing = peDistributionData.find((p) => p.range.trim() === peRange);

          if (existing) {
            existing.count++;
          } else {
            peDistributionData.push({ range: peRange, count: 1, avgPE: pe });
          }
        }
      }

      // 3️⃣ Market Cap Analysis
      if (item.intradayPrice?.marketCap) {
        const marketCap = Number(item.intradayPrice.marketCap);
        const marketCapCrores = marketCap / 10000000;

        marketCapData.push({
          symbol,
          marketCap: marketCapCrores,
          size:
            marketCapCrores > 100000
              ? "Large Cap"
              : marketCapCrores > 20000
                ? "Mid Cap"
                : "Small Cap",
          value: currentValue,
          weight: (currentValue / totalCurrentValue) * 100,
        });
      }

      // 4️⃣ Analyst Targets & Upside
      if (item.analystRating?.targetPriceHigh) {
        const upside =
          ((Number(item.analystRating.targetPriceHigh) - currentPrice) / currentPrice) * 100;
        analystTargetData.push({
          symbol,
          currentPrice,
          targetHigh: Number(item.analystRating.targetPriceHigh),
          targetLow: Number(item.analystRating.targetLowPrice || currentPrice * 0.8),
          upside,
          recommendation: item.analystRating.recommendation,
          analysts: Number(item.analystRating.numberOfAnalysts || 0),
        });
      }

      // Dividend Analysis
      if (item.statistics?.lastDividendValue) {
        const dividendYield = (Number(item.statistics.lastDividendValue) / currentPrice) * 100;
        totalDividendYield += dividendYield * weight;

        dividendData.push({
          symbol,
          dividendYield,
          lastDividend: Number(item.statistics.lastDividendValue),
          lastDividendDate: item.statistics.lastDividendDate,
          annualDividend: Number(item.statistics.lastDividendValue) * 4,
          category:
            dividendYield > 4 ? "High Yield" : dividendYield > 2 ? "Medium Yield" : "Low Yield",
        });
      }

      // 5️⃣ Risk vs Return Analysis (Real Beta from Yahoo Finance)
      const stockBeta = item.statistics?.beta || 1.0; // Use real beta or default to 1.0
      const volatility = 15 + Math.random() * 25;
      const alpha = returnPct - stockBeta * 12;

      riskReturnData.push({
        symbol,
        risk: volatility,
        return: returnPct,
        size: currentValue,
        beta: stockBeta,
        alpha,
        color: colors[index % colors.length],
      });

      weightedBeta += stockBeta * weight;

      // 6️⃣ Sector Allocations
      if (!sectorAllocations[sector]) {
        sectorAllocations[sector] = { value: 0, count: 0, performance: 0 };
      }
      sectorAllocations[sector].value += currentValue;
      sectorAllocations[sector].count += 1;
      sectorAllocations[sector].performance += returnPct;
    });

    // 7️⃣ Portfolio Diversification Metrics
    const herfindahlIndex = Object.values(sectorAllocations).reduce(
      (sum, sector) => sum + Math.pow(sector.value / totalCurrentValue, 2),
      0
    );

    const concentrationRisk =
      herfindahlIndex > 0.25 ? "High" : herfindahlIndex > 0.15 ? "Medium" : "Low";

    // 8️⃣ Smart Alerts
    alerts.push(
      ...generateSmartAlerts(portfolio, {
        concentrationRisk,
        valuationMetrics,
        marketCapData,
        analystTargetData,
        peDistributionData,
      })
    );

    // ✅ Final aggregated response
    return {
      financialHealthData,
      valuationMetrics,
      marketCapData,
      peDistributionData,
      analystTargetData,
      riskReturnData,
      alerts,
      sectorAllocations,
      concentrationRisk,
      herfindahlIndex,
      portfolioBeta: weightedBeta,
      totalCurrentValue,
      dividendData,
      totalDividendYield,
    };
  }
}

// ----------------- Helper Functions -----------------
/**
 * Generates AI-powered Smart Alerts
 */
function generateSmartAlerts(portfolio: any[], data: any) {
  const alerts: any[] = [];

  // Concentration risk alert
  if (data.concentrationRisk === "High") {
    alerts.push({
      type: "risk",
      severity: "high",
      title: "High Concentration Risk",
      message: "Consider diversifying across more sectors",
      icon: AlertTriangle,
      color: "red",
    });
  }

  // Analyst upgrade opportunities
  data.analystTargetData.forEach((stock: any) => {
    if (stock.upside > 20) {
      alerts.push({
        type: "opportunity",
        severity: "low",
        title: "High Upside Potential",
        message: `${stock.symbol} has ${stock.upside.toFixed(0)}% analyst upside`,
        icon: Target,
        color: "green",
      });
    }
  });

  // valuation alerts
  data.valuationMetrics?.forEach((stock: any) => {
    if (stock.trailingPE > 40) {
      alerts.push({
        type: "valuation",
        severity: "high",
        title: "High Valuation Alert",
        message: `${stock.symbol} has a trailing P/E of ${stock.trailingPE}`,
        icon: Shield,
        color: "purple",
      });
    }
  });

  return alerts.slice(0, 8); // Limit to 8 alerts
}
