import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  HardDrive,
  Cloud,
  Check,
  X,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useOnlineSync } from '@/hooks/use-online-sync';
import { PWAInstallButton } from '@/components/pwa-install-button';

interface SyncCenterModalProps {
  onClose: () => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ onClose }) => {
  const {
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
  } = useOnlineSync();

  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'diagnostics'>('queue');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    setSyncFeedback(null);
    const res = await syncNow();
    if (res.syncedCount > 0) {
      setSyncFeedback(`Sincronização concluída com sucesso! ${res.syncedCount} operações actualizadas.`);
    } else if (!isOnline) {
      setSyncFeedback('Não foi possível sincronizar: dispositivo sem ligação à internet.');
    } else {
      setSyncFeedback('Tudo em dia! Nenhuma operação pendente no momento.');
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Nunca sincronizado';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const moduleColors: Record<string, string> = {
    clientes: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    pagamentos: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    despesas: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    ordens: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    inventario: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    fecho: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    configuracoes: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    geral: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex flex-col max-h-[90vh] w-full max-w-3xl rounded-2xl bg-[hsl(var(--card))] shadow-2xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl ${
                !isOnline
                  ? 'bg-amber-500/15 text-amber-600'
                  : 'bg-emerald-500/15 text-emerald-600'
              }`}
            >
              {!isOnline ? <WifiOff size={22} /> : <Cloud size={22} />}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[hsl(var(--foreground))]">
                Central de Sincronização & Modo Offline
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {isOnline
                  ? 'Conectado à rede · Sincronização automática em segundo plano activa'
                  : 'Modo Offline activo · Alterações guardadas localmente e prontas para sincronizar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] transition"
          >
            <X size={18} />
          </button>
        </header>

        {/* Status Dashboard Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-4 sm:px-6">
          {/* Status Box */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Estado de Ligação
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  !isOnline ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span className="text-sm font-extrabold text-[hsl(var(--foreground))]">
                {isOnline ? 'Online (Conectado)' : 'Offline (Sem Sinal)'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              {isSimulated ? 'Simulação de teste manual' : 'Detectado pelo dispositivo'}
            </div>
          </div>

          {/* Pending Box */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Fila Pendente
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-black text-[hsl(var(--foreground))]">
                {pendingCount}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {pendingCount === 1 ? 'operação' : 'operações'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              {pendingCount > 0
                ? 'Aguardando envio para a nuvem'
                : 'Todas as operações sincronizadas'}
            </div>
          </div>

          {/* Last Sync Box */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Última Sincronização
            </div>
            <div className="mt-1 text-xs font-bold text-[hsl(var(--foreground))] truncate">
              {formatDate(lastSyncTime)}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              Automática ao detectar rede
            </div>
          </div>
        </div>

        {/* Sync Controls & Offline Simulator Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-6 py-3 bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] hover:brightness-110 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'A sincronizar...' : 'Sincronizar Agora'}</span>
            </button>

            {/* Offline Simulation Toggle for Testing */}
            <button
              onClick={toggleSimulateOffline}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                isSimulated
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
              title="Permite testar como o sistema funciona sem internet e observar a sincronização automática ao voltar a ficar online."
            >
              {isSimulated ? <WifiOff size={14} /> : <Wifi size={14} />}
              <span>{isSimulated ? 'Desactivar Simulação Offline' : 'Simular Modo Offline (Teste)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportBackup}
              title="Descarregar ficheiro JSON com todos os dados locais e fila de sincronização"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Exportar Backup</span>
            </button>

            <PWAInstallButton variant="compact" />
          </div>
        </div>

        {syncFeedback && (
          <div className="mx-6 mt-3 rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Check size={16} className="text-blue-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-6 pt-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'queue'
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Layers size={14} />
            <span>Fila de Operações ({queue.length})</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Clock size={14} />
            <span>Histórico de Sincronizações ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <HardDrive size={14} />
            <span>Armazenamento & PWA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[260px]">
          {activeTab === 'queue' && (
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-[hsl(var(--muted-foreground))]">
                  <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
                  <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                    Fila de sincronização vazia
                  </p>
                  <p className="text-xs max-w-sm mt-1">
                    Qualquer registo ou alteração que fizer enquanto estiver sem internet aparecerá aqui e será enviado automaticamente quando a rede voltar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] pb-1">
                    <span>Lista cronológica das operações realizadas:</span>
                    {queue.some((i) => i.status === 'synced') && (
                      <button
                        onClick={clearSynced}
                        className="text-xs font-bold text-[hsl(var(--primary))] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Limpar itens sincronizados
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
                    {queue.slice().reverse().map((item) => {
                      const colorClass = moduleColors[item.module] || moduleColors.geral;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs hover:bg-[hsl(var(--secondary)/.3)] transition"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`mt-0.5 inline-block rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${colorClass}`}
                            >
                              {item.module}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-[hsl(var(--foreground))] truncate">
                                {item.description}
                              </div>
                              <div className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-2 mt-0.5">
                                <span>{formatDate(item.timestamp)}</span>
                                <span>·</span>
                                <span className="uppercase">{item.action}</span>
                                {item.syncedAt && (
                                  <>
                                    <span>·</span>
                                    <span className="text-emerald-600">Sincronizado {formatDate(item.syncedAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                            {item.status === 'synced' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 size={12} /> Sincronizado
                              </span>
                            ) : item.status === 'syncing' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                                <RefreshCw size={12} className="animate-spin" /> A enviar
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                <Clock size={12} /> Pendente (Offline)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  Ainda não há sessões de sincronização arquivadas.
                </div>
              ) : (
                <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
                  {history.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between p-3 text-xs hover:bg-[hsl(var(--secondary)/.3)]"
                    >
                      <div>
                        <div className="font-bold text-[hsl(var(--foreground))]">
                          {sess.source === 'auto_reconnect'
                            ? 'Sincronização Automática (Reconexão)'
                            : sess.source === 'periodic'
                            ? 'Sincronização Periódica de Fundo'
                            : 'Sincronização Manual'}
                        </div>
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                          Iniciada em {formatDate(sess.startedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {sess.syncedCount} {sess.syncedCount === 1 ? 'item enviado' : 'itens enviados'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-4 space-y-3">
                <div className="font-bold text-sm text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  Como Funciona a Conectividade Offline & Sincronização
                </div>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  A OSDEL TECNOLOGIA utiliza arquitectura <b>Offline-First</b> avançada com Service Workers (PWA) e cache persistente. Isto garante que técnicos de campo e operadores de balcão nunca parem o trabalho por falta de sinal de rede em Luanda:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg bg-[hsl(var(--card))] p-3 border border-[hsl(var(--border))] space-y-1">
                    <b className="text-[hsl(var(--foreground))] block">1. Sem Internet (Offline)</b>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      A interface carrega imediatamente da memória local (Service Worker). Todas as emissões de recibos, ordens e cadastros são salvas na base de dados do dispositivo.
                    </p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--card))] p-3 border border-[hsl(var(--border))] space-y-1">
                    <b className="text-[hsl(var(--foreground))] block">2. Reconexão Automática</b>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      Assim que o modem ou dados móveis voltam a ter sinal, o motor detecta a conexão e transmite em fila ordenada todas as acções com carimbo de tempo garantido.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
                <div className="font-bold text-[hsl(var(--foreground))]">Diagnóstico Técnico do Navegador</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                  <div>Suporte a Service Worker: <b>{typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '✓ Activo e compatível' : '✗ Não suportado'}</b></div>
                  <div>Armazenamento Local: <b>Disponível (LocalStorage & IndexedDB)</b></div>
                  <div>Modo de Exibição: <b>{typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'PWA Nativo' : 'Navegador Web'}</b></div>
                  <div>Detecção de Rede: <b>Real-time via Window Events & Heartbeat</b></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] px-6 py-3.5">
          <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
            OSDEL Gestão Integrada · PWA v2.4 Offline-Ready
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition cursor-pointer"
          >
            Fechar Janela
          </button>
        </footer>
      </div>
    </div>
  );
};
