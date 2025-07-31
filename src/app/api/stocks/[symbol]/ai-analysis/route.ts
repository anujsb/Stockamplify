import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const { symbol, name, sector, industry, description, currentPrice, peRatio, marketCap, otherData } = await request.json();
    // Extract recent price change and technical summary if available
    let recentChange = '';
    let technicalSummary = '';
    if (otherData) {
      if (typeof otherData.regularMarketChangePercent === 'number') {
        recentChange = `${otherData.regularMarketChangePercent.toFixed(2)}%`;
      }
      if (otherData.technicalIndicators) {
        const t = otherData.technicalIndicators;
        technicalSummary = `SMA20: ${t.sma20}, SMA50: ${t.sma50}, RSI: ${t.rsi}, MACD: line ${t.macd?.line}, signal ${t.macd?.signal}`;
      }
    }
    // Compose a richer prompt for Gemini
    const prompt = `You are a financial AI assistant. Analyze the following stock and provide a summary in this exact JSON format (no code block, no explanation outside JSON):\n\n{\n  "sentiment": "...",\n  "recommendation": "...",\n  "riskScore": ...,\n  "confidenceScore": ...,\n  "volatility": "...",\n  "prediction": "...",\n  "explanation": "...",\n  "strengths": "...",\n  "weaknesses": "...",\n  "confidence": "...",\n  "priceRange": "...",\n  "targetPrice": "...",\n  "stoploss": "...",\n  "timeFrame": "...",\n  "nextSteps": "...",\n  "disclaimer": "..."\n}\n\nStock Symbol: ${symbol}\nName: ${name}\nSector: ${sector}\nIndustry: ${industry}\nCurrent Price: ${currentPrice}\nP/E Ratio: ${peRatio}\nMarket Cap: ${marketCap}\nDescription: ${description}\nRecent Price Change: ${recentChange}\nTechnical Indicators: ${technicalSummary}\n\nRespond ONLY with the JSON object.`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiRes.ok) {
      const error = await geminiRes.text();
      return NextResponse.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Parse the model's response
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { raw: text };
    }
    // Add a timestamp for when the analysis was generated
    return NextResponse.json({ analysis, generatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
} 