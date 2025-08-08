"use client";
import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RealTimePortfolioStatus } from '@/lib/hooks/useRealTimePortfolio';

interface RealTimeStatusProps {
  status: RealTimePortfolioStatus;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
  status,
  isLoading,
  error,
  onRefresh,
}) => {
  // Check if current time is within market hours (9:00 AM - 3:45 PM IST, Mon-Fri)
  const isWithinMarketHours = () => {
    const now = new Date();

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }, []);


    // Convert to IST
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    console.log('Current IST time:', nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    // Check if today is a trading day (Monday = 1, Friday = 5)
    const dayOfWeek = nowIST.getDay();
    const isTradingDay = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (!isTradingDay) {
      return false;
    }

    // Get today's date in IST
    const today = nowIST.toISOString().split('T')[0];

    // Create market times for today in IST
    const marketOpen = new Date(`${today}T09:00:00.000+05:30`);
    const marketClose = new Date(`${today}T15:45:00.000+05:30`);

    return nowIST >= marketOpen && nowIST <= marketClose;
  };

  // Check if automatic updates are stale (more than 1 minute without update during market hours)
  const areUpdatesStale = () => {
    if (!status.isActive || !status.lastUpdate) return false;

    const lastUpdate = new Date(status.lastUpdate);
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
    const oneMinuteInMs = 60 * 1000;

    return timeSinceLastUpdate > oneMinuteInMs;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();

      // Check if it's today
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } else {
        return date.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString);
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 0) {
        return 'just now';
      } else if (diffSecs < 60) {
        return `${diffSecs}s ago`;
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) {
          return `${diffHours}h ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          return `${diffDays}d ago`;
        }
      }
    } catch (error) {
      console.error('Error calculating time ago:', error, 'dateString:', dateString);
      return '';
    }
  };

  const getNextUpdateTime = () => {
    if (!status.nextUpdate || !status.isActive) return null;

    const nextUpdate = new Date(status.nextUpdate);
    const now = new Date();
    const diffMs = nextUpdate.getTime() - now.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs <= 0) return 'Updating now...';
    if (diffSecs < 60) return `${diffSecs}s`;

    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ${diffSecs % 60}s`;
  };

  const nextUpdateCountdown = getNextUpdateTime();
  const withinMarketHours = isWithinMarketHours();
  const updatesStale = areUpdatesStale();

  // Enable refresh button only when:
  // 1. Outside market hours: DISABLED
  // 2. Within market hours AND automatic updates are working: DISABLED
  // 3. Within market hours AND automatic updates are stale (>1 min): ENABLED
  const shouldEnableRefresh = withinMarketHours && (updatesStale || !status.isActive);

  const getRefreshButtonTooltip = () => {
    if (!withinMarketHours) {
      return 'Refresh is only available during market hours (9:00 AM - 3:45 PM IST, Mon-Fri)';
    }
    if (status.isActive && !updatesStale) {
      return 'Automatic updates are working. Manual refresh not needed.';
    }
    return 'Click to refresh portfolio data';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            {status.isActive ? (
              <div className="flex items-center space-x-1">
                <Wifi className={`w-4 h-4 ${isLoading ? 'text-yellow-500' : 'text-green-500'}`} />
                <span className={`text-sm font-medium ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isLoading ? 'Updating...' : 'Live'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <WifiOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Offline</span>
              </div>
            )}
          </div>

          {/* Last Updated */}
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Prices updated:</span>{' '}
              {status.portfolioLastUpdated ? (
                <>
                  {formatTime(status.portfolioLastUpdated)}
                  {getTimeAgo(status.portfolioLastUpdated) && (
                    <span className="text-gray-400 ml-1">
                      ({getTimeAgo(status.portfolioLastUpdated)})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-yellow-600">No recent updates</span>
              )}
            </div>
          </div>

          {/* Next Update Countdown */}
          {status.isActive && nextUpdateCountdown && (
            <div className="text-sm text-gray-500">
              <span>Next update in: </span>
              <span className="font-mono font-medium">{nextUpdateCountdown}</span>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          // onClick={onRefresh}
          onClick={() => {
            console.log('🔄 Refresh button clicked!');
            console.log('📊 onRefresh function:', typeof onRefresh);
            if (typeof onRefresh === 'function') {
              console.log('✅ Calling onRefresh...');
              onRefresh();
            } else {
              console.error('❌ onRefresh is not a function!');
            }
          }}

          disabled={isLoading || !shouldEnableRefresh}
          className="flex items-center space-x-1"
          title={getRefreshButtonTooltip()}
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            <span className="font-medium">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Market Hours Info */}
      <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Real-time updates run during market hours (9:00 AM - 3:45 PM IST, Mon-Fri).
          {!status.isActive && ' Outside market hours, updates only on login/refresh.'}
        </span>
        <span className="">
          {!withinMarketHours && (
            <span className="text-orange-500 "> Refresh disabled outside market hours.</span>
          )}
          {withinMarketHours && status.isActive && !updatesStale && (
            <span className="text-green-500 "> Automatic updates active - manual refresh disabled.</span>
          )}
          {withinMarketHours && updatesStale && (
            <span className="text-yellow-500"> Automatic updates may be stale - manual refresh available.</span>
          )}
        </span>
      </div>
      {/* Debug Info - Remove this in production */}
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Debug:</strong> Button enabled: {shouldEnableRefresh ? '✅' : '❌'} |
        Market hours: {withinMarketHours ? '✅' : '❌'} |
        Updates stale: {updatesStale ? '✅' : '❌'} |
        Status active: {status.isActive ? '✅' : '❌'}
      </div>
    </div>
  );
};

export default RealTimeStatus;