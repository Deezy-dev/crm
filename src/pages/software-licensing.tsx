import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Lock,
  Unlock,
  Receipt,
  Download,
  Calendar,
  Layers,
  FileCheck,
  KeyRound,
  Check,
  Copy,
} from 'lucide-react';
import { useTenants } from '@/hooks/use-tenants';
import {
  type TenantCompany,
  type SubscriptionPaymentRecord,
  getSubscriptionPayments,
  updateTenantStatus,
  recordSubscriptionPayment,
  registerNewTenant,
  SAAS_PLANS,
} from '@/lib/tenants';
import { toast } from 'sonner';

const formatKz = (val: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace('AOA', 'Kz');

export function SoftwareLicensingPage() {
  const { tenants, activeTenant, switchTenant } = useTenants();
  const [, setLocation] = useLocation();
  const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>(() =>
    getSubscriptionPayments()
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isNewLicenseOpen, setIsNewLicenseOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Client Form
  const [newName, setNewName] = useState('');
  const [newTradingName, setNewTradingName] = useState('');
  const [newNif, setNewNif] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProvince, setNewProvince] = useState('Luanda');
  const [newCity, setNewCity] = useState('');
  const [newService, setNewService] = useState<'tv' | 'fibra' | 'combo'>('combo');
  const [newPlan, setNewPlan] = useState<'start' | 'pro' | 'enterprise'>('pro');
  const [newResponsible, setNewResponsible] = useState('');

  // Business Metrics for Albert
  const totalClients = tenants.length;
  const activeLicenses = tenants.filter((t) => t.subscriptionStatus === 'ativo').length;
  const trialLicenses = tenants.filter((t) => t.subscriptionStatus === 'trial').length;
  const mrrTotal = tenants.reduce((acc, t) => {
    const plan = SAAS_PLANS.find((p) => p.id === t.planId);
    return acc + (plan?.monthlyPrice || 0);
  }, 0);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.responsibleName.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.nif.includes(search);

    const matchesStatus =
      filterStatus === 'todos' ? true : t.subscriptionStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newResponsible.trim()) {
      toast.error('Preencha os campos obrigatórios da empresa cliente.');
      return;
    }

    const created = registerNewTenant({
      name: newName,
      tradingName: newTradingName || newName,
      nif: newNif || `54${Math.floor(10000000 + Math.random() * 90000000)}`,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gestaox.ao`,
      address: 'Sede da Empresa',
      city: newCity || 'Luanda',
      province: newProvince,
      servicesSupported: newService,
      planId: newPlan,
      responsibleName: newResponsible,
      responsibleRole: 'Gestor Geral',
    });

    setIsNewLicenseOpen(false);
    toast.success(`Licença de software emitida com sucesso para ${created.name}!`);
    // Reset form
    setNewName('');
    setNewTradingName('');
    setNewNif('');
    setNewPhone('');
    setNewEmail('');
    setNewResponsible('');
  };

  const copyLicenseKey = (tenant: TenantCompany) => {
    const key = `GX-${tenant.slug.toUpperCase()}-${tenant.id.slice(-6).toUpperCase()}-2026`;
    navigator.clipboard?.writeText(key);
    setCopiedKey(tenant.id);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.info(`Chave de ativação da licença copiada para a área de transferência.`);
  };

  const handleEnterClientEnvironment = (tenant: TenantCompany) => {
    switchTenant(tenant.id);
    toast.success(`Ambiente de suporte ativado para: ${tenant.tradingName || tenant.name}`);
    setLocation('/');
  };

  return (
    <div className="space-y-7">
      {/* Header Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            <span>Gestão X</span>
            <span aria-hidden="true">/</span>
            <span className="text-[hsl(var(--foreground))] font-bold">
              Licenciamento & Empresas Clientes
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Gestão Comercial do Software
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 max-w-2xl">
            Acompanhamento das operadoras e empresas parceiras que utilizam o <b>Gestão X</b>,
            emissão de novas licenças de uso e controlo de mensalidades de software.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewLicenseOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-xs hover:brightness-110 transition"
          >
            <Plus size={15} />
            <span>Emitir Nova Licença</span>
          </button>
        </div>
      </div>

      {/* Indicadores de Negócio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Empresas Clientes
            </span>
            <Building2 size={16} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-[hsl(var(--foreground))]">
            {totalClients}
          </div>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
            Operadoras registadas na plataforma
          </p>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Faturamento Mensal (MRR)
            </span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">
            {formatKz(mrrTotal)}
          </div>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
            Receita mensal recorrente de licenças
          </p>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Licenças Activas
            </span>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-[hsl(var(--foreground))]">
            {activeLicenses}
          </div>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
            {trialLicenses} empresa(s) em período de demonstração
          </p>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Empresa Actual
            </span>
            <ShieldCheck size={16} className="text-[hsl(var(--primary))]" />
          </div>
          <div className="mt-2 text-base font-bold text-[hsl(var(--foreground))] truncate">
            {activeTenant?.tradingName || 'OSDEL Tecnologia'}
          </div>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
            Ambiente de trabalho em operação
          </p>
        </div>
      </div>

      {/* Lista de Empresas Licenciadas */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-[hsl(var(--foreground))]">
              Empresas Licenciadas
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              Lista das empresas que adquiriram o Gestão X para as suas operações.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
              <input
                type="text"
                placeholder="Pesquisar por empresa, NIF ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 w-56 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-8 pr-3 text-xs outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]"
            >
              <option value="todos">Todos os estados</option>
              <option value="ativo">Licença activa</option>
              <option value="trial">Demonstração (Trial)</option>
              <option value="atrasado">Mensalidade pendente</option>
              <option value="bloqueado">Suspenso</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[hsl(var(--muted-foreground))] font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Empresa / Denominação</th>
                <th className="py-2.5 px-4">Contacto & Responsável</th>
                <th className="py-2.5 px-4">Serviços</th>
                <th className="py-2.5 px-4">Plano Contratado</th>
                <th className="py-2.5 px-4">Estado da Licença</th>
                <th className="py-2.5 px-4">Próxima Mensalidade</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredTenants.map((t) => {
                const plan = SAAS_PLANS.find((p) => p.id === t.planId);
                const isCurrent = t.id === activeTenant?.id;

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-[hsl(var(--secondary)/.25)] transition ${
                      isCurrent ? 'bg-[hsl(var(--primary)/.03)]' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.logoUrl || '/osdel-logo.jpg'}
                          alt={t.name}
                          className="h-7 w-7 rounded-md object-contain bg-white border border-[hsl(var(--border))] p-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
                            {t.tradingName || t.name}
                            {t.isMasterAccount && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                · Matriz
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                            NIF: {t.nif} · {t.city}, {t.province}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[hsl(var(--foreground))]">
                        {t.responsibleName}
                      </div>
                      <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {t.phone} · {t.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-[hsl(var(--foreground))] capitalize">
                        {t.servicesSupported === 'tv'
                          ? 'TV a Cabo'
                          : t.servicesSupported === 'fibra'
                          ? 'Internet Fibra'
                          : 'TV + Fibra'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[hsl(var(--foreground))]">
                        {plan?.name || 'Plano Pro'}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-mono font-semibold">
                        {formatKz(plan?.monthlyPrice || 48000)}/mês
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-[hsl(var(--foreground))] flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            t.subscriptionStatus === 'ativo'
                              ? 'bg-emerald-500'
                              : t.subscriptionStatus === 'trial'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="capitalize">
                          {t.subscriptionStatus === 'trial'
                            ? 'Demonstração (14d)'
                            : t.subscriptionStatus}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] font-medium text-[hsl(var(--foreground))]">
                        {t.nextBillingDate
                          ? new Date(t.nextBillingDate).toLocaleDateString('pt-AO')
                          : '—'}
                      </div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        Ref: {t.referenceCode || 'MCX-000000'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyLicenseKey(t)}
                          title="Copiar Chave de Licença do Software"
                          className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition"
                        >
                          {copiedKey === t.id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <KeyRound size={14} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEnterClientEnvironment(t)}
                          title="Aceder ao ambiente da empresa para suporte"
                          className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition"
                        >
                          <span>Entrar</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Recente de Pagamentos de Licenças */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[hsl(var(--border))] pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-[hsl(var(--foreground))]">
              Registo de Faturação de Software
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Mensalidades e licenças recebidas das operadoras parceiras.
            </p>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
            {payments.length} recibos emitidos
          </span>
        </div>

        <div className="divide-y divide-[hsl(var(--border))]">
          {payments.map((p) => (
            <div
              key={p.id}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-bold text-[hsl(var(--foreground))]">{p.tenantName}</span>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {p.planName} · Ref: {p.reference} · {p.paymentMethod}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-emerald-600 font-mono">{formatKz(p.amount)}</span>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {new Date(p.paidAt).toLocaleDateString('pt-AO')}
                </span>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-mono">
                  {p.invoiceNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Emitir Nova Licença de Software */}
      {isNewLicenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl animate-in fade-in-50 my-8">
            <div className="border-b border-[hsl(var(--border))] pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-[hsl(var(--foreground))]">
                Emitir Nova Licença de Software
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Registo de nova operadora parceira para fornecimento do Gestão X.
              </p>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Nome Oficial da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex.: BENGUELA FIBRA & CABO LDA"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Nome Comercial / Marca</label>
                  <input
                    type="text"
                    placeholder="Ex.: Benguela Net"
                    value={newTradingName}
                    onChange={(e) => setNewTradingName(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">NIF da Empresa</label>
                  <input
                    type="text"
                    placeholder="Ex.: 5402918401"
                    value={newNif}
                    onChange={(e) => setNewNif(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Telefone Principal *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex.: 923 000 111"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Email da Empresa</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.ao"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Província</label>
                  <select
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 outline-none focus:border-[hsl(var(--primary))]"
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huíla">Huíla</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Outra">Outra Província</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Cidade / Município</label>
                  <input
                    type="text"
                    placeholder="Ex.: Lobito / Benguela"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Modalidade Contratada</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 outline-none focus:border-[hsl(var(--primary))]"
                  >
                    <option value="tv">TV a Cabo Comunitária</option>
                    <option value="fibra">Internet Banda Larga / Fibra</option>
                    <option value="combo">Combo TV + Fibra</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Plano da Licença</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 outline-none focus:border-[hsl(var(--primary))]"
                  >
                    <option value="start">Plano Start (25.000 Kz/mês)</option>
                    <option value="pro">Plano Pro (48.000 Kz/mês)</option>
                    <option value="enterprise">Plano Enterprise (95.000 Kz/mês)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Nome do Gestor Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex.: Engenheiro João Silva"
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsNewLicenseOpen(false)}
                  className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 font-bold text-[hsl(var(--primary-foreground))] shadow-xs hover:brightness-110 transition"
                >
                  Activar Licença
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
