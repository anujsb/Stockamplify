'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NewsAndActionsProps {
  item: any;
}

// Simple static mapping for similar stocks by industry
const SIMILAR_STOCKS_MAP: Record<string, string[]> = {
  'Oil & Gas': ['ONGC', 'Indian Oil', 'BPCL', 'HPCL', 'GAIL'],
  'IT': ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra'],
  'Banking': ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Kotak Mahindra Bank'],
  'Telecom': ['Bharti Airtel', 'Vodafone Idea', 'MTNL'],
  // Add more as needed
};

export default function NewsAndActions({ item }: NewsAndActionsProps) {
  const [stockNews, setStockNews] = useState<any[]>([]);
  const [industryNews, setIndustryNews] = useState<any[]>([]);
  const [similarNews, setSimilarNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyName = item.stock.name;
  const industry = item.stock.industry;
  const similarStocks = industry && SIMILAR_STOCKS_MAP[industry] ? SIMILAR_STOCKS_MAP[industry].filter(s => s !== companyName) : [];

  // Analyst ratings - not available from Yahoo Finance
  const analystRatings = {
    buy: 'N/A',
    hold: 'N/A',
    sell: 'N/A',
    average: 'N/A'
  };

  // Corporate actions from Yahoo Finance
  const corporateActions = item?.statistics || {};
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };
  const hasCorporateActions = corporateActions.lastDividendDate || corporateActions.lastDividendValue || corporateActions.lastSplitDate || (corporateActions.earnings && (corporateActions.earningsCallDate || corporateActions.earningsDate));

  // Function to score news relevance
  const scoreNewsRelevance = (article: any, stockName: string, stockSymbol: string) => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    let score = 0;

    // High priority keywords (stock-specific)
    const highPriorityKeywords = [
      stockName.toLowerCase(),
      stockSymbol.toLowerCase().replace('.ns', ''),
      'earnings', 'quarterly results', 'q4', 'q3', 'q2', 'q1',
      'dividend', 'stock split', 'bonus issue', 'rights issue',
      'agm', 'annual general meeting', 'board meeting',
      'profit', 'loss', 'revenue', 'financial results'
    ];

    // Medium priority keywords (business events)
    const mediumPriorityKeywords = [
      'acquisition', 'merger', 'expansion', 'new product', 'launch',
      'ceo', 'chairman', 'management', 'appointment', 'resignation',
      'investment', 'partnership', 'joint venture', 'contract',
      'regulatory', 'compliance', 'sebi', 'rbi'
    ];

    // Low priority keywords (general business)
    const lowPriorityKeywords = [
      'market', 'trading', 'share price', 'stock price',
      'analyst', 'rating', 'target price', 'upgrade', 'downgrade',
      'sector', 'industry', 'competition'
    ];

    // Score based on keyword matches
    highPriorityKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 10;
      }
    });

    mediumPriorityKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 5;
      }
    });

    lowPriorityKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 2;
      }
    });

    // Bonus for recent articles (within last 7 days)
    if (article.publishedAt) {
      const publishedDate = new Date(article.publishedAt);
      const daysDiff = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 7) {
        score += 3;
      }
    }

    // Bonus for reputable sources
    const reputableSources = ['reuters', 'bloomberg', 'economic times', 'business standard', 'moneycontrol', 'ndtv profit'];
    const source = (article.source?.name || '').toLowerCase();
    if (reputableSources.some(rep => source.includes(rep))) {
      score += 2;
    }

    return score;
  };

  // Function to filter and sort news by relevance
  const filterRelevantNews = (articles: any[], stockName: string, stockSymbol: string) => {
    return articles
      .map(article => ({
        ...article,
        relevanceScore: scoreNewsRelevance(article, stockName, stockSymbol)
      }))
      .filter(article => article.relevanceScore > 5) // Only show articles with decent relevance
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore) // Sort by relevance score
      .slice(0, 6); // Take top 6 most relevant
  };

  // Function to get importance tag based on relevance score
  const getImportanceTag = (score: number) => {
    if (score >= 15) return { text: 'High', color: 'bg-red-100 text-red-800' };
    if (score >= 10) return { text: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Low', color: 'bg-gray-100 text-gray-800' };
  };

  useEffect(() => {
    if (!companyName) return;
    setLoading(true);
    setError(null);
    let completed = 0;

    // Always include Indian market keywords for better relevance
    const baseKeywords = `Indian stock market OR NSE OR BSE OR NIFTY OR SENSEX`;
    const keywords = `${companyName} OR ${item.stock.symbol} OR ${baseKeywords}`;
    const newsQuery = `${keywords} earnings OR dividend OR split OR bonus OR results OR profit OR loss OR revenue OR quarter OR financial OR AGM OR board meeting OR management OR CEO OR chairman OR acquisition OR merger OR expansion OR new product OR launch`;

    //console.log(`🔍 Fetching news for: ${companyName} (${item.stock.symbol})`);
   //console.log(`📝 Query: ${newsQuery}`);

    fetch(`/api/news?q=${encodeURIComponent(newsQuery)}`)
      .then(res => res.json())
      .then(data => {
        //console.log(`📰 Raw news results for ${companyName}:`, data.articles?.length || 0, 'articles');
        //console.log(`📋 Sample titles:`, data.articles?.slice(0, 3).map((a: any) => a.title));

        const relevantNews = filterRelevantNews(data.articles || [], companyName, item.stock.symbol);
        //console.log(`✅ Filtered relevant news for ${companyName}:`, relevantNews.length, 'articles');
        //console.log(`📊 Relevance scores:`, relevantNews.map(n => ({ title: n.title, score: n.relevanceScore })));

        setStockNews(relevantNews);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`❌ Error fetching news for ${companyName}:`, err);
        setError('Failed to load news');
        setLoading(false);
      });

    // 2. Industry news
    if (industry) {
      const industryQuery = `${industry} OR ${baseKeywords} earnings OR dividend OR results OR profit OR loss OR revenue`;
      fetch(`/api/news?q=${encodeURIComponent(industryQuery)}`)
        .then(res => res.json())
        .then(data => setIndustryNews(data.articles || []))
        .catch(() => setIndustryNews([]))
        .finally(() => { completed++; if (completed === 3) setLoading(false); });
    } else {
      setIndustryNews([]); completed++;
    }

    // 3. Similar stocks news
    if (similarStocks.length > 0) {
      const similarQuery = similarStocks.join(' OR ') + ' OR ' + baseKeywords + ' earnings OR dividend OR results OR profit OR loss OR revenue';
      fetch(`/api/news?q=${encodeURIComponent(similarQuery)}`)
        .then(res => res.json())
        .then(data => setSimilarNews(data.articles || []))
        .catch(() => setSimilarNews([]))
        .finally(() => { completed++; if (completed === 3) setLoading(false); });
    } else {
      setSimilarNews([]); completed++;
    }
  }, [companyName, industry, item.stock.symbol]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'announced':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNewsSection = (title: string, news: any[], emptyMsg: string) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading news...</div>
        ) : news.length === 0 ? (
          <div className="text-gray-500">{emptyMsg}</div>
        ) : (
          <div className="space-y-3">
            {news.slice(0, 4).map((news, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  {getSentimentIcon(news.sentiment)}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-700 hover:underline line-clamp-2 flex items-start gap-1"
                  >
                    {news.title}
                    <ExternalLink className="h-3 w-3 text-gray-400 mt-0.5" />
                  </a>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{news.source?.name}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {news.description && <p className="text-xs text-gray-700 mt-1 line-clamp-2">{news.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* News Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Latest News for {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <Loader2 className="animate-spin" /> Loading news...
            </div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : stockNews.length === 0 ? (
            <div className="text-gray-500 py-4">No relevant news found for {companyName}.</div>
          ) : (
            <div className="space-y-4">
              {stockNews.map((news, idx) => {
                const importanceTag = getImportanceTag(news.relevanceScore);
                return (
                  <div key={idx} className="border-l-4 border-blue-200 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSentimentIcon(news.sentiment)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <a
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 flex items-start gap-1"
                          >
                            {news.title}
                            <ExternalLink className="h-3 w-3 text-gray-400 mt-0.5" />
                          </a>
                          <span className={`text-xs px-2 py-1 rounded-full ${importanceTag.color} flex-shrink-0`}>
                            {importanceTag.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{news.source?.name}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {news.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{news.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Corporate Actions Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Corporate Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCorporateActions ? (
            <div className="space-y-4">
              {corporateActions.exDividendDate && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ex-Dividend Date</span>
                    <span>{formatDate(corporateActions.exDividendDate)}</span>
                  </div>
                </div>
              )}
              {corporateActions.dividendDate && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Dividend Date</span>
                    <span>{formatDate(corporateActions.dividendDate)}</span>
                  </div>
                </div>
              )}
              {corporateActions.splitDate && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Split Date</span>
                    <span>{formatDate(corporateActions.splitDate)}</span>
                  </div>
                </div>
              )}
              {corporateActions.earnings && corporateActions.earnings.earningsDate && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Earnings Date</span>
                    <span>{Array.isArray(corporateActions.earnings.earningsDate)
                      ? corporateActions.earnings.earningsDate.map((ed: any, i: number) => formatDate(ed.raw)).join(', ')
                      : formatDate(corporateActions.earnings.earningsDate.raw)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No recent corporate actions.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
