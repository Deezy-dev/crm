import { useState, useEffect, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Receipt,
  Radio,
  Clock,
  MessageSquare,
  ShieldCheck,
  Search,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/shared-ui';
import {
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey,
  session,
  type AnyRecord,
} from '@/lib/local-api';

import { CompanyPricingTab } from '@/components/settings/company-pricing-tab';
import { BillingRulesTab } from '@/components/settings/billing-rules-tab';
import { NetworkFtthTab } from '@/components/settings/network-ftth-tab';
import { FieldTeamSlaTab } from '@/components/settings/field-team-sla-tab';
import { CommunicationsTab } from '@/components/settings/communications-tab';
import { SecurityFiscalDataTab } from '@/components/settings/security-fiscal-data-tab';
import { SoftwareLicensingTab } from '@/components/settings/software-licensing-tab';

export function SettingsAdvancedPage() {
  const settingsQuery = useGetSettings();
  const update = useUpdateSettings();
  const queryClient = useQueryClient();
  const currentUser = session();
  const isAdmin = currentUser?.role === 'admin';

  const [form, setForm] = useState<AnyRecord>();
  const [activeTab, setActiveTab] = useState('empresa-precos');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settingsQuery.data && !form) {
      setForm({
        ...settingsQuery.data,
        internetPlans: settingsQuery.data.internetPlans || [],
        bankAccounts: settingsQuery.data.bankAccounts || [
          {
            name: 'Banco BAI',
            iban: 'AO06.0040.0000.1234.5678.9012.3',
            account: '12345678/10/001',
            holder: settingsQuery.data.companyName || 'OSDEL TECNOLOGIA',
          },
          {
            name: 'Banco BFA',
            iban: 'AO06.0006.0000.9876.5432.1098.7',
            account: '98765432/01/001',
            holder: settingsQuery.data.companyName || 'OSDEL TECNOLOGIA',
          },
        ],
      });
    }
  }, [settingsQuery.data, form]);

  if (settingsQuery.isLoading || !form) {
    return (
      <div className="surface rounded-2xl p-12 text-center border border-[hsl(var(--border))]">
        <RefreshCw className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" />
        <p className="text-sm font-bold text-slate-700">A carregar definições do sistema OSDEL...</p>
      </div>
    );
  }

  const set = (key: string, value: unknown) => {
    if (!isAdmin) return;
    setIsDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      alert('Acesso restrito: Apenas administradores podem gravar definições.');
      return;
    }

    update.mutate(
      { data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          setIsDirty(false);
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 3500);
        },
        onError: (err: any) => {
          alert(`Erro ao guardar: ${err.message || 'Erro desconhecido'}`);
        },
      },
    );
  };

  const tabs = [
    {
      id: 'empresa-precos',
      label: 'Identidade & Preços',
      badge: 'Geral',
      icon: Building2,
      description: 'Nome, NIF, logótipo, TV cabo base, pacotes de canais e planos de fibra.',
    },
    {
      id: 'cobranca-bancos',
      label: 'Cobrança & Bancos',
      badge: 'Financeiro',
      icon: Receipt,
      description: 'Prazos de vencimento, tolerância, taxas, acordos de dívida e contas bancárias.',
    },
    {
      id: 'rede-ftth',
      label: 'Rede FTTH & TV Cabo',
      badge: 'Telecom / NOC',
      icon: Radio,
      description: 'Mikrotik PPPoE, OLT GPON, faixas de IP, potência óptica RX e zonas cobertas.',
    },
    {
      id: 'piquete-sla',
      label: 'Piquete & SLAs',
      badge: 'Campo',
      icon: Clock,
      description: 'Prazos de atendimento, reparação, subsídios técnicos e checklist de entrega.',
    },
    {
      id: 'comunicacoes',
      label: 'Mensagens & SMS',
      badge: 'Automação',
      icon: MessageSquare,
      description: 'Gateway de SMS, WhatsApp, simulador de ecrã e modelos de notificação.',
    },
    {
      id: 'seguranca-fiscal',
      label: 'Fiscalidade & Segurança',
      badge: 'Auditoria',
      icon: ShieldCheck,
      description: 'Certificação AGT, faturas, políticas de sessão, logs e cópia de segurança JSON.',
    },
    {
      id: 'licenciamento',
      label: 'Software & Licença',
      badge: 'Gestão X',
      icon: ShieldCheck,
      description: 'Chave de ativação, titular da licença e portal comercial do distribuidor.',
    },
  ];

  // Quick search matching tabs
  const filteredTabs = tabs.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.label.toLowerCase().includes(query) ||
      t.badge.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {/* CABEÇALHO PRINCIPAL COM STATUS E ACÇÕES */}
      <div className="surface rounded-2xl p-6 border border-[hsl(var(--border))]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="eyebrow">Administração & Parâmetros Globais</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                OSDEL v2.4-AO
              </span>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Modo Administrador (Edição Total)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Lock size={12} /> Modo Consulta (Apenas Administrador Pode Alterar)
                </span>
              )}
            </div>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-[hsl(var(--foreground))]">
              Definições do Sistema
            </h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              Parametrização completa da OSDEL Tecnologia: telecomunicações FTTH, TV comunitária, políticas financeiras, fiscalidade e auditoria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={14} /> Alterações não guardadas
              </span>
            )}

            {isAdmin && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={update.isPending}
                className="px-5 shadow-sm"
              >
                {update.isPending ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> A guardar...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Guardar Definições
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* BARRA DE PESQUISA RÁPIDA NAS DEFINIÇÕES */}
        <div className="mt-5 pt-4 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Localizar secção (ex: OLT, Mikrotik, IBAN, Multa, AGT, SMS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium flex items-center gap-2">
            <SlidersHorizontal size={13} /> 6 Módulos de Configuração Disponíveis
          </div>
        </div>
      </div>

      {/* TOAST DE SUCESSO AO GUARDAR */}
      {savedToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>Todas as definições da OSDEL Tecnologia foram guardadas e propagadas no sistema com sucesso!</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(false)}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* NAVEGAÇÃO POR ABAS (TABS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {filteredTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col p-3 rounded-xl border text-left transition cursor-pointer relative ${
                isActive
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary)/.5)]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Icon
                  size={18}
                  className={isActive ? 'text-blue-600' : 'text-[hsl(var(--muted-foreground))]'}
                />
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.badge}
                </span>
              </div>
              <span
                className={`text-xs font-bold leading-tight ${
                  isActive ? 'text-blue-950' : 'text-[hsl(var(--foreground))]'
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DA ABA SELECCIONADA */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {activeTab === 'empresa-precos' && (
          <CompanyPricingTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'cobranca-bancos' && (
          <BillingRulesTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'rede-ftth' && (
          <NetworkFtthTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'piquete-sla' && (
          <FieldTeamSlaTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'comunicacoes' && (
          <CommunicationsTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'seguranca-fiscal' && (
          <SecurityFiscalDataTab form={form} set={set} isAdmin={isAdmin} />
        )}

        {activeTab === 'licenciamento' && (
          <SoftwareLicensingTab />
        )}

        {/* BARRA FIXA FLUTUANTE DE GRAVAÇÃO (CASO HAJA ALTERAÇÕES) */}
        {isDirty && isAdmin && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              Tem alterações pendentes
            </span>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={update.isPending}
              className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500"
            >
              {update.isPending ? 'A gravar...' : 'Guardar Agora'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
