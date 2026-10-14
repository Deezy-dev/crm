import { useState, useEffect, useCallback } from 'react';
import {
  isSystemOnline,
  isSimulatedOffline,
  setSimulatedOffline,
  isCurrentlySyncing,
  getPendingSyncCount,
  getSyncQueue,
  getSyncHistory,
  getLastSyncTimestamp,
  syncPendingQueue,
  clearSyncedItems,
  exportOfflineBackup,
  importOfflineBackup,
  type SyncQueueItem,
  type SyncHistorySession,
} from '@/lib/offline-sync';

export function useOnlineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() => isSystemOnline());
  const [isSimulated, setIsSimulated] = useState<boolean>(() => isSimulatedOffline());
  const [isSyncing, setIsSyncing] = useState<boolean>(() => isCurrentlySyncing());
  const [pendingCount, setPendingCount] = useState<number>(() => getPendingSyncCount());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLastSyncTimestamp());
  const [queue, setQueue] = useState<SyncQueueItem[]>(() => getSyncQueue());
  const [history, setHistory] = useState<SyncHistorySession[]>(() => getSyncHistory());

  const refreshState = useCallback(() => {
    setIsOnline(isSystemOnline());
    setIsSimulated(isSimulatedOffline());
    setIsSyncing(isCurrentlySyncing());
    setPendingCount(getPendingSyncCount());
    setLastSyncTime(getLastSyncTimestamp());
    setQueue(getSyncQueue());
    setHistory(getSyncHistory());
  }, []);

  useEffect(() => {
    refreshState();

    const handleSyncChange = () => {
      refreshState();
    };

    window.addEventListener('osdel-sync-change', handleSyncChange);
    window.addEventListener('online', handleSyncChange);
    window.addEventListener('offline', handleSyncChange);

    return () => {
      window.removeEventListener('osdel-sync-change', handleSyncChange);
      window.removeEventListener('online', handleSyncChange);
      window.removeEventListener('offline', handleSyncChange);
    };
  }, [refreshState]);

  const syncNow = useCallback(async () => {
    const res = await syncPendingQueue({ source: 'manual' });
    refreshState();
    return res;
  }, [refreshState]);

  const toggleSimulateOffline = useCallback(() => {
    const next = !isSimulatedOffline();
    setSimulatedOffline(next);
    refreshState();
  }, [refreshState]);

  const clearSynced = useCallback(() => {
    clearSyncedItems();
    refreshState();
  }, [refreshState]);

  const exportBackup = useCallback(() => {
    const json = exportOfflineBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osdel-backup-offline-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    isOnline,
    isSimulated,
    isSyncing,
    pendingCount,
    lastSyncTime,
    queue,
    history,
    syncNow,
    toggleSimulateOffline,
    clearSynced,
    exportBackup,
    importBackup: importOfflineBackup,
  };
}
