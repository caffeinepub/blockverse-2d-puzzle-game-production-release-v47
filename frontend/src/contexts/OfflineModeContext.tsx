import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface OfflineModeContextType {
  isOffline: boolean;
  syncPending: boolean;
  syncData: () => Promise<void>;
}

const OfflineModeContext = createContext<OfflineModeContextType | undefined>(undefined);

export function OfflineModeProvider({ children }: { children: ReactNode }) {
  const isOnline = useNetworkStatus();
  const [syncPending, setSyncPending] = useState(false);

  useEffect(() => {
    // Check if there's pending data to sync when coming back online
    if (isOnline) {
      const hasPendingSync = localStorage.getItem('blockverse-pending-sync');
      if (hasPendingSync === 'true') {
        setSyncPending(true);
        syncData();
      }
    } else {
      // Mark that we have pending data when going offline
      localStorage.setItem('blockverse-pending-sync', 'true');
    }
  }, [isOnline]);

  const syncData = async () => {
    if (!isOnline) return;

    try {
      // In a real implementation, this would sync with backend
      // For now, we just clear the pending flag since data is stored locally
      localStorage.removeItem('blockverse-pending-sync');
      setSyncPending(false);
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  };

  return (
    <OfflineModeContext.Provider value={{ isOffline: !isOnline, syncPending, syncData }}>
      {children}
    </OfflineModeContext.Provider>
  );
}

export function useOfflineMode() {
  const context = useContext(OfflineModeContext);
  if (context === undefined) {
    throw new Error('useOfflineMode must be used within OfflineModeProvider');
  }
  return context;
}
