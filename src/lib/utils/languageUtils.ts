/**
 * Language Utilities
 * Provides translations and language support for the AI Stock Analytics application
 */

export type Language = 'english' | 'hindi' | 'marathi';

export interface LanguageOptions {
  value: string;
  label: string;
}

export interface TranslationKeys {
  // UI Elements
  pageTitle: string;
  stockSymbol: string;
  investmentHorizon: string;
  language: string;
  analyzeStock: string;
  analyzing: string;
  selectStockAndHorizon: string;
  selectValidStock: string;
  analysisCompleted: string;
  analysisError: string;
  success: string;
  unknownError: string;
  
  // Analysis Results
  aiAnalysisFor: string;
  recommendation: string;
  confidence: string;
  holdingPeriod: string;
  currentPrice: string;
  reasoning: string;
  trendAnalysis: string;
  trendConfidence: string;
  supportResistance: string;
  supportLevels: string;
  resistanceLevels: string;
  priceTargets: string;
  technicalIndicators: string;
  riskVolatility: string;
  riskLevel: string;
  volatility: string;
  volatilityScore: string;
  suitableFor: string;
  weekRange: string;
  weekHigh: string;
  weekLow: string;
  position: string;
  sentimentSummary: string;
  marketSentiment: string;
  sentimentSource: string;
  
  // Investment Horizons
  scalping: string;
  intraday: string;
  swingShort: string;
  swingMedium: string;
  positionTrading: string;
  longTerm: string;
  
  // Trend Directions
  bullish: string;
  bearish: string;
  sideways: string;
  neutral: string;
  
  // Risk Levels
  low: string;
  medium: string;
  high: string;
  
  // Positions
  nearHigh: string;
  nearLow: string;
  midRange: string;
  
  // Recommendations
  buy: string;
  sell: string;
  hold: string;
}

export const languageOptions: LanguageOptions[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'हिंदी' },
  { value: 'marathi', label: 'मराठी' }
];

