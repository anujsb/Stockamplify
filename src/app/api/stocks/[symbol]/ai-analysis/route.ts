// 1. UPDATED API ROUTE - More robust data handling
import { NextRequest, NextResponse } from 'next/server';

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  // if (!GEMINI_API_KEY) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const portfolioData = await request.json();
    //console.log('Received portfolio data:', JSON.stringify(portfolioData, null, 2)); // Debug log

    // IMPROVED: More defensive data extraction with fallbacks
    const stock = portfolioData.stock || {};
    const realTimePrice = portfolioData.realTimePrice || {};
    const intradayPrice = portfolioData.intradayPrice || {};
    const fundamentalData = portfolioData.fundamentalData || {};
    const financialData = portfolioData.financialData || {};
    const statistics = portfolioData.statistics || {};
    const analystRating = portfolioData.analystRating || {};

    // Portfolio context with safe defaults
    const quantity = portfolioData.quantity || 0;
    const buyPrice = portfolioData.buyPrice || 0;
    const addedAt = portfolioData.addedAt;

    // IMPROVED: Validate essential data before proceeding
    if (!stock.symbol) {
      return NextResponse.json({
        error: 'Missing required stock symbol'
      }, { status: 400 });
    }

    // Calculate portfolio performance safely
    const currentPrice = realTimePrice.price || 0;
    const currentValue = currentPrice * quantity;
    const investedValue = buyPrice * quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;
    const holdingPeriodDays = addedAt ? Math.floor((Date.now() - new Date(addedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // IMPROVED: Enhanced data availability check
    const dataQuality = {
      hasRealTimePrice: !!realTimePrice.price,
      hasIntradayData: !!(intradayPrice.previousClose || intradayPrice.fiftyTwoWeekHigh),
      hasFundamentals: !!(fundamentalData.trailingPE || fundamentalData.epsTTM),
      hasFinancials: !!(financialData.totalRevenue || financialData.profitMargin),
      hasAnalystRating: !!analystRating.recommendation,
      hasPortfolioData: !!(quantity && buyPrice)
    };

    // IMPROVED: Dynamic prompt based on available data
    const buildPrompt = () => {
      let prompt = `You are an expert financial analyst. Analyze ${stock.symbol} (${stock.name || 'N/A'}) and provide insights in JSON format.

STOCK OVERVIEW:
- Symbol: ${stock.symbol}
- Name: ${stock.name || 'N/A'}
- Sector: ${stock.sector || 'N/A'}
- Industry: ${stock.industry || 'N/A'}
- Exchange: ${stock.exchange || 'N/A'}
`;

      // Add sections only if data is available
      if (dataQuality.hasRealTimePrice) {
        prompt += `
CURRENT PRICE DATA:
- Current Price: ${currentPrice}
- Volume: ${realTimePrice.volume || 'N/A'}
`;
      }

      if (dataQuality.hasIntradayData) {
        prompt += `
TECHNICAL ANALYSIS:
- Previous Close: ${intradayPrice.previousClose || 'N/A'}
- Day High: ${intradayPrice.dayHigh || 'N/A'}
- Day Low: ${intradayPrice.dayLow || 'N/A'}
- 52W High: ${intradayPrice.fiftyTwoWeekHigh || 'N/A'}
- 52W Low: ${intradayPrice.fiftyTwoWeekLow || 'N/A'}
- 50-day MA: ${intradayPrice.fiftyDayMovingAverage || 'N/A'}
- 200-day MA: ${intradayPrice.twoHundredDayMovingAverage || 'N/A'}
- Market Cap: ${intradayPrice.marketCap || 'N/A'}
`;
      }

      if (dataQuality.hasFundamentals) {
        prompt += `
VALUATION METRICS:
- P/E Ratio: ${fundamentalData.trailingPE || 'N/A'}
- Forward P/E: ${fundamentalData.forwardPE || 'N/A'}
- Price-to-Book: ${fundamentalData.priceToBook || 'N/A'}
- EPS TTM: ${fundamentalData.epsTTM || 'N/A'}
- Book Value: ${fundamentalData.bookValue || 'N/A'}
`;
      }

      if (dataQuality.hasFinancials) {
        prompt += `
FINANCIAL HEALTH:
- Total Revenue: ${financialData.totalRevenue || 'N/A'}
- Debt-to-Equity: ${financialData.debtToEquity || 'N/A'}
- Current Ratio: ${financialData.currentRatio || 'N/A'}
- Profit Margin: ${financialData.profitMargin ? (financialData.profitMargin * 100).toFixed(2) + '%' : 'N/A'}
- ROE: ${financialData.returnOnEquity ? (financialData.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}
- Revenue Growth: ${financialData.revenueGrowth ? (financialData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
`;
      }

      if (dataQuality.hasAnalystRating) {
        prompt += `
MARKET SENTIMENT:
- Analyst Recommendation: ${analystRating.recommendation || 'N/A'}
- Number of Analysts: ${analystRating.numberOfAnalysts || 'N/A'}
- Target Price High: ${analystRating.targetPriceHigh || 'N/A'}
`;
      }

      if (dataQuality.hasPortfolioData) {
        prompt += `
PORTFOLIO CONTEXT:
- Your Position: ${quantity} shares at ${buyPrice}
- Current Value: ${currentValue.toFixed(2)}
- Gain/Loss: ${gainLoss.toFixed(2)} (${gainLossPercent.toFixed(2)}%)
- Holding Period: ${holdingPeriodDays} days
`;
      }

      // IMPROVED: Adjusted expectations based on data availability
      const availableDataCount = Object.values(dataQuality).filter(Boolean).length;
      const dataQualityNote = availableDataCount < 3 ?
        "Note: Limited data available. Focus on general sector/industry analysis and acknowledge data limitations." :
        "Note: Good data availability. Provide comprehensive analysis.";

      prompt += `
${dataQualityNote}

Provide analysis in this exact JSON format:
{
  "sentiment": "Bullish/Bearish/Neutral",
  "recommendation": "Strong Buy/Buy/Hold/Sell/Strong Sell",
  "riskScore": 0.0-1.0,
  "confidenceScore": 0.0-1.0,
  "volatility": "Low/Medium/High",
  "prediction": "Short-term outlook based on available data",
  "explanation": "Detailed analysis using available data points",
  "strengths": "Key positive factors identified",
  "weaknesses": "Key risks and concerns",
  "confidence": "Explanation of confidence level based on data quality",
  "priceRange": "Expected range if sufficient data available",
  "targetPrice": "Target with timeframe if data supports it",
  "stoploss": "Recommended stop-loss if applicable",
  "timeFrame": "Investment timeframe recommendation",
  "nextSteps": "Actionable recommendations",
  "technicalSignals": "Technical analysis summary",
  "valuationAnalysis": "Valuation assessment",
  "financialStrength": "Financial health summary",
  "marketPosition": "Competitive position analysis",
  "catalysts": "Potential stock moving events",
  "dataQuality": "Summary of data availability and reliability",

}

IMPORTANT: If data is limited, acknowledge this in your analysis but still provide useful insights based on sector, industry, and general market conditions. Adjust confidence scores accordingly.`;

      return prompt;
    };

    const prompt = buildPrompt();

    // const geminiRes = await fetch(`${GEMINI_API_KEY}?key=${GEMINI_API_KEY}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     contents: [{ parts: [{ text: prompt }] }],
    //     generationConfig: {
    //       temperature: 0.7,
    //       topK: 40,
    //       topP: 0.95,
    //       maxOutputTokens: 2048,
    //     }
    //   })
    // });

    // replaced gemini with groq
    // const geminiRes = await fetch(`{GROQ_API_KEY}?key=${GROQ_API_KEY}`,{
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${GROQ_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     model: 'llama-3.3-70b-versatile',
    //     max_tokens: 2048,
    //     messages: [{ role: 'user', content: prompt }],
    //     temperature: 0.7
    //   }) 
    // });
    const geminiRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!geminiRes.ok) {
      const error = await geminiRes.text();
      console.error('Gemini API error:', error);
      return NextResponse.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const text = geminiData.choices?.[0]?.message?.content || '';


    let analysis;
    try {
      // IMPROVED: Better JSON parsing with fallback
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback analysis if parsing fails
      analysis = {
        sentiment: "Neutral",
        recommendation: "Hold",
        riskScore: 0.5,
        confidenceScore: 0.3,
        volatility: "Medium",
        prediction: "Unable to generate prediction due to data parsing issues",
        explanation: `Analysis generated but failed to parse properly. Raw response: ${text.substring(0, 500)}...`,
        dataQuality: "Poor - parsing failed",
        // disclaimer: "This analysis failed to parse properly and should not be used for investment decisions."
      };
    }

    return NextResponse.json({
      analysis,
      generatedAt: new Date().toISOString(),
      dataQuality,
      debug: {
        availableDataPoints: Object.entries(dataQuality).filter(([_, value]) => value).map(([key]) => key),
        promptLength: prompt.length
      }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}
