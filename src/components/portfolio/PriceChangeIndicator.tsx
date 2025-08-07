import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChangeIndicatorProps {
  currentPrice: number | null;
  previousPrice?: number | null;
  updatedAt?: string | null;
  className?: string;
}

const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  currentPrice,
  previousPrice,
  updatedAt,
  className = '',
}) => {
  const [isRecentlyUpdated, setIsRecentlyUpdated] = useState(false);

  // Check if the price was recently updated (within last 2 minutes)
  useEffect(() => {
    if (!updatedAt) return;

    const updateTime = new Date(updatedAt).getTime();
    const now = Date.now();
    const timeDiff = now - updateTime;
    const isRecent = timeDiff < 2 * 60 * 1000; // 2 minutes

    setIsRecentlyUpdated(isRecent);

    if (isRecent) {
      // Remove the highlight after 3 seconds
      const timer = setTimeout(() => {
        setIsRecentlyUpdated(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [updatedAt]);

  if (currentPrice === null || currentPrice === undefined) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-gray-400">N/A</span>
      </div>
    );
  }

  // Determine price change direction
  let changeDirection: 'up' | 'down' | 'neutral' = 'neutral';
  if (previousPrice !== null && previousPrice !== undefined && currentPrice !== previousPrice) {
    changeDirection = currentPrice > previousPrice ? 'up' : 'down';
  }

  // Get appropriate colors and icons
  const getIndicatorClasses = () => {
    const baseClasses = isRecentlyUpdated 
      ? 'transition-all duration-300 transform animate-pulse' 
      : 'transition-all duration-200';

    switch (changeDirection) {
      case 'up':
        return {
          container: `${baseClasses} ${isRecentlyUpdated ? 'bg-green-50 ring-2 ring-green-200' : ''}`,
          price: 'text-green-600',
          icon: TrendingUp,
          iconColor: 'text-green-500'
        };
      case 'down':
        return {
          container: `${baseClasses} ${isRecentlyUpdated ? 'bg-red-50 ring-2 ring-red-200' : ''}`,
          price: 'text-red-600',
          icon: TrendingDown,
          iconColor: 'text-red-500'
        };
      default:
        return {
          container: `${baseClasses} ${isRecentlyUpdated ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`,
          price: 'text-gray-900',
          icon: Minus,
          iconColor: 'text-gray-400'
        };
    }
  };

  const indicatorClasses = getIndicatorClasses();
  const IconComponent = indicatorClasses.icon;

  return (
    <div className={`flex items-center space-x-1 px-1 py-0.5 rounded ${indicatorClasses.container} ${className}`}>
      <IconComponent className={`w-3 h-3 ${indicatorClasses.iconColor}`} />
      <span className={`font-medium ${indicatorClasses.price}`}>
        {currentPrice.toFixed(2)}
      </span>
      {isRecentlyUpdated && (
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      )}
    </div>
  );
};

export default PriceChangeIndicator;