export const translations: Record<Language, TranslationKeys> = {
  english: {
    // UI Elements
    pageTitle: 'AI Stock Analytics',
    stockSymbol: 'Stock Symbol',
    investmentHorizon: 'Investment Horizon',
    language: 'Language',
    analyzeStock: 'Analyze Stock',
    analyzing: 'Analyzing...',
    selectStockAndHorizon: 'Please select a stock and investment horizon',
    selectValidStock: 'Please select a valid Indian stock from the search results',
    analysisCompleted: 'Analysis completed for',
    analysisError: 'Analysis Error',
    success: 'Success',
    unknownError: 'Unknown error occurred',
    
    // Analysis Results
    aiAnalysisFor: 'AI Analysis for',
    recommendation: 'Recommendation',
    confidence: 'Confidence',
    holdingPeriod: 'Holding Period',
    currentPrice: 'Current Price',
    reasoning: 'Reasoning',
    trendAnalysis: 'Trend Analysis',
    trendConfidence: 'Trend Confidence',
    supportResistance: 'Support & Resistance',
    supportLevels: 'Support Levels',
    resistanceLevels: 'Resistance Levels',
    priceTargets: 'Price Targets',
    technicalIndicators: 'Technical Indicators',
    riskVolatility: 'Risk & Volatility',
    riskLevel: 'Risk Level',
    volatility: 'Volatility',
    volatilityScore: 'Volatility Score',
    suitableFor: 'Suitable For',
    weekRange: '52-Week Range',
    weekHigh: '52-Week High',
    weekLow: '52-Week Low',
    position: 'Position',
    sentimentSummary: 'Sentiment Summary',
    marketSentiment: 'Market Sentiment',
    sentimentSource: 'Sentiment Source',
    
    // Investment Horizons
    scalping: 'Scalping',
    intraday: 'Intraday',
    swingShort: 'Swing-Short',
    swingMedium: 'Swing-Medium',
    positionTrading: 'Position Trading',
    longTerm: 'Long-term',
    
    // Trend Directions
    bullish: 'Bullish',
    bearish: 'Bearish',
    sideways: 'Sideways',
    neutral: 'Neutral',
    
    // Risk Levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    
    // Positions
    nearHigh: 'Near High',
    nearLow: 'Near Low',
    midRange: 'Mid Range',
    
    // Recommendations
    buy: 'Buy',
    sell: 'Sell',
    hold: 'Hold'
  },
  
  hindi: {
    // UI Elements
    pageTitle: 'एआई स्टॉक एनालिटिक्स',
    stockSymbol: 'स्टॉक प्रतीक',
    investmentHorizon: 'निवेश क्षितिज',
    language: 'भाषा',
    analyzeStock: 'स्टॉक का विश्लेषण करें',
    analyzing: 'विश्लेषण कर रहे हैं...',
    selectStockAndHorizon: 'कृपया एक स्टॉक और निवेश क्षितिज चुनें',
    selectValidStock: 'कृपया खोज परिणामों से एक वैध भारतीय स्टॉक चुनें',
    analysisCompleted: 'के लिए विश्लेषण पूरा हुआ',
    analysisError: 'विश्लेषण त्रुटि',
    success: 'सफलता',
    unknownError: 'अज्ञात त्रुटि हुई',
    
    // Analysis Results
    aiAnalysisFor: 'के लिए एआई विश्लेषण',
    recommendation: 'सिफारिश',
    confidence: 'आत्मविश्वास',
    holdingPeriod: 'धारण अवधि',
    currentPrice: 'वर्तमान मूल्य',
    reasoning: 'तर्क',
    trendAnalysis: 'ट्रेंड विश्लेषण',
    trendConfidence: 'ट्रेंड आत्मविश्वास',
    supportResistance: 'समर्थन और प्रतिरोध',
    supportLevels: 'समर्थन स्तर',
    resistanceLevels: 'प्रतिरोध स्तर',
    priceTargets: 'मूल्य लक्ष्य',
    technicalIndicators: 'तकनीकी संकेतक',
    riskVolatility: 'जोखिम और अस्थिरता',
    riskLevel: 'जोखिम स्तर',
    volatility: 'अस्थिरता',
    volatilityScore: 'अस्थिरता स्कोर',
    suitableFor: 'उपयुक्त है',
    weekRange: '52-सप्ताह सीमा',
    weekHigh: '52-सप्ताह उच्च',
    weekLow: '52-सप्ताह निम्न',
    position: 'स्थिति',
    sentimentSummary: 'भावना सारांश',
    marketSentiment: 'बाजार भावना',
    sentimentSource: 'भावना स्रोत',
    
    // Investment Horizons
    scalping: 'स्कैल्पिंग',
    intraday: 'इंट्राडे',
    swingShort: 'स्विंग-शॉर्ट',
    swingMedium: 'स्विंग-मीडियम',
    positionTrading: 'पोजीशन ट्रेडिंग',
    longTerm: 'दीर्घकालिक',
    
    // Trend Directions
    bullish: 'बुलिश',
    bearish: 'बेयरिश',
    sideways: 'साइडवेज',
    neutral: 'तटस्थ',
    
    // Risk Levels
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    
    // Positions
    nearHigh: 'उच्च के निकट',
    nearLow: 'निम्न के निकट',
    midRange: 'मध्य सीमा',
    
    // Recommendations
    buy: 'खरीदें',
    sell: 'बेचें',
    hold: 'रखें'
  },
  
  marathi: {
    // UI Elements
    pageTitle: 'एआई स्टॉक अॅनालिटिक्स',
    stockSymbol: 'स्टॉक चिन्ह',
    investmentHorizon: 'गुंतवणूक क्षितिज',
    language: 'भाषा',
    analyzeStock: 'स्टॉक विश्लेषण करा',
    analyzing: 'विश्लेषण करत आहे...',
    selectStockAndHorizon: 'कृपया एक स्टॉक आणि गुंतवणूक क्षितिज निवडा',
    selectValidStock: 'कृपया शोध निकालांमधून एक वैध भारतीय स्टॉक निवडा',
    analysisCompleted: 'साठी विश्लेषण पूर्ण झाले',
    analysisError: 'विश्लेषण त्रुटी',
    success: 'यश',
    unknownError: 'अज्ञात त्रुटी आली',
    
    // Analysis Results
    aiAnalysisFor: 'साठी एआई विश्लेषण',
    recommendation: 'शिफारस',
    confidence: 'आत्मविश्वास',
    holdingPeriod: 'धरून ठेवण्याचा कालावधी',
    currentPrice: 'सध्याची किंमत',
    reasoning: 'तर्क',
    trendAnalysis: 'ट्रेंड विश्लेषण',
    trendConfidence: 'ट्रेंड आत्मविश्वास',
    supportResistance: 'समर्थन आणि प्रतिकार',
    supportLevels: 'समर्थन पातळी',
    resistanceLevels: 'प्रतिकार पातळी',
    priceTargets: 'किंमत लक्ष्ये',
    technicalIndicators: 'तांत्रिक निर्देशक',
    riskVolatility: 'जोखीम आणि अस्थिरता',
    riskLevel: 'जोखीम पातळी',
    volatility: 'अस्थिरता',
    volatilityScore: 'अस्थिरता स्कोअर',
    suitableFor: 'योग्य आहे',
    weekRange: '52-आठवडा श्रेणी',
    weekHigh: '52-आठवडा उच्च',
    weekLow: '52-आठवडा कमी',
    position: 'स्थिती',
    sentimentSummary: 'भावना सारांश',
    marketSentiment: 'बाजार भावना',
    sentimentSource: 'भावना स्रोत',
    
    // Investment Horizons
    scalping: 'स्कॅल्पिंग',
    intraday: 'इंट्राडे',
    swingShort: 'स्विंग-शॉर्ट',
    swingMedium: 'स्विंग-मीडियम',
    positionTrading: 'पोझिशन ट्रेडिंग',
    longTerm: 'दीर्घकालीन',
    
    // Trend Directions
    bullish: 'बुलिश',
    bearish: 'बेअरिश',
    sideways: 'साइडवेज',
    neutral: 'तटस्थ',
    
    // Risk Levels
    low: 'कमी',
    medium: 'मध्यम',
    high: 'उच्च',
    
    // Positions
    nearHigh: 'उच्चाजवळ',
    nearLow: 'कमीजवळ',
    midRange: 'मध्य श्रेणी',
    
    // Recommendations
    buy: 'खरेदी करा',
    sell: 'विक्री करा',
    hold: 'ठेवा'
  }
};

