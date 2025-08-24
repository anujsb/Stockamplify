// src/lib/services/tradeSignalService.ts

export function GetTradeSignalsData(portfolio: any[]) {
  const movingAverageData: any[] = [];
  const volumeAnalysisData: any[] = [];
  const weekRangeData: any[] = [];

  portfolio.forEach((item: any) => {
    const currentPrice = getCurrentPrice(item);

    // ----- Moving Average Data (same logic as computeMovingAverageData) -----
    if (item.intradayPrice) {
      const ma50 = Number(item.intradayPrice.fiftyDayMovingAverage || currentPrice);
      const ma200 = Number(item.intradayPrice.twoHundredDayMovingAverage || currentPrice);

      movingAverageData.push({
        symbol: item.stock?.symbol || 'N/A',
        currentPrice,
        ma50,
        ma200,
        ma50Signal: currentPrice > ma50 ? 'Bullish' : 'Bearish',
        ma200Signal: currentPrice > ma200 ? 'Bullish' : 'Bearish',
        goldenCross: ma50 > ma200,
        priceVsMa50: ((currentPrice - ma50) / ma50) * 100,
        priceVsMa200: ((currentPrice - ma200) / ma200) * 100,
      });
    }

    // ----- Volume Analysis Data (same logic as computeVolumeAnalysisData) -----
    if (item.realTimePrice?.volume && item.intradayPrice?.averageDailyVolume3Month) {
      const currentVolume = Number(item.realTimePrice.volume);
      const avgVolume = Number(item.intradayPrice.averageDailyVolume3Month);
      const volumeRatio = currentVolume / avgVolume;

      const invested = Number(item.buyPrice) * item.quantity;
      const currentValue = currentPrice * item.quantity;
      const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;

      volumeAnalysisData.push({
        symbol: item.stock?.symbol || 'N/A',
        currentVolume,
        avgVolume,
        volumeRatio,
        activity:
          volumeRatio > 2 ? 'High' :
          volumeRatio > 1.5 ? 'Above Average' :
          volumeRatio > 0.5 ? 'Normal' : 'Low',
        signal:
          volumeRatio > 2 && returnPct > 0 ? 'Strong Buy Signal' :
          volumeRatio > 2 && returnPct < 0 ? 'Strong Sell Signal' : 'Normal',
      });
    }

    // ----- 52-Week Range Data (same logic as computeWeekRangeData) -----
    const high = Number(item.intradayPrice?.fiftyTwoWeekHigh || currentPrice * 1.2);
    const low = Number(item.intradayPrice?.fiftyTwoWeekLow || currentPrice * 0.8);
    const position = high > low ? ((currentPrice - low) / (high - low)) * 100 : 50;

    weekRangeData.push({
      symbol: item.stock?.symbol,
      current: currentPrice,
      high,
      low,
      position,
      range: high - low,
      signal: position > 80 ? 'Near High' : position < 20 ? 'Near Low' : 'Mid Range',
      momentum: position > 70 ? 'Strong' : position > 30 ? 'Moderate' : 'Weak',
    });
  });

  return {
    movingAverageData,
    volumeAnalysisData,
    weekRangeData,
  };
}

// helper (same as before)
function getCurrentPrice(item: any) {
  return Number(item.realTimePrice?.price || item.buyPrice);
}
