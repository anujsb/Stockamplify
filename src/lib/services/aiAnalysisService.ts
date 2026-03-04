/**
 * AI Analysis Service
 * Handles communication with Gemini AI for stock analysis
 */

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIAnalysisRequest {
  symbol: string;
  investmentHorizon: string;
  interval?: string;
  period?: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: any;
  metadata?: any;
  error?: string;
  details?: string;
}

/**
 * Call Gemini AI for stock analysis
 * @param prompt - The analysis prompt
 * @returns AI response
 */
export async function callGeminiAI(prompt: string): Promise<AIAnalysisResponse> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    const response = await fetch(`${GROQ_API_KEY}?key=${GROQ_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // generationConfig: {
        //   temperature: 0.7,
        //   topK: 40,
        //   topP: 0.95,
        //   maxOutputTokens: 2048,
        // }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: 'AI analysis service error',
        details: error
      };
    }

    const data = await response.json();
    // const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const text = data.choices?.[0]?.message?.content || '';


    let analysis;
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        success: false,
        error: 'Failed to parse AI analysis response',
        details: String(parseError),
        analysis: {
          sentiment: "Neutral",
          recommendation: "Hold",
          riskScore: 0.5,
          confidenceScore: 0.3,
          volatility: "Medium",
          prediction: "Unable to generate prediction due to data parsing issues",
          explanation: `Analysis generated but failed to parse properly. Raw response: ${text.substring(0, 500)}...`,
          dataQuality: "Poor - parsing failed"
        }
      };
    }

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('AI Analysis Service error:', error);
    return {
      success: false,
      error: 'Internal server error 1',
      details: String(error)
    };
  }
}

/**
 * Validate AI analysis response
 * @param analysis - The analysis response
 * @returns True if valid
 */
export function validateAnalysisResponse(analysis: any): boolean {
  const requiredFields = [
    'symbol', 'trendDirection', 'recommendation', 'confidenceScore',
    'supportLevels', 'resistanceLevels', 'indicators', 'reasoning'
  ];

  return requiredFields.every(field => analysis && analysis[field] !== undefined);
}

/**
 * Transform AI response to standardized format
 * @param analysis - Raw AI analysis
 * @returns Transformed analysis
 */
export function transformAnalysisResponse(analysis: any): any {
  return {
    ...analysis,
    // Ensure arrays are properly formatted
    supportLevels: getEdgeValuesOnly(analysis.supportLevels),
    resistanceLevels: getEdgeValuesOnly(analysis.resistanceLevels),
    suitableFor: analysis.suitableFor,
    // Ensure numbers are properly formatted
    confidenceScore: Number(analysis.confidenceScore) || 0,
    trendConfidenceScore: Number(analysis.trendConfidenceScore) || 0,
    volatilityScore: Number(analysis.volatilityScore) || 0
  };
}

/**
 * Return only first and last element if array has more than 2 values
 */
function getEdgeValuesOnly<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 2) return arr;
  return [arr[0], arr[arr.length - 1]];
}