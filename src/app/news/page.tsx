'use client';

import { useState } from 'react';
import { useNews } from '@/lib/hooks/useNews';
import { NewsGrid } from '@/components/news/NewsGrid';
import { NewsFilters } from '@/components/news/NewsFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Newspaper, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { SideBar } from '@/components/SideBar';
import { cn } from '@/lib/utils';

const STOCK_MARKET_CATEGORIES = [
    { value: 'market', label: 'Market Overview', query: 'Indian stock market OR BSE OR NSE OR NIFTY OR SENSEX' },
    { value: 'indices', label: 'Indices', query: 'NIFTY OR SENSEX OR BSE index OR NSE index' },
    { value: 'ipos', label: 'IPOs', query: 'IPO OR Initial Public Offering OR Indian IPO' },
    { value: 'earnings', label: 'Earnings', query: 'earnings OR quarterly results OR profit OR loss OR revenue' },
    { value: 'regulations', label: 'Regulations', query: 'SEBI OR regulation OR compliance OR Indian stock regulation' },
    { value: 'corporate', label: 'Corporate Actions', query: 'dividend OR stock split OR bonus issue OR rights issue OR buyback' },
    { value: 'analyst', label: 'Analyst Views', query: 'analyst rating OR stock recommendation OR target price OR upgrade OR downgrade' },
    { value: 'economy', label: 'Economy', query: 'Indian economy OR RBI OR inflation OR GDP OR monetary policy' },
];

const NewsLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
                <div className="aspect-video w-full">
                    <Skeleton className="w-full h-full rounded-t-lg" />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </Card>
        ))}
    </div>
);

export default function NewsPage() {
    const [category, setCategory] = useState(STOCK_MARKET_CATEGORIES[0].value);
    const [searchQuery, setSearchQuery] = useState('');

    // Find the query for the selected category
    const categoryObj = STOCK_MARKET_CATEGORIES.find(cat => cat.value === category) || STOCK_MARKET_CATEGORIES[0];
    const effectiveQuery = searchQuery || categoryObj.query;

    const {
        articles,
        loading,
        error,
        totalResults,
        hasMore,
        loadMore,
        refresh,
    } = useNews({
        query: effectiveQuery,
        autoRefresh: true,
    });

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        setSearchQuery('');
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className={cn(
            " flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row ",
            "min-h-screen", // for your use case, use `h-screen` instead of `h-[60vh]`
        )}>
            <SideBar />
            <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
                {/* Header */}
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Newspaper className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Indian Stock Market News</h1>
                                <p className="text-muted-foreground">
                                    Stay updated with the latest news, earnings, regulations, and analysis from the Indian stock market
                                </p>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Articles</p>
                                            <p className="text-2xl font-bold">{totalResults.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Newspaper className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Loaded</p>
                                            <p className="text-2xl font-bold">{articles.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Category</p>
                                            <p className="text-2xl font-bold capitalize">
                                                {searchQuery ? 'Search' : categoryObj.label}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {/* Filters */}
                    <NewsFilters
                        categories={STOCK_MARKET_CATEGORIES}
                        selectedCategory={category}
                        onCategoryChange={handleCategoryChange}
                        onSearch={handleSearch}
                        onRefresh={refresh}
                        loading={loading}
                    />
                    {/* Error State */}
                    {error && (
                        <Alert className="mb-6" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error}. Please try again or contact support if the issue persists.
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* Loading State */}
                    {loading && articles.length === 0 ? (
                        <NewsLoadingSkeleton />
                    ) : (
                        <>
                            {/* News Grid */}
                            <NewsGrid articles={articles} />
                            {/* Load More Button */}
                            {hasMore && !loading && (
                                <div className="text-center mt-8">
                                    <Button
                                        onClick={loadMore}
                                        variant="outline"
                                        size="lg"
                                        className="min-w-[200px]"
                                    >
                                        Load More Articles
                                    </Button>
                                </div>
                            )}
                            {/* Loading More Indicator */}
                            {loading && articles.length > 0 && (
                                <div className="text-center mt-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-muted-foreground">Loading more articles...</span>
                                    </div>
                                </div>
                            )}
                            {/* No More Articles */}
                            {!hasMore && articles.length > 0 && (
                                <div className="text-center mt-8">
                                    <p className="text-muted-foreground">
                                        You've reached the end of the articles.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
