import React, { useState, useEffect } from 'react';
import {
  Tv,
  Wifi,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Camera,
  Bell,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Phone,
  Copy,
  Check,
  User,
  HelpCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { API_BASE_URL, APP_CONFIG } from './config/api';

// Formatting currency
const kz = (val: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace('AOA', 'Kz');

interface ClientData {
  id: number;
  code: string;
  name: string;
  phone: string;
  nif: string;
  address: string;
  pdoBox: string;
  serviceType: 'tv' | 'internet' | 'combo';
  planName: string;
  speed: string;
  channelsCount: number;
  monthlyFee: number;
  status: 'active' | 'late' | 'suspended';
  dueDay: number;
  balanceDue: number;
  contractNumber: string;
  contractStartDate: string;
}

interface PaymentRecord {
  id: string;
  reference: string;
  date: string;
  month: string;
  amount: number;
  method: string;
  status: 'pago' | 'processando';
  receiptUrl?: string;
}

interface PaymentAgreement {
  id: string;
  requestedDate: string;
  promisedDate: string;
  promisedAmount: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  operatorNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface SupportTicket {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  status: 'aberto' | 'tecnico_a_caminho' | 'resolvido';
  createdAt: string;
  assignedTechnician?: string;
}

interface Announcement {
  id: string;
  title: string;
  category: 'manutencao' | 'comunicado' | 'novidade' | 'urgente';
  date: string;
  content: string;
}

// Initial mock state stored locally so the app runs standalone seamlessly
const DEFAULT_CLIENT: ClientData = {
  id: 1,
  code: 'CLI-00042',
  name: 'António Domingos Pedro',
  phone: '+244 923 456 789',
  nif: '005489123LA041',
  address: 'Rua 12, Casa 45B, Bairro Golf I, Luanda',
  pdoBox: 'PDO-04 / Porta 08',
  serviceType: 'combo',
  planName: 'Plano OSDEL Família Max (TV + Fibra 20 Mbps)',
  speed: '20 Mbps Fibra Simétrica',
  channelsCount: 68,
  monthlyFee: 14500,
  status: 'active',
  dueDay: 5,
  balanceDue: 0,
  contractNumber: 'CTR-2024-00189',
  contractStartDate: '12/03/2024',
};

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    reference: 'MCX-9012481',
    date: '04/09/2026',
    month: 'Setembro / 2026',
    amount: 14500,
    method: 'Multicaixa Express',
    status: 'pago',
  },
  {
    id: 'pay-2',
    reference: 'MCX-8739102',
    date: '03/08/2026',
    month: 'Agosto / 2026',
    amount: 14500,
    method: 'Multicaixa Express',
    status: 'pago',
  },
  {
    id: 'pay-3',
    reference: 'TRF-0019284',
    date: '05/07/2026',
    month: 'Julho / 2026',
    amount: 14500,
    method: 'Transferência BAI Direto',
    status: 'pago',
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Manutenção de Rotina no Anel de Fibra - Bairro Golf I',
    category: 'manutencao',
    date: '14 de Setembro de 2026',
    content:
      'Informamos aos estimados clientes que na quinta-feira, entre 02h00 e 05h00 da madrugada, realizaremos manutenção preventiva no armário de distribuição central para ampliar a estabilidade do sinal. Agradecemos a compreensão.',
  },
  {
    id: 'ann-2',
    title: '4 Novos Canais HD Adicionados à Grelha de TV a Cabo!',
    category: 'novidade',
    date: '10 de Setembro de 2026',
    content:
      'A OSDEL adicionou novos canais desportivos e infantis sem qualquer custo adicional no seu pacote. Faça uma sintonização automática na sua TV para actualizar a lista de canais.',
  },
  {
    id: 'ann-3',
    title: 'Lembrete: Pagamento Regular das Mensalidades até ao dia 5',
    category: 'comunicado',
    date: '01 de Setembro de 2026',
    content:
      'Evite filas e suspensão automática do sinal pagando até ao dia 5 de cada mês através do Multicaixa Express com as referências indicadas na aba Pagamentos deste app.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'contrato' | 'pagamentos' | 'acordo' | 'suporte'>('inicio');
  const [client, setClient] = useState<ClientData>(DEFAULT_CLIENT);
  const [payments, setPayments] = useState<PaymentRecord[]>(DEFAULT_PAYMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);

  // Agreements state
  const [agreements, setAgreements] = useState<PaymentAgreement[]>(() => {
    const saved = localStorage.getItem('osdel_client_agreements');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'agr-1',
            requestedDate: '2026-08-04',
            promisedDate: '2026-08-09',
            promisedAmount: 14500,
            reason: 'Aguardando processamento de salário pela entidade patronal.',
            status: 'aprovado',
            operatorNotes: 'Acordo confirmado pelo operador Albert. Sinal protegido contra corte até dia 09.',
            reviewedAt: '2026-08-04 11:20',
            reviewedBy: 'Albert (Operador OSDEL)',
          },
        ];
  });

  // Support Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('osdel_client_tickets');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tkt-1',
            code: 'TCK-2024-81',
            category: 'sem_sinal_tv',
            title: 'Televisão da sala com chuvisco',
            description: 'Alguns canais da TV principal apresentam falhas na imagem.',
            status: 'resolvido',
            createdAt: '28/08/2026',
            assignedTechnician: 'Mestre Job (Piquete Técnico)',
          },
        ];
  });

  // Forms
  const [promiseForm, setPromiseForm] = useState({
    promisedDate: '',
    promisedAmount: DEFAULT_CLIENT.monthlyFee,
    reason: '',
  });
  const [promiseSuccessMsg, setPromiseSuccessMsg] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    category: 'sem_sinal_tv',
    title: '',
    description: '',
  });
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('osdel_client_agreements', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('osdel_client_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreatePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promiseForm.promisedDate || !promiseForm.reason) return;

    const newAgreement: PaymentAgreement = {
      id: `agr-${Date.now()}`,
      requestedDate: new Date().toISOString().slice(0, 10),
      promisedDate: promiseForm.promisedDate,
      promisedAmount: Number(promiseForm.promisedAmount),
      reason: promiseForm.reason,
      status: 'pendente', // Wait for operator confirmation
    };

    setAgreements([newAgreement, ...agreements]);
    setPromiseForm({
      promisedDate: '',
      promisedAmount: client.monthlyFee,
      reason: '',
    });
    setPromiseSuccessMsg(true);
    setTimeout(() => setPromiseSuccessMsg(false), 5000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      code: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketForm.category,
      title: ticketForm.title,
      description: ticketForm.description,
      status: 'aberto',
      createdAt: new Date().toLocaleDateString('pt-AO'),
      assignedTechnician: 'Piquete de Turno',
    };

    setTickets([newTicket, ...tickets]);
    setTicketForm({
      category: 'sem_sinal_tv',
      title: '',
      description: '',
    });
    setTicketSuccessMsg(true);
    setTimeout(() => setTicketSuccessMsg(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 pb-20">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative border-x border-slate-200">
        {/* Top Header Bar */}
        <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 pt-4 pb-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-serif text-lg font-black border border-white/20">
                O
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wide leading-tight">OSDEL TECNOLOGIA</h1>
                <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Portal do Cliente</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sinal Activo
              </span>
            </div>
          </div>

          {/* Quick Client Summary Banner */}
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-between border border-white/15">
            <div>
              <p className="text-[11px] text-blue-200">Bem-vindo(a),</p>
              <p className="text-xs font-bold text-white truncate max-w-[220px]">{client.name}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-blue-700/80 px-2 py-0.5 rounded text-white font-mono font-bold">
                {client.code}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: INÍCIO / RESUMO */}
          {activeTab === 'inicio' && (
            <div className="space-y-4">
              {/* Payment Status Alert Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Estado da Mensalidade</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Mensalidade em Dia</h3>
                    <p className="text-xs text-slate-600 mt-1">Próximo vencimento: <b>Dia {client.dueDay} de Outubro</b></p>
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle2 size={22} />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500">Valor do Pacote:</p>
                    <p className="text-sm font-extrabold text-blue-900">{kz(client.monthlyFee)}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('pagamentos')}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                  >
                    <CreditCard size={14} /> Pagar Agora
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serviços Rápidos</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setActiveTab('acordo')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Evitar Corte de Sinal</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pedir acordo / promessa</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('suporte')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Relatar Avaria</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Sem sinal ou cabo partido</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('contrato')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Meu Contrato</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Detalhes e dados da fibra</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pagamentos')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-left shadow-sm transition flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Histórico de Facturas</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Recibos e pagamentos</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Active Package Features */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Tv className="text-blue-700" size={18} />
                    <span className="text-xs font-bold text-slate-800">TV por Cabo Comunitária</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700">{client.channelsCount} Canais HD</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="text-indigo-700" size={18} />
                    <span className="text-xs font-bold text-slate-800">Internet Banda Larga</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700">{client.speed}</span>
                </div>
              </div>

              {/* Company Announcements / News Feed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notícias & Comunicados</p>
                  <span className="text-[10px] text-blue-700 font-bold">OSDEL Informa</span>
                </div>
                <div className="space-y-2.5">
                  {announcements.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold px-2 py-0.5 rounded uppercase ${
                            item.category === 'manutencao'
                              ? 'bg-amber-100 text-amber-800'
                              : item.category === 'novidade'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-slate-400">{item.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEU CONTRATO */}
          {activeTab === 'contrato' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contrato Registado</span>
                    <h3 className="text-sm font-extrabold text-blue-900">{client.contractNumber}</h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Activo & Válido
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px]">Titular:</p>
                    <p className="font-bold text-slate-800">{client.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">NIF:</p>
                    <p className="font-bold text-slate-800">{client.nif}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Telefone:</p>
                    <p className="font-bold text-slate-800">{client.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Data de Início:</p>
                    <p className="font-bold text-slate-800">{client.contractStartDate}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-400 text-[10px]">Morada de Instalação:</p>
                  <p className="text-xs font-bold text-slate-800">{client.address}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-[10px]">Caixa PDO de Fibra:</p>
                    <p className="text-xs font-bold text-indigo-700">{client.pdoBox}</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">Cabo Drop OK</span>
                </div>
              </div>

              {/* Package Specs */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Especificações do Plano</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Designação:</span>
                    <span className="font-bold text-slate-900">{client.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Velocidade de Internet:</span>
                    <span className="font-bold text-slate-900">{client.speed}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Grelha TV Comunitária:</span>
                    <span className="font-bold text-slate-900">{client.channelsCount} Canais</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Mensalidade Fixa:</span>
                    <span className="font-extrabold text-blue-900">{kz(client.monthlyFee)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAGAMENTOS & MULTICAIXA EXPRESS */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-4">
              {/* Payment Details Card (Multicaixa Express) */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Dados Oficiais de Pagamento
                  </span>
                  <span className="bg-blue-600/60 px-2 py-0.5 rounded text-[10px] font-mono">MCX Express</span>
                </div>

                <div className="bg-white/10 rounded-xl p-3 space-y-2 border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-200">Entidade:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold">00421 (OSDEL)</span>
                      <button
                        onClick={() => handleCopy('00421', 'ent')}
                        className="text-blue-300 hover:text-white"
                      >
                        {copiedKey === 'ent' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-200">Referência do Cliente:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold">901 248 100</span>
                      <button
                        onClick={() => handleCopy('901248100', 'ref')}
                        className="text-blue-300 hover:text-white"
                      >
                        {copiedKey === 'ref' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-200">Montante Regular:</span>
                    <span className="font-mono font-extrabold text-emerald-300">{kz(client.monthlyFee)}</span>
                  </div>
                </div>

                {/* Bank Transfer (BAI & BFA) */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                  <p className="text-[10px] text-blue-300 font-bold uppercase">Coordenadas Bancárias da Empresa:</p>
                  <div className="bg-black/30 rounded-lg p-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[11px]">Banco BAI (Kwanza)</p>
                      <p className="font-mono text-[10px] text-slate-300">AO06.0040.0000.1829.1029.1012.4</p>
                    </div>
                    <button
                      onClick={() => handleCopy('AO06004000001829102910124', 'bai')}
                      className="p-1.5 hover:bg-white/10 rounded"
                    >
                      {copiedKey === 'bai' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment History List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Mensalidades</h4>
                {payments.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{p.month}</p>
                      <p className="text-[10px] text-slate-500">Ref: {p.reference} · {p.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-700">{kz(p.amount)}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                        <CheckCircle2 size={12} /> Confirmado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACORDO DE PAGAMENTO (EVITAR CORTE) */}
          {activeTab === 'acordo' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldCheck size={20} />
                  <h3 className="text-xs font-extrabold">Protecção Contra Corte de Sinal</h3>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Não vai conseguir pagar a mensalidade até ao dia 5? Faça um acordo informando a data em que terá o valor disponível.
                  <b> Se o operador da OSDEL confirmar, o seu sinal permanecerá ligado sem corte.</b>
                </p>
              </div>

              {/* Existing Agreements */}
              {agreements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Os Seus Acordos Registados</p>
                  {agreements.map((agr) => (
                    <div
                      key={agr.id}
                      className={`rounded-xl p-3.5 border text-xs space-y-2 ${
                        agr.status === 'aprovado'
                          ? 'bg-emerald-50 border-emerald-300'
                          : agr.status === 'pendente'
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-rose-50 border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold">Data Prometida: {agr.promisedDate}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            agr.status === 'aprovado'
                              ? 'bg-emerald-200 text-emerald-800'
                              : agr.status === 'pendente'
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-rose-200 text-rose-800'
                          }`}
                        >
                          {agr.status === 'aprovado'
                            ? 'Acordo Confirmado ✓'
                            : agr.status === 'pendente'
                            ? 'Em Análise pelo Operador'
                            : 'Recusado'}
                        </span>
                      </div>

                      <p className="text-slate-700 text-xs">
                        <b>Motivo:</b> {agr.reason}
                      </p>

                      {agr.operatorNotes && (
                        <div className="p-2 bg-white/80 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                          <b>Mensagem da Empresa:</b> {agr.operatorNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Request New Agreement Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Solicitar Novo Acordo de Pagamento</h4>

                {promiseSuccessMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Solicitação enviada! Aguarde a confirmação do operador.
                  </div>
                )}

                <form onSubmit={handleCreatePromise} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Data em que promete pagar: *
                    </label>
                    <input
                      required
                      type="date"
                      value={promiseForm.promisedDate}
                      onChange={(e) => setPromiseForm({ ...promiseForm, promisedDate: e.target.value })}
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor da Mensalidade (Kz):</label>
                    <input
                      type="number"
                      value={promiseForm.promisedAmount}
                      onChange={(e) => setPromiseForm({ ...promiseForm, promisedAmount: Number(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Motivo do atraso / Justificativa: *</label>
                    <textarea
                      required
                      rows={3}
                      value={promiseForm.reason}
                      onChange={(e) => setPromiseForm({ ...promiseForm, reason: e.target.value })}
                      placeholder="Ex.: O salário da minha empresa só será creditado no dia 10..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Enviar Pedido de Acordo
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SUPORTE / RELATAR AVARIA */}
          {activeTab === 'suporte' && (
            <div className="space-y-4">
              {/* Existing Tickets */}
              {tickets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seus Chamados Anteriores</p>
                  {tickets.map((t) => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{t.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'resolvido'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status === 'resolvido' ? 'Resolvido ✓' : 'Técnico a Caminho'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{t.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t">
                        <span>Aberto em: {t.createdAt}</span>
                        <span>{t.assignedTechnician}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Ticket Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Relatar Novo Problema / Chamado</h4>

                {ticketSuccessMsg && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Chamado aberto! A nossa equipa de piquete já foi notificada.
                  </div>
                )}

                <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Problema:</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="sem_sinal_tv">TV sem sinal / Chuvisco na imagem</option>
                      <option value="sem_internet">Internet sem sinal (Luz PON vermelha na ONU)</option>
                      <option value="cabo_partido">Cabo drop rompido / Caído na rua</option>
                      <option value="caixa_pdo">Problema na Caixa PDO do poste</option>
                      <option value="mudanca">Mudança de cômodo / Ponto adicional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Título do Problema: *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex.: Sem sinal na TV da sala desde as 10h"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Detalhes da Situação: *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Descreva o que acontece (ex.: cabos parecem firmes, luz pisca...)"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  {/* Photo Attachment Prompt */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center space-y-1 bg-slate-50 cursor-pointer">
                    <Camera className="mx-auto text-slate-400" size={20} />
                    <p className="text-[11px] font-bold text-slate-700">Tirar foto ou anexar imagem da avaria</p>
                    <p className="text-[10px] text-slate-400">Ajuda o piquete técnico a levar o material certo</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> Enviar Chamado Técnico
                  </button>
                </form>
              </div>

              {/* Direct Emergency Contact */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">Linha de Apoio Directo</p>
                  <p className="text-slate-500 text-[10px]">{APP_CONFIG.officeHours}</p>
                </div>
                <a
                  href={`tel:${APP_CONFIG.supportPhone.replace(/\s/g, '')}`}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Phone size={14} /> Ligar
                </a>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Mobile Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center z-30 shadow-lg">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'inicio' ? 'text-blue-900' : 'text-slate-400'
            }`}
          >
            <Tv size={18} />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveTab('contrato')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'contrato' ? 'text-blue-900' : 'text-slate-400'
            }`}
          >
            <FileText size={18} />
            <span>Contrato</span>
          </button>

          <button
            onClick={() => setActiveTab('pagamentos')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'pagamentos' ? 'text-blue-900' : 'text-slate-400'
            }`}
          >
            <CreditCard size={18} />
            <span>Pagar</span>
          </button>

          <button
            onClick={() => setActiveTab('acordo')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'acordo' ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            <ShieldCheck size={18} />
            <span>Acordo</span>
          </button>

          <button
            onClick={() => setActiveTab('suporte')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'suporte' ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            <AlertTriangle size={18} />
            <span>Avarias</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