export function getTranslation(language: Language, key: string): string {
  const langTranslations = translations[language];
  const englishTranslations = translations.english;
  
  return langTranslations?.[key as keyof TranslationKeys] || 
         englishTranslations[key as keyof TranslationKeys] || 
         key;
}

export function translateAnalysisData(data: any, language: Language): any {
  if (!data) return data;
  
  const translated = { ...data };
  
  // Translate recommendation
  if (translated.recommendation) {
    const recKey = translated.recommendation.toLowerCase();
    translated.recommendation = getTranslation(language, recKey);
  }
  
  // Translate trend direction
  if (translated.trendDirection) {
    const trendKey = translated.trendDirection.toLowerCase();
    translated.trendDirection = getTranslation(language, trendKey);
  }
  
  // Translate risk level
  if (translated.riskLevel) {
    const riskKey = translated.riskLevel.toLowerCase();
    translated.riskLevel = getTranslation(language, riskKey);
  }
  
  // Translate market sentiment
  if (translated.marketSentiment) {
    const sentimentKey = translated.marketSentiment.toLowerCase();
    translated.marketSentiment = getTranslation(language, sentimentKey);
  }
  
  // Translate week52 position
  if (translated.week52Comparison?.position) {
    const positionKey = translated.week52Comparison.position.toLowerCase().replace(' ', '');
    translated.week52Comparison.position = getTranslation(language, positionKey);
  }
  
  return translated;
} 