import { useCallback, useEffect, useRef, useState } from 'react';

interface NewsArticle {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  urlToImage?: string;
  description?: string;
}

interface UseNewsOptions {
  category?: string;
  query?: string;
  pageSize?: number;
  autoRefresh?: boolean;
}

export function useNews({ category, query, pageSize = 20, autoRefresh = false }: UseNewsOptions) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (query) params.append('q', query);
      params.append('page', reset ? '1' : page.toString());
      params.append('pageSize', pageSize.toString());
      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTotalResults(data.totalResults || 0);
        setHasMore((data.articles?.length || 0) >= pageSize);
        setArticles(prev => reset ? data.articles : [...prev, ...data.articles]);
      } else {
        setError(data.error || 'Failed to fetch news');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [category, query, page, pageSize]);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    fetchNews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, pageSize]);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        setArticles([]);
        setPage(1);
        fetchNews(true);
      }, 5 * 60 * 1000); // 5 minutes
      return () => {
        if (refreshInterval.current) clearInterval(refreshInterval.current);
      };
    }
  }, [autoRefresh, fetchNews]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const refresh = () => {
    setArticles([]);
    setPage(1);
    fetchNews(true);
  };

  return {
    articles,
    loading,
    error,
    totalResults,
    hasMore,
    loadMore,
    refresh,
  };
} 