import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function GET(request: NextRequest) {
  try {
    if (!NEWS_API_KEY) {
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let url = `${NEWS_API_BASE_URL}/top-headlines?country=in&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;

    // If there's a specific query, use everything endpoint for better stock market results
    if (query) {
      url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StockResearchApp/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch news' },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Filter out articles with missing essential data
    const filteredArticles = (data.articles || []).filter(
      (article: any) => article.title && article.url && article.source && article.source.name
    );

    return NextResponse.json({
      ...data,
      articles: filteredArticles,
    });

  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 