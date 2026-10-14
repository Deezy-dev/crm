import { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  PieChart,
  Printer,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  useListClients,
  useListPayments,
  useListExpenses,
  useListServiceOrders,
  useListUsers,
  useGetSettings,
  useGetReports,
  session,
} from '@/lib/local-api';
import {
  Button,
  Field,
  Input,
  Select,
  Badge,
  Modal,
  PageHeader,
  kz,
  date,
  dateTime,
  serviceLabel,
} from '@/components/shared-ui';
import { MonthlyClosuresView } from '@/components/monthly-closures-view';
import { useServiceMode } from '@/lib/service-mode';

export function ReportsAdvancedPage() {
  const { mode, meta } = useServiceMode();
  const currentSession = session();
  const isAdmin = currentSession?.role === 'admin';

  // Navigation tabs for report perspectives
  const [reportTab, setReportTab] = useState<'financeiro' | 'fechos_mensais' | 'clientes' | 'pdos' | 'operadores' | 'tecnico'>('financeiro');

  // Date filters
  const now = new Date();
  const [periodPreset, setPeriodPreset] = useState<'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom'>('mes');
  const [customStart, setCustomStart] = useState(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [customEnd, setCustomEnd] = useState(() => now.toISOString().slice(0, 10));

  // Secondary filters
  const [filterService, setFilterService] = useState('todos');
  const [filterMethod, setFilterMethod] = useState('todos');
  const [filterOperator, setFilterOperator] = useState('todos');

  // Modal for official printing
  const [modalPrint, setModalPrint] = useState(false);

  // Queries
  const clientsQuery = useListClients({ serviceMode: mode || undefined });
  const paymentsQuery = useListPayments({ serviceMode: mode || undefined });
  const expensesQuery = useListExpenses();
  const serviceOrdersQuery = useListServiceOrders({ serviceMode: mode || undefined });
  const usersQuery = useListUsers();
  const settingsQuery = useGetSettings();

  const clients: any[] = (Array.isArray(clientsQuery.data) ? clientsQuery.data : clientsQuery.data?.items) || [];
  const payments: any[] = (Array.isArray(paymentsQuery.data) ? paymentsQuery.data : paymentsQuery.data?.items) || [];
  const expenses: any[] = (Array.isArray(expensesQuery.data) ? expensesQuery.data : expensesQuery.data?.items) || [];
  const orders: any[] = (Array.isArray(serviceOrdersQuery.data) ? serviceOrdersQuery.data : serviceOrdersQuery.data?.items) || [];
  const users: any[] = usersQuery.data || [];
  const settings = settingsQuery.data || {};

  // Compute effective start and end dates
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const todayStr = now.toISOString().slice(0, 10);
    if (periodPreset === 'hoje') {
      return {
        startDate: todayStr,
        endDate: todayStr,
        periodLabel: `Diário — ${new Intl.DateTimeFormat('pt-AO', { dateStyle: 'full' }).format(now)}`,
      };
    }
    if (periodPreset === 'semana') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return {
        startDate: d.toISOString().slice(0, 10),
        endDate: todayStr,
        periodLabel: 'Semanal — Últimos 7 dias',
      };
    }
    if (periodPreset === 'mes') {
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return {
        startDate: monthStart,
        endDate: todayStr,
        periodLabel: `Mensal — ${new Intl.DateTimeFormat('pt-AO', { month: 'long', year: 'numeric' }).format(now)}`,
      };
    }
    if (periodPreset === 'trimestre') {
      const currentMonthNum = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonthNum / 3) * 3 + 1;
      const quarterStart = `${now.getFullYear()}-${String(quarterStartMonth).padStart(2, '0')}-01`;
      return {
        startDate: quarterStart,
        endDate: todayStr,
        periodLabel: `Trimestral — ${Math.floor(currentMonthNum / 3) + 1}º Trimestre de ${now.getFullYear()}`,
      };
    }
    if (periodPreset === 'ano') {
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: todayStr,
        periodLabel: `Exercício Fiscal de ${now.getFullYear()}`,
      };
    }
    return {
      startDate: customStart,
      endDate: customEnd,
      periodLabel: `Intervalo Customizado (${date(customStart)} até ${date(customEnd)})`,
    };
  }, [periodPreset, customStart, customEnd]);

  // Filtered Payments within date range
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const pDate = p.paidAt ? p.paidAt.slice(0, 10) : '';
      if (pDate < startDate || pDate > endDate) return false;
      if (filterMethod !== 'todos' && p.method !== filterMethod) return false;
      if (filterOperator !== 'todos') {
        const op = p.operator || p.createdByName || 'deezy';
        if (op !== filterOperator) return false;
      }
      if (filterService !== 'todos') {
        const client = clients.find((c) => c.id === p.clientId);
        if (client && client.serviceType !== filterService) return false;
      }
      return true;
    });
  }, [payments, startDate, endDate, filterMethod, filterOperator, filterService, clients]);

  // Filtered Expenses within date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const eDate = e.date ? e.date.slice(0, 10) : '';
      return eDate >= startDate && eDate <= endDate;
    });
  }, [expenses, startDate, endDate]);

  // Filtered Service Orders within date range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const oDate = o.createdAt ? o.createdAt.slice(0, 10) : o.scheduledDate || '';
      return oDate >= startDate && oDate <= endDate;
    });
  }, [orders, startDate, endDate]);

  // Financial aggregates
  const totalReceita = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0) + Number(p.penalty || 0), 0);
  }, [filteredPayments]);

  const totalDespesas = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredExpenses]);

  const saldoOperacional = totalReceita - totalDespesas;

  // Breakdown by payment method
  const methodBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    filteredPayments.forEach((p) => {
      const m = p.method || 'Multicaixa Express';
      const val = Number(p.amount || 0) + Number(p.penalty || 0);
      if (!map[m]) map[m] = { total: 0, count: 0 };
      map[m].total += val;
      map[m].count += 1;
    });
    return Object.entries(map).map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
      pct: totalReceita > 0 ? (data.total / totalReceita) * 100 : 0,
    }));
  }, [filteredPayments, totalReceita]);

  // Breakdown by operator
  const operatorBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    filteredPayments.forEach((p) => {
      const op = p.operator || p.createdByName || 'deezy';
      const val = Number(p.amount || 0) + Number(p.penalty || 0);
      if (!map[op]) map[op] = { total: 0, count: 0 };
      map[op].total += val;
      map[op].count += 1;
    });
    return Object.entries(map).map(([operator, data]) => ({
      operator,
      total: data.total,
      count: data.count,
      pct: totalReceita > 0 ? (data.total / totalReceita) * 100 : 0,
    }));
  }, [filteredPayments, totalReceita]);

  // PDO & Neighborhood breakdown
  const pdoBreakdown = useMemo(() => {
    const map: Record<string, { clients: number; paidSum: number; debtSum: number; active: number; late: number; suspended: number }> = {};
    clients.forEach((c) => {
      const pdo = c.pdoNumber || 'Sem PDO Definida';
      if (!map[pdo]) {
        map[pdo] = { clients: 0, paidSum: 0, debtSum: 0, active: 0, late: 0, suspended: 0 };
      }
      map[pdo].clients += 1;
      if (c.status === 'active') map[pdo].active += 1;
      else if (c.status === 'late') {
        map[pdo].late += 1;
        map[pdo].debtSum += Number(c.monthlyFee || 8500) + 1500;
      } else if (c.status === 'suspended') {
        map[pdo].suspended += 1;
        map[pdo].debtSum += Number(c.monthlyFee || 8500) * 2;
      }
    });

    filteredPayments.forEach((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      const pdo = client?.pdoNumber || 'Sem PDO Definida';
      if (map[pdo]) {
        map[pdo].paidSum += Number(p.amount || 0) + Number(p.penalty || 0);
      }
    });

    return Object.entries(map).map(([pdo, data]) => ({
      pdo,
      ...data,
    }));
  }, [clients, filteredPayments]);

  // Technical OS breakdown
  const techBreakdown = useMemo(() => {
    const counts = {
      instalacao: 0,
      corte: 0,
      religacao: 0,
      manutencao: 0,
      concluidas: 0,
      pendentes: 0,
    };
    filteredOrders.forEach((o) => {
      if (o.type === 'instalacao') counts.instalacao++;
      else if (o.type === 'corte') counts.corte++;
      else if (o.type === 'religacao') counts.religacao++;
      else if (o.type === 'manutencao') counts.manutencao++;

      if (o.status === 'completed' || o.status === 'concluida') counts.concluidas++;
      else counts.pendentes++;
    });
    return counts;
  }, [filteredOrders]);

  // CSV Export utility
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `RELATÓRIO OFICIAL OSDEL TECNOLOGIA\n`;
    csvContent += `Período: ${periodLabel}\n`;
    csvContent += `Gerado em: ${dateTime(new Date().toISOString())}\n\n`;

    csvContent += `Documento;Cliente;Data;Valor;Multa;Total;Metodo;Operador\n`;
    filteredPayments.forEach((p) => {
      const c = clients.find((x) => x.id === p.clientId);
      const doc = p.receiptNumber || `FT-${String(p.id).padStart(5, '0')}`;
      const total = Number(p.amount || 0) + Number(p.penalty || 0);
      csvContent += `${doc};"${c?.fullName || '—'}";${date(p.paidAt)};${p.amount};${p.penalty || 0};${total};"${p.method || 'MCX'}";"${p.operator || 'deezy'}"\n`;
    });

    csvContent += `\nRESUMO FINANCEIRO\n`;
    csvContent += `Receita Total;${totalReceita}\n`;
    csvContent += `Total Despesas;${totalDespesas}\n`;
    csvContent += `Saldo Operacional;${saldoOperacional}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OSDEL_Relatorio_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Auditoria & Finanças · Modo ${meta.shortName}`}
        title={`Relatórios & Business Intelligence (${meta.shortName})`}
        detail={`Auditoria executiva dos movimentos financeiros de ${meta.name}, índice de adimplência, desempenho de caixa por operador e métricas técnicas de campo.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download size={15} /> Exportar CSV
            </Button>
            <Button onClick={() => setModalPrint(true)}>
              <Printer size={15} /> Imprimir Relatório Oficial (PDF)
            </Button>
          </div>
        }
      />

      {/* Date Preset Selector Toolbar */}
      <div className="surface rounded-2xl p-4 border border-[hsl(var(--border))] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'hoje', label: 'Hoje (Diário)' },
            { id: 'semana', label: '7 Dias' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'trimestre', label: 'Trimestre' },
            { id: 'ano', label: 'Ano 2026' },
            { id: 'custom', label: 'Personalizado' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodPreset(p.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                periodPreset === p.id
                  ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
            >
              {p.label}
            </button>
          ))}

          {periodPreset === 'custom' && (
            <div className="flex items-center gap-2 pl-3">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <span className="text-xs text-slate-400">até</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="text-xs h-8 w-36"
          >
            <option value="todos">Todos Serviços</option>
            <option value="tv">TV por Cabo</option>
            <option value="internet">Internet Fibra</option>
            <option value="combo">Combo TV + Fibra</option>
          </Select>

          <Select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="text-xs h-8 w-44"
          >
            <option value="todos">Todos os Canais Pag.</option>
            <option value="Multicaixa Express">Multicaixa Express</option>
            <option value="Terminal TPA">Terminal TPA</option>
            <option value="Transferência Bancária (BAI/BFA)">Transf. Bancária</option>
            <option value="Numerário (Dinheiro)">Numerário</option>
          </Select>

          <Select
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value)}
            className="text-xs h-8 w-36"
          >
            <option value="todos">Todos Operadores</option>
            {users.map((u) => (
              <option key={u.id} value={u.username}>
                @{u.username}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Receita Arrecadada
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-900">{kz(totalReceita)}</p>
          <small className="mt-1 block text-xs text-slate-500">
            {filteredPayments.length} pagamentos processados
          </small>
        </div>

        <div className="surface rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a24e3a]">
              Despesas / Saídas
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-[#a24e3a]">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#a24e3a]">{kz(totalDespesas)}</p>
          <small className="mt-1 block text-xs text-slate-500">
            {filteredExpenses.length} saídas registradas
          </small>
        </div>

        <div className="surface rounded-xl p-5 border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
              Resultado Líquido
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
              <DollarSign size={16} />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-black ${
              saldoOperacional >= 0 ? 'text-[hsl(var(--primary))]' : 'text-[#a24e3a]'
            }`}
          >
            {kz(saldoOperacional)}
          </p>
          <small className="mt-1 block text-xs text-slate-500">
            Entradas deduzidas de custos
          </small>
        </div>

        <div className="surface rounded-xl p-5 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Ticket Médio Assinante
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {filteredPayments.length > 0 ? kz(Math.round(totalReceita / filteredPayments.length)) : '0 Kz'}
          </p>
          <small className="mt-1 block text-xs text-slate-500">
            Média por recibo emitido
          </small>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3 overflow-x-auto">
        <button
          onClick={() => setReportTab('financeiro')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            reportTab === 'financeiro'
              ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-slate-900'
          }`}
        >
          <DollarSign size={16} /> Extrato de Movimentos & Caixa
        </button>

        <button
          onClick={() => setReportTab('fechos_mensais')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            reportTab === 'fechos_mensais'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          <Calendar size={16} className={reportTab === 'fechos_mensais' ? 'text-white' : 'text-blue-600'} />
          <span>Fechos Mensais Oficiais</span>
        </button>

        <button
          onClick={() => setReportTab('pdos')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            reportTab === 'pdos'
              ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-slate-900'
          }`}
        >
          <MapPin size={16} /> Mapa por PDO & Inadimplência
        </button>

        <button
          onClick={() => setReportTab('operadores')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            reportTab === 'operadores'
              ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-slate-900'
          }`}
        >
          <UserCheck size={16} /> Produtividade de Operadores
        </button>

        <button
          onClick={() => setReportTab('tecnico')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            reportTab === 'tecnico'
              ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-slate-900'
          }`}
        >
          <Wrench size={16} /> Piquete Técnico & Ordens de Campo
        </button>
      </div>

      {/* TAB 1: FINANCEIRO & EXTRATO */}
      {reportTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Methods Breakdown Graphic Bar */}
          <div className="surface rounded-2xl p-5 border border-[hsl(var(--border))] space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Distribuição por Canal de Pagamento</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {methodBreakdown.map((m) => (
                <div key={m.method} className="rounded-xl border border-[hsl(var(--border))] p-3.5 bg-[hsl(var(--secondary)/.3)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{m.method}</span>
                    <Badge tone="good">{m.pct.toFixed(1)}%</Badge>
                  </div>
                  <b className="mt-2 block text-lg font-mono text-[hsl(var(--primary))]">{kz(m.total)}</b>
                  <span className="text-[11px] text-slate-500">{m.count} transacções</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Movements Table */}
          <div className="surface rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
            <div className="p-4 bg-[hsl(var(--secondary)/.3)] border-b border-[hsl(var(--border))] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Lista Detalhada de Pagamentos no Período</h4>
                <p className="text-xs text-slate-500">{periodLabel}</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                {filteredPayments.length} Registos Encontrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[hsl(var(--secondary)/.5)] text-xs uppercase font-bold text-slate-500 border-b border-[hsl(var(--border))]">
                  <tr>
                    <th className="p-3.5">Recibo / Doc.</th>
                    <th className="p-3.5">Assinante</th>
                    <th className="p-3.5">Data Pagamento</th>
                    <th className="p-3.5">Canal / Método</th>
                    <th className="p-3.5 text-right">Valor Base</th>
                    <th className="p-3.5 text-right">Multa</th>
                    <th className="p-3.5 text-right font-black">Total Pago</th>
                    <th className="p-3.5 text-center">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-500 text-sm">
                        Nenhum pagamento registrado dentro do período e filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const c = clients.find((x) => x.id === p.clientId);
                      const total = Number(p.amount || 0) + Number(p.penalty || 0);
                      return (
                        <tr key={p.id} className="hover:bg-[hsl(var(--secondary)/.2)] transition">
                          <td className="p-3.5 font-mono text-xs font-bold text-blue-900">
                            {p.receiptNumber || `FT-${String(p.id).padStart(5, '0')}`}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{c?.fullName || 'Cliente Removido'}</span>
                            <span className="text-[11px] text-slate-500">{c?.code} · Casa {c?.houseCode || 'S/N'}</span>
                          </td>
                          <td className="p-3.5 text-xs font-mono">{date(p.paidAt)}</td>
                          <td className="p-3.5 text-xs">
                            <Badge tone="neutral">{p.method || 'Multicaixa'}</Badge>
                          </td>
                          <td className="p-3.5 text-right font-mono text-xs">{kz(p.amount)}</td>
                          <td className="p-3.5 text-right font-mono text-xs text-[#a24e3a]">
                            {p.penalty ? kz(p.penalty) : '—'}
                          </td>
                          <td className="p-3.5 text-right font-black font-mono text-sm text-[hsl(var(--primary))]">
                            {kz(total)}
                          </td>
                          <td className="p-3.5 text-center font-mono text-xs text-slate-600">
                            @{p.operator || p.createdByName || 'deezy'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MAPA POR PDO & INADIMPLÊNCIA */}
      {reportTab === 'pdos' && (
        <div className="space-y-6">
          <div className="surface rounded-2xl p-5 border border-[hsl(var(--border))]">
            <h4 className="text-base font-bold text-slate-800">Mapa Geográfico de Inadimplência por Caixa PDO</h4>
            <p className="text-xs text-slate-500 mt-1">
              Indicador de cobrança e índice de risco por zona da rede óptica/cabo da OSDEL Tecnologia.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pdoBreakdown.map((item) => {
              const defaultRate = item.clients > 0 ? ((item.late + item.suspended) / item.clients) * 100 : 0;
              return (
                <div key={item.pdo} className="surface rounded-2xl p-5 border border-[hsl(var(--border))] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {item.pdo}
                    </span>
                    <Badge tone={defaultRate > 25 ? 'bad' : defaultRate > 10 ? 'warn' : 'good'}>
                      {defaultRate.toFixed(0)}% Inadimplente
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                    <div className="bg-slate-50 p-2 rounded-lg border">
                      <span className="text-slate-500 block text-[10px] uppercase">Assinantes</span>
                      <b className="text-sm font-black text-slate-900">{item.clients}</b>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <span className="text-emerald-700 block text-[10px] uppercase">Em Dia</span>
                      <b className="text-sm font-black text-emerald-800">{item.active}</b>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <span className="text-[#a24e3a] block text-[10px] uppercase">Em Falta</span>
                      <b className="text-sm font-black text-[#a24e3a]">{item.late + item.suspended}</b>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-xs flex justify-between">
                    <span className="text-slate-500">Dívida Pendente:</span>
                    <b className="font-mono text-red-700">{kz(item.debtSum)}</b>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-500">Receita no Período:</span>
                    <b className="font-mono text-emerald-700">{kz(item.paidSum)}</b>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUTIVIDADE DE OPERADORES */}
      {reportTab === 'operadores' && (
        <div className="space-y-6">
          <div className="surface rounded-2xl p-5 border border-[hsl(var(--border))]">
            <h4 className="text-base font-bold text-slate-800">Desempenho & Arrecadação por Operador</h4>
            <p className="text-xs text-slate-500 mt-1">
              Volume arrecadado, recibos gerados e integridade de caixa por membro da equipa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {operatorBreakdown.map((op) => (
              <div key={op.operator} className="surface rounded-2xl p-5 border border-[hsl(var(--border))] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--secondary))] font-mono font-bold text-lg text-[hsl(var(--primary))]">
                    {op.operator.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <b className="text-sm text-slate-900 block">@{op.operator}</b>
                    <span className="text-xs text-slate-500">Colaborador OSDEL</span>
                  </div>
                </div>

                <div className="p-3 bg-[hsl(var(--secondary)/.4)] rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume Total Cobrado:</span>
                    <b className="font-mono text-[hsl(var(--primary))] text-sm">{kz(op.total)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nº de Recibos Emitidos:</span>
                    <b className="font-mono text-slate-800">{op.count}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quota da Receita Global:</span>
                    <b className="font-mono text-emerald-700">{op.pct.toFixed(1)}%</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PIQUETE TÉCNICO & ORDENS */}
      {reportTab === 'tecnico' && (
        <div className="space-y-6">
          <div className="surface rounded-2xl p-5 border border-[hsl(var(--border))]">
            <h4 className="text-base font-bold text-slate-800">Relatório de Operações Técnicas & Campo</h4>
            <p className="text-xs text-slate-500 mt-1">
              Desempenho de instalações, desconexões (cortes) e religações do sinal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface rounded-xl p-4 border border-[hsl(var(--border))]">
              <span className="text-xs font-bold text-slate-500 uppercase">Instalações Novas</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{techBreakdown.instalacao}</p>
            </div>
            <div className="surface rounded-xl p-4 border border-[hsl(var(--border))]">
              <span className="text-xs font-bold text-red-700 uppercase">Cortes Executados</span>
              <p className="text-2xl font-black text-red-700 mt-2">{techBreakdown.corte}</p>
            </div>
            <div className="surface rounded-xl p-4 border border-[hsl(var(--border))]">
              <span className="text-xs font-bold text-emerald-700 uppercase">Religações Efectuadas</span>
              <p className="text-2xl font-black text-emerald-700 mt-2">{techBreakdown.religacao}</p>
            </div>
            <div className="surface rounded-xl p-4 border border-[hsl(var(--border))]">
              <span className="text-xs font-bold text-blue-700 uppercase">Manutenções de Linha</span>
              <p className="text-2xl font-black text-blue-700 mt-2">{techBreakdown.manutencao}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HISTÓRICO DE FECHOS MENSAIS OFICIAIS */}
      {reportTab === 'fechos_mensais' && (
        <MonthlyClosuresView
          isAdmin={isAdmin}
          currentUserName={currentSession?.name || currentSession?.username || 'Administrador'}
        />
      )}

      {/* MODAL: RELATÓRIO OFICIAL EM FORMATO A4 PARA IMPRESSÃO */}
      {modalPrint && (
        <Modal
          title="Relatório Oficial Consolidado"
          eyebrow="Impressão A4 Timbrada"
          onClose={() => setModalPrint(false)}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="outline" onClick={() => setModalPrint(false)}>
                Fechar
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={16} /> Imprimir Relatório
              </Button>
            </div>

            {/* Documento Timbrado */}
            <div className="p-8 border-2 border-[hsl(var(--border))] rounded-xl bg-white text-black space-y-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-black tracking-tight text-blue-950">
                    {settings.companyName || 'OSDEL TECNOLOGIA'}
                  </h2>
                  <p className="text-xs uppercase font-bold tracking-widest text-slate-500">
                    RELATÓRIO FINANCEIRO & AUDITORIA OPERACIONAL
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {settings.companyAddress || 'Luanda, Angola'} · NIF: {settings.companyNif || '5417283921'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded font-black text-xs uppercase">
                    {periodLabel}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Emitido por: @{currentSession?.username || 'admin'} em {dateTime(new Date().toISOString())}
                  </p>
                </div>
              </div>

              {/* Quadro Resumo */}
              <div className="grid grid-cols-3 gap-4 border border-slate-300 p-4 rounded-lg bg-slate-50">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Receita Bruta Total</span>
                  <b className="text-lg text-emerald-800 font-mono">{kz(totalReceita)}</b>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Despesas / Saídas</span>
                  <b className="text-lg text-red-800 font-mono">{kz(totalDespesas)}</b>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Saldo Operacional Líquido</span>
                  <b className="text-lg text-blue-900 font-mono">{kz(saldoOperacional)}</b>
                </div>
              </div>

              {/* Tabela de movimentos */}
              <table className="w-full text-xs text-left border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="p-2">Documento</th>
                    <th className="p-2">Assinante</th>
                    <th className="p-2">Data</th>
                    <th className="p-2">Forma Pag.</th>
                    <th className="p-2 text-right">Valor</th>
                    <th className="p-2 text-right">Multa</th>
                    <th className="p-2 text-right font-bold">Total</th>
                    <th className="p-2 text-center">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.slice(0, 35).map((p) => {
                    const c = clients.find((x) => x.id === p.clientId);
                    return (
                      <tr key={p.id}>
                        <td className="p-2 font-mono font-bold">{p.receiptNumber || `FT-${String(p.id).padStart(5, '0')}`}</td>
                        <td className="p-2">{c?.fullName || '—'}</td>
                        <td className="p-2 font-mono">{date(p.paidAt)}</td>
                        <td className="p-2">{p.method || 'MCX'}</td>
                        <td className="p-2 text-right font-mono">{kz(p.amount)}</td>
                        <td className="p-2 text-right font-mono">{p.penalty ? kz(p.penalty) : '0 Kz'}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          {kz(Number(p.amount || 0) + Number(p.penalty || 0))}
                        </td>
                        <td className="p-2 text-center font-mono text-slate-600">@{p.operator || 'deezy'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPayments.length > 35 && (
                <p className="text-[10px] text-slate-500 italic text-center">
                  Mostrando os primeiros 35 registos de um total de {filteredPayments.length} pagamentos.
                </p>
              )}

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-center">
                <div>
                  <div className="border-t border-slate-400 pt-2" />
                  <b className="block text-slate-800">Responsável Financeiro / Tesouraria</b>
                  <span className="text-[10px] text-slate-500">Conferido e homologado</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-2" />
                  <b className="block text-slate-800">Direcção Geral / Auditoria OSDEL</b>
                  <span className="text-[10px] text-slate-500">Visto para conformidade</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
