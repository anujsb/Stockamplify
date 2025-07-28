// src/lib/hooks/useIntradayUpdates.ts
'use client';
import { useState, useCallback } from 'react';

export interface IntradayUpdateResult {
  success: boolean;
  message: string;
  data: {
    updatedCount: number;
    failedCount: number;
    totalStocks: number;
    errors?: string[];
  };
}

export const useIntradayUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateResult, setLastUpdateResult] = useState<IntradayUpdateResult | null>(null);

  // Trigger intraday data update manually (for admin purposes)
  const triggerUpdate = useCallback(async (): Promise<IntradayUpdateResult | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/stocks/update-intraday', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update intraday data');
      }
      
      const data = await response.json();
      setLastUpdateResult(data);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating intraday data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    lastUpdateResult,
    triggerUpdate,
  };
};
