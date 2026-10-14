import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Cloud, CloudOff } from 'lucide-react';
import { useOnlineSync } from '@/hooks/use-online-sync';
import { SyncCenterModal } from '@/components/sync-center-modal';

export const SyncStatusPill: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, isSimulated } = useOnlineSync();
  const [modalOpen, setModalOpen] = useState(false);
  const [justSyncedBanner, setJustSyncedBanner] = useState<string | null>(null);

  useEffect(() => {
    const handleCompleted = (e: any) => {
      const { syncedCount } = e.detail || {};
      if (syncedCount > 0) {
        setJustSyncedBanner(`${syncedCount} ${syncedCount === 1 ? 'operação sincronizada' : 'operações sincronizadas'}!`);
        const t = setTimeout(() => setJustSyncedBanner(null), 4000);
        return () => clearTimeout(t);
      }
    };
    window.addEventListener('osdel-sync-completed', handleCompleted);
    return () => window.removeEventListener('osdel-sync-completed', handleCompleted);
  }, []);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title="Clique para abrir a Central de Sincronização & Modo Offline"
        className={`group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs ${
          isSyncing
            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
            : !isOnline
            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
            : pendingCount > 0
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400/30 hover:bg-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
        }`}
      >
        {isSyncing ? (
          <>
            <RefreshCw size={13} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">A sincronizar...</span>
            <span className="sm:hidden">Sincronizando</span>
          </>
        ) : !isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <WifiOff size={13} className="text-amber-600 dark:text-amber-400" />
            <span className="font-extrabold">Offline</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-600 text-white px-1.5 py-0.2 text-[10px] font-black">
                {pendingCount}
              </span>
            )}
            {isSimulated && (
              <span className="hidden md:inline text-[10px] opacity-75 font-normal">(Simulado)</span>
            )}
          </>
        ) : pendingCount > 0 ? (
          <>
            <CloudOff size={13} className="text-amber-600" />
            <span>{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wifi size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Online</span>
            <span className="hidden md:inline text-[11px] font-medium opacity-80">· Sincronizado</span>
          </>
        )}
      </button>

      {/* Floating toast notification when auto-sync succeeds */}
      {justSyncedBanner && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="rounded-full bg-emerald-500/20 p-1 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">Ligação restabelecida!</p>
            <p className="text-slate-300 text-[11px]">{justSyncedBanner}</p>
          </div>
        </div>
      )}

      {modalOpen && <SyncCenterModal onClose={() => setModalOpen(false)} />}
    </>
  );
};
