'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRealTimeUpdates } from './useRealTimeUpdates';
import { useIntradayUpdates } from './useIntradayUpdates';

export interface UpdateManagerStatus {
  realTime: {
    isActive: boolean;
    lastUpdate: string | null;
    nextUpdate: string | null;
    stats: {
      total: number;
      successful: number;
      failed: number;
    } | null;
  };
  intraday: {
    lastUpdateResult: any | null;
    lastChecked: string | null;
  };
  isInitialized: boolean;
}

export const useUpdateManager = () => {
  const { user, isSignedIn } = useUser();
  const realTimeUpdates = useRealTimeUpdates();
  const intradayUpdates = useIntradayUpdates();
  
  const [status, setStatus] = useState<UpdateManagerStatus>({
    realTime: {
      isActive: false,
      lastUpdate: null,
      nextUpdate: null,
      stats: null
    },
    intraday: {
      lastUpdateResult: null,
      lastChecked: null
    },
    isInitialized: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize updates when user signs in
  useEffect(() => {
    if (isSignedIn && user && !status.isInitialized) {
      console.log('Initializing update manager for user:', user.id);
      
      // Real-time updates are already auto-started by useRealTimeUpdates hook
      // Intraday updates are now handled by cronjob.org
      
      setStatus(prev => ({
        ...prev,
        isInitialized: true
      }));
    } else if (!isSignedIn && status.isInitialized) {
      // User signed out, stop all updates
      console.log('User signed out, stopping all updates');
      realTimeUpdates.stopRealTimeUpdates();
      
      setStatus(prev => ({
        ...prev,
        isInitialized: false
      }));
    }
  }, [isSignedIn, user, status.isInitialized, realTimeUpdates]);

  // Update status based on real-time hook
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      realTime: {
        isActive: realTimeUpdates.status.isActive,
        lastUpdate: realTimeUpdates.status.lastUpdate,
        nextUpdate: realTimeUpdates.status.nextUpdate,
        stats: realTimeUpdates.status.stats
      }
    }));
  }, [realTimeUpdates.status]);

  // Update status based on intraday hook
  useEffect(() => {
    if (intradayUpdates.lastUpdateResult) {
      setStatus(prev => ({
        ...prev,
        intraday: {
          lastUpdateResult: intradayUpdates.lastUpdateResult,
          lastChecked: new Date().toISOString()
        }
      }));
    }
  }, [intradayUpdates.lastUpdateResult]);

  // Manual controls
  const startRealTimeUpdates = useCallback(() => {
    if (isSignedIn) {
      realTimeUpdates.startRealTimeUpdates();
    } else {
      setError('Please sign in to start real-time updates');
    }
  }, [isSignedIn, realTimeUpdates]);

  const stopRealTimeUpdates = useCallback(() => {
    realTimeUpdates.stopRealTimeUpdates();
  }, [realTimeUpdates]);

  const triggerIntradayUpdate = useCallback(async () => {
    if (!isSignedIn) {
      setError('Please sign in to trigger intraday updates');
      return null;
    }
    
    return await intradayUpdates.triggerUpdate();
  }, [isSignedIn, intradayUpdates]);

  return {
    status,
    isLoading: isLoading || realTimeUpdates.isLoading || intradayUpdates.isLoading,
    error: error || realTimeUpdates.error || intradayUpdates.error,
    isSignedIn,
    user,
    // Controls
    startRealTimeUpdates,
    stopRealTimeUpdates,
    triggerIntradayUpdate,
  };
};
