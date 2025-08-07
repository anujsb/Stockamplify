'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealTimePortfolioStatus {
  isActive: boolean;
  lastUpdate: string | null;
  nextUpdate: string | null;
  portfolioLastUpdated: string | null;
}

export const useRealTimePortfolio = (initialPortfolio: any[] = []) => {
  const [portfolio, setPortfolio] = useState<any[]>(initialPortfolio);
  const [status, setStatus] = useState<RealTimePortfolioStatus>({
    isActive: false,
    lastUpdate: null,
    nextUpdate: null,
    portfolioLastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isUserActiveRef = useRef<boolean>(true);

  // Update initial portfolio data when prop changes
  useEffect(() => {
    setPortfolio(initialPortfolio);
  }, [initialPortfolio]);

  // Track user activity (mouse movement, keyboard input, etc.)
  const trackUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    isUserActiveRef.current = true;
  }, []);

  // Fetch fresh portfolio data from API
  const fetchPortfolioData = useCallback(async () => {
    // Check if user has been inactive for more than 5 minutes
    const inactiveTime = Date.now() - lastActivityRef.current;
    const maxInactiveTime = 5 * 60 * 1000; // 5 minutes

    if (inactiveTime > maxInactiveTime) {
      console.log('User inactive, skipping portfolio update');
      isUserActiveRef.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.data);
        
        const now = new Date().toISOString();
        const nextUpdate = new Date(Date.now() + 60000).toISOString(); // Next update in 1 minute
        
        // Get the latest price update time from the portfolio data
        const latestPriceUpdate = data.data.reduce((latest: string | null, item: any) => {
          // Try real-time price first, then intraday, then stock lastRefreshedAt, then updatedAt
          const priceUpdatedAt = item.realTimePrice?.updatedAt || 
                                item.intradayPrice?.updatedAt || 
                                item.stock?.lastRefreshedAt || 
                                item.updatedAt;
          
          // Debug log the updatedAt value (only for first item to reduce noise)
          if (data.data.indexOf(item) === 0) {
            console.log('Sample price updatedAt for', item.stock?.symbol, ':', {
              realTime: item.realTimePrice?.updatedAt,
              intraday: item.intradayPrice?.updatedAt,
              stockRefreshed: item.stock?.lastRefreshedAt,
              portfolioUpdated: item.updatedAt,
              selected: priceUpdatedAt
            });
          }
          
          if (!priceUpdatedAt) {
            console.warn('No update timestamp found for stock:', item.stock?.symbol);
            return latest;
          }
          
          // Validate the date string before using it
          const updateDate = new Date(priceUpdatedAt);
          if (isNaN(updateDate.getTime())) {
            console.warn('Invalid date found:', priceUpdatedAt, 'for stock:', item.stock?.symbol);
            return latest;
          }
          
          if (!latest) return priceUpdatedAt;
          
          const latestDate = new Date(latest);
          if (isNaN(latestDate.getTime())) {
            console.warn('Invalid latest date found:', latest);
            return priceUpdatedAt;
          }
          
          if (updateDate > latestDate) {
            return priceUpdatedAt;
          }
          return latest;
        }, null);
        
        console.log('Latest price update timestamp:', latestPriceUpdate);

        setStatus(prev => ({
          ...prev,
          lastUpdate: now,
          nextUpdate,
          portfolioLastUpdated: latestPriceUpdate
        }));

        console.log('Portfolio data updated successfully');
      } else {
        throw new Error(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching portfolio data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if real-time update is needed based on IST market hours
  const isRealTimeUpdateNeeded = useCallback(() => {
    const now = new Date();

    // Convert to IST
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    // Check if today is a trading day (Monday = 1, Friday = 5, Saturday = 6, Sunday = 0)
    const dayOfWeek = nowIST.getDay();
    const isTradingDay = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (!isTradingDay) {
      console.log('Not a trading day, skipping continuous updates');
      return false;
    }

    // Get today's date in IST
    const today = nowIST.toISOString().split('T')[0];

    // Create market times for today in IST
    const marketOpen = new Date(`${today}T09:00:00.000+05:30`);
    const marketClose = new Date(`${today}T15:45:00.000+05:30`);

    const isWithinHours = nowIST >= marketOpen && nowIST <= marketClose;
    
    console.log(`Market hours check: ${nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}, Trading day: ${isTradingDay}, Within hours: ${isWithinHours}`);
    
    // Check if within market hours
    return isWithinHours;
  }, []);

  // Stop real-time updates
  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStatus(prev => ({
      ...prev,
      isActive: false,
      nextUpdate: null
    }));

    console.log('Real-time portfolio updates stopped');
  }, []);

  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRealTimeUpdateNeeded()) {
      // Immediate update
      fetchPortfolioData();

      // Set up interval for every minute (60000ms)
      intervalRef.current = setInterval(() => {
        if (isUserActiveRef.current) {
          // Check if still within market hours before updating
          if (isRealTimeUpdateNeeded()) {
            fetchPortfolioData();
          } else {
            console.log('Market closed, stopping real-time updates');
            stopRealTimeUpdates();
          }
        }
      }, 60000);

      console.log('Real-time portfolio updates started during market hours');
    } else {
      // Market closed - single update only
      fetchPortfolioData();
      console.log('Single portfolio update outside market hours');
    }

    setStatus(prev => ({
      ...prev,
      isActive: isRealTimeUpdateNeeded(),
      nextUpdate: isRealTimeUpdateNeeded() ? new Date(Date.now() + 60000).toISOString() : null
    }));
  }, [fetchPortfolioData, isRealTimeUpdateNeeded, stopRealTimeUpdates]);

  // Manual refresh function
  const refreshPortfolio = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Set up activity listeners and auto-start on mount
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackUserActivity, { passive: true });
    });

    // Auto-start real-time updates when component mounts
    startRealTimeUpdates();

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, trackUserActivity);
      });

      // Clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trackUserActivity, startRealTimeUpdates]);

  // Check if user becomes inactive and stop updates after prolonged inactivity
  useEffect(() => {
    const inactivityChecker = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      const maxInactiveTime = 10 * 60 * 1000; // 10 minutes - longer threshold for stopping

      if (inactiveTime > maxInactiveTime && status.isActive) {
        console.log('User inactive for too long, stopping real-time updates');
        stopRealTimeUpdates();
      }
    }, 60000); // Check every minute

    return () => clearInterval(inactivityChecker);
  }, [status.isActive, stopRealTimeUpdates]);

  return {
    portfolio,
    status,
    isLoading,
    error,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    refreshPortfolio
  };
};
