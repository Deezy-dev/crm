import { useState, useEffect } from 'react';
import {
  Wifi,
  Tv,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Camera,
  FileText,
  CreditCard,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Bell,
  Copy,
  Check,
  Activity,
  QrCode,
  ArrowLeft,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import {
  type PaymentPromise,
  type SupportTicket,
  type CompanyAnnouncement,
  getStoredPromises,
  savePromises,
  requestPaymentPromise,
  getStoredTickets,
  createSupportTicket,
  getStoredAnnouncements,
} from '@/lib/client-portal';
import { useListClients, useListPayments, useListClientContracts } from '@/lib/local-api';
import { Link } from 'wouter';

const kz = (value: unknown) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace('AOA', 'Kz');

export function ClientMobileApp() {
  const clientsQuery = useListClients();
  const allClients = clientsQuery.data?.items || [];

  // Active client selector for demo testing
  const [selectedClientId, setSelectedClientId] = useState<number>(() => {
    return allClients[0]?.id || 1;
  });

  const activeClient = allClients.find((c: any) => c.id === Number(selectedClientId)) || allClients[0] || {
    id: 1,
    code: 'CLI-00001',
    fullName: 'António Domingos Pedro',
    phone: '+244 923 456 789',
    address: 'Rua 12, Casa 45B, Bairro Golf I',
    serviceType: 'tv',
    status: 'late',
    pdoNumber: 'PDO-04',
  };

  const contractsQuery = useListClientContracts(activeClient.id);
  const contracts = contractsQuery.data || [];
  const activeContract = contracts[0] || {
    id: 101,
    planName: activeClient.serviceType === 'tv' ? 'TV por Cabo Comunitária' : 'Internet Fibra 22 Mbps',
    planSpeed: activeClient.serviceType === 'tv' ? '45 Canais Digitais' : '22 Mbps Ilimitado',
    monthlyPrice: activeClient.serviceType === 'tv' ? 4000 : 13000,
    dueDay: 5,
    status: 'active',
  };

  const paymentsQuery = useListPayments();
  const clientPayments = (paymentsQuery.data?.items || []).filter(
    (p: any) => p.clientId === activeClient.id,
  );

  // Tabs
  const [activeTab, setActiveTab] = useState<'inicio' | 'contrato' | 'avarias' | 'noticias' | 'diagnostico'>('inicio');
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Modals
  const [modalPromise, setModalPromise] = useState(false);
  const [modalTicket, setModalTicket] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Lists from client portal
  const [promises, setPromises] = useState<PaymentPromise[]>(() => getStoredPromises());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => getStoredTickets());
  const announcements = getStoredAnnouncements();

  // Listen to updates from operator
  useEffect(() => {
    const handlePromiseUpdate = () => setPromises(getStoredPromises());
    const handleTicketUpdate = () => setTickets(getStoredTickets());
    window.addEventListener('osdel-promises-updated', handlePromiseUpdate);
    window.addEventListener('osdel-tickets-updated', handleTicketUpdate);
    return () => {
      window.removeEventListener('osdel-promises-updated', handlePromiseUpdate);
      window.removeEventListener('osdel-tickets-updated', handleTicketUpdate);
    };
  }, []);

  // Client's specific promises & tickets
  const myPromises = promises.filter((p) => p.clientId === activeClient.id);
  const activeApprovedPromise = myPromises.find((p) => p.status === 'aprovado');
  const myTickets = tickets.filter((t) => t.clientId === activeClient.id);

  // Promise form
  const [promiseForm, setPromiseForm] = useState({
    promisedDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    promisedAmount: activeContract.monthlyPrice || 4000,
    reason: 'Aguardando liquidação salarial até ao fim da semana.',
  });

  // Ticket form
  const [ticketForm, setTicketForm] = useState({
    category: 'sem_sinal_tv' as SupportTicket['category'],
    title: '',
    description: '',
    photoUrl: '',
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleRequestPromise = (e: React.FormEvent) => {
    e.preventDefault();
    requestPaymentPromise({
      clientId: activeClient.id,
      clientName: activeClient.fullName,
      clientCode: activeClient.code,
      phone: activeClient.phone,
      serviceType: activeClient.serviceType as any,
      promisedDate: promiseForm.promisedDate,
      promisedAmount: Number(promiseForm.promisedAmount),
      reason: promiseForm.reason,
    });
    setPromises(getStoredPromises());
    setModalPromise(false);
    alert('Pedido de Acordo de Pagamento enviado ao operador com sucesso! O seu pedido será analisado em breve.');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) return;

    createSupportTicket({
      clientId: activeClient.id,
      clientName: activeClient.fullName,
      phone: activeClient.phone,
      address: activeClient.address,
      category: ticketForm.category,
      title: ticketForm.title,
      description: ticketForm.description,
      photoUrl: ticketForm.photoUrl || undefined,
      priority: 'normal',
    });
    setTickets(getStoredTickets());
    setModalTicket(false);
    setTicketForm({ category: 'sem_sinal_tv', title: '', description: '', photoUrl: '' });
    alert('Avaria reportada com sucesso! A equipa técnica foi notificada.');
  };

  // Mock speed test / optical signal
  const [testingSignal, setTestingSignal] = useState(false);
  const [signalResult, setSignalResult] = useState<{
    dbm: number;
    ping: number;
    download: number;
    status: string;
  } | null>(null);

  const runSignalTest = () => {
    setTestingSignal(true);
    setTimeout(() => {
      setTestingSignal(false);
      setSignalResult({
        dbm: -19.4,
        ping: 14,
        download: 21.8,
        status: 'Excelente (Potência Óptica Nominal)',
      });
    }, 1800);
  };

  return (
    <div className={`min-h-screen ${fullscreenMode ? 'bg-slate-950 p-0' : 'p-4 md:p-8 bg-slate-100 flex flex-col items-center'}`}>
      {/* Top Controls Bar (Only visible outside or top of emulator) */}
      {!fullscreenMode && (
        <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white font-serif text-lg font-bold">
              C
            </div>
            <div>
              <b className="text-sm font-extrabold text-slate-900 block">
                Aplicativo Mobile do Cliente (OSDEL Cliente)
              </b>
              <span className="text-xs text-slate-500">
                Visualizador interactivo de smartphone com alternador de clientes para demonstração
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">Simular Cliente:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs font-semibold"
              >
                {allClients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.serviceType === 'tv' ? 'TV Cabo' : 'Fibra'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFullscreenMode(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Maximize2 size={13} /> Tela Cheia Móvel
            </button>
            <Link
              href="/mobile"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-black"
            >
              Hub Mobile <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* SMARTPHONE FRAME CONTAINER */}
      <div
        className={`relative ${
          fullscreenMode
            ? 'w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between'
            : 'w-full max-w-[395px] h-[830px] rounded-[48px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden flex flex-col'
        }`}
      >
        {/* Smartphone Dynamic Island / Notch & Status Bar */}
        <div className="relative shrink-0 bg-slate-900 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-white select-none">
          <span>09:41</span>
          {/* Dynamic Island Pill */}
          <div className="h-4 w-24 rounded-full bg-black mx-auto" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <Wifi size={12} />
            <span>4G</span>
            <div className="h-2.5 w-5 rounded-sm border border-white p-0.5">
              <div className="h-full w-3/4 bg-white rounded-2xs" />
            </div>
          </div>
          {fullscreenMode && (
            <button
              onClick={() => setFullscreenMode(false)}
              className="absolute right-4 top-3 text-slate-400 hover:text-white"
            >
              <Minimize2 size={14} />
            </button>
          )}
        </div>

        {/* MOBILE APP HEADER */}
        <header className="shrink-0 bg-blue-700 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 font-serif text-sm font-black">
                O
              </div>
              <div>
                <b className="text-xs tracking-wider uppercase opacity-90 block">OSDEL TECNOLOGIA</b>
                <span className="text-[10px] text-blue-200">Portal do Cliente</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-mono font-bold">
                {activeClient.code}
              </span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE SCREEN CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 p-4 space-y-4">
          {/* TAB 1: INÍCIO / RESUMO */}
          {activeTab === 'inicio' && (
            <div className="space-y-3.5">
              {/* Client Welcome Card */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
                      Titular do Contrato
                    </span>
                    <h2 className="text-base font-extrabold leading-tight">{activeClient.fullName}</h2>
                    <p className="text-[11px] text-blue-200 mt-0.5">{activeClient.address}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      activeClient.status === 'active'
                        ? 'bg-emerald-400 text-emerald-950'
                        : activeClient.status === 'late'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-red-400 text-red-950'
                    }`}
                  >
                    {activeClient.status === 'active'
                      ? 'Sinal Activo'
                      : activeClient.status === 'late'
                      ? 'Em Atraso'
                      : 'Suspenso'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[11px]">
                  <div>
                    <span className="text-blue-200 text-[10px] block">Serviço Contratado:</span>
                    <b className="font-bold">{activeContract.planName}</b>
                  </div>
                  <div>
                    <span className="text-blue-200 text-[10px] block">Caixa de Ligação:</span>
                    <b className="font-mono">{activeClient.pdoNumber || 'PDO-04'}</b>
                  </div>
                </div>
              </div>

              {/* PAYMENT ALERT / NOTICE STRIP */}
              {activeClient.status !== 'active' ? (
                <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <b className="text-xs font-black text-red-900 block">
                        AVISO DE PAGAMENTO PENDENTE
                      </b>
                      <p className="text-[11px] text-red-800 leading-snug">
                        A sua mensalidade de <b>{kz(activeContract.monthlyPrice)}</b> encontra-se vencida. Evite o corte técnico do sinal pelo piquete da sua rua.
                      </p>
                    </div>
                  </div>

                  {/* Multicaixa Express payment box */}
                  <div className="rounded-xl bg-white p-3 border border-red-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                      <span>Pagamento por Multicaixa Express</span>
                      <CreditCard size={13} className="text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Entidade:</span>
                      <b className="font-mono text-slate-900">00142 (OSDEL)</b>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Referência:</span>
                      <div className="flex items-center gap-1">
                        <b className="font-mono text-slate-900">{activeClient.phone.replace(/[^0-9]/g, '').slice(-9)}</b>
                        <button
                          onClick={() => handleCopy(activeClient.phone.replace(/[^0-9]/g, '').slice(-9), 'ref')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copiar referência"
                        >
                          {copiedField === 'ref' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Montante:</span>
                      <b className="font-bold text-red-700">{kz(activeContract.monthlyPrice)}</b>
                    </div>
                  </div>

                  {/* PROMISE / ACORDO BUTTON */}
                  {activeApprovedPromise ? (
                    <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-2.5 text-emerald-900 text-xs flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                      <div>
                        <b>Acordo de Pagamento Activo!</b>
                        <p className="text-[10px] text-emerald-800">
                          Sinal protegido contra corte até dia <b>{activeApprovedPromise.promisedDate}</b>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalPromise(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-slate-950 px-3 py-2 text-xs font-extrabold hover:bg-amber-400 transition shadow-sm"
                    >
                      <ShieldCheck size={14} /> Fazer Acordo para Não Sofrer Corte
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                    <div>
                      <b>Serviço Regularizado</b>
                      <p className="text-[10px] text-emerald-700">Mensalidade liquidada. Próximo vencimento no dia 5.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">OK</span>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setModalTicket(true)}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-400 transition shadow-xs flex flex-col justify-between h-24"
                >
                  <div className="h-7 w-7 rounded-lg bg-red-100 text-red-600 grid place-items-center">
                    <AlertCircle size={15} />
                  </div>
                  <div>
                    <b className="text-slate-900 block font-bold text-xs">Relatar Avaria</b>
                    <span className="text-[10px] text-slate-400">Sem sinal ou cabo partido</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('diagnostico')}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-400 transition shadow-xs flex flex-col justify-between h-24"
                >
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-600 grid place-items-center">
                    <Activity size={15} />
                  </div>
                  <div>
                    <b className="text-slate-900 block font-bold text-xs">Diagnóstico de Linha</b>
                    <span className="text-[10px] text-slate-400">Verificar atenuação dBm</span>
                  </div>
                </button>
              </div>

              {/* Company Announcements Feed */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <b className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell size={13} className="text-blue-600" /> Notícias da OSDEL
                  </b>
                  <span className="text-[10px] text-blue-600 font-bold">Oficial</span>
                </div>

                <div className="space-y-2">
                  {announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <b className="text-slate-900 block font-bold text-[11px] leading-tight">
                        {ann.title}
                      </b>
                      <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <span className="text-[9px] text-slate-400 block">{ann.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRATO & FACTURAS */}
          {activeTab === 'contrato' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-600" /> Ficha do Contrato
                </h3>
                <div className="space-y-2 border-t border-slate-100 pt-2 text-[11px]">
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Plano:</span>
                    <b className="text-slate-900">{activeContract.planName}</b>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Valor Mensal:</span>
                    <b className="font-bold text-slate-900">{kz(activeContract.monthlyPrice)}</b>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Dia de Pagamento:</span>
                    <b className="text-slate-900">Dia 5 de cada mês</b>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Caixa PDO:</span>
                    <b className="font-mono text-slate-900">{activeClient.pdoNumber || 'PDO-04'}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Morada de Instalação:</span>
                    <b className="text-right text-slate-900">{activeClient.address}</b>
                  </div>
                </div>
              </div>

              {/* Invoices and Payments History */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-emerald-600" /> Histórico de Pagamentos
                </h3>

                {clientPayments.length > 0 ? (
                  <div className="space-y-2">
                    {clientPayments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                        <div>
                          <b className="text-slate-900 block">Mensalidade {p.paymentMonth}</b>
                          <span className="text-[10px] text-slate-400 capitalize">{p.method} · {p.reference || 'Ref MCX'}</span>
                        </div>
                        <div className="text-right">
                          <b className="font-bold text-emerald-700 block">{kz(p.amount)}</b>
                          <span className="text-[9px] text-emerald-600 font-bold">Liquidado ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-2">
                    Nenhum pagamento anterior registado na base.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AVARIAS & SUPORTE */}
          {activeTab === 'avarias' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold text-slate-800">Tickets de Assistência</b>
                <button
                  onClick={() => setModalTicket(true)}
                  className="rounded-lg bg-blue-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-blue-700"
                >
                  + Relatar Problema
                </button>
              </div>

              {myTickets.length > 0 ? (
                <div className="space-y-2">
                  {myTickets.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">{t.ticketCode}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            t.status === 'resolvido'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'tecnico_a_caminho'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status === 'tecnico_a_caminho' ? 'Técnico a Caminho' : t.status}
                        </span>
                      </div>
                      <b className="text-xs text-slate-900 block">{t.title}</b>
                      <p className="text-[11px] text-slate-600">{t.description}</p>
                      {t.assignedTechnician && (
                        <span className="text-[10px] text-blue-700 font-medium block">
                          Técnico atribuído: <b>{t.assignedTechnician}</b>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs">Não possui avarias pendentes.</p>
                </div>
              )}

              {/* Direct Support Contact */}
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3 text-xs space-y-2">
                <b className="text-blue-900 font-bold block">Linha Directa de Apoio OSDEL</b>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">WhatsApp Técnico:</span>
                  <b className="font-mono text-blue-800">+244 923 456 789</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Piquete de Emergência:</span>
                  <b className="font-mono text-blue-800">945 882 103</b>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTÍCIAS & AVISOS */}
          {activeTab === 'noticias' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase text-slate-500">Comunicados da Empresa</h3>
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div key={ann.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800">
                      {ann.category}
                    </span>
                    <b className="text-xs text-slate-900 block leading-snug">{ann.title}</b>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ann.content}</p>
                    <span className="text-[9px] text-slate-400 block pt-1">{ann.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DIAGNÓSTICO DE SINAL */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-3.5 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-600" /> Teste de Sinal & Conexão
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verifique os níveis de atenuação óptica (dBm) e qualidade de sinal recebido no seu terminal ou televisão.
                </p>

                <button
                  disabled={testingSignal}
                  onClick={runSignalTest}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white p-2.5 text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={testingSignal ? 'animate-spin' : ''} />
                  {testingSignal ? 'A medir atenuação e ping...' : 'Iniciar Diagnóstico da Linha'}
                </button>

                {signalResult && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2 text-[11px]">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Potência Óptica (RX):</span>
                      <b className="text-emerald-700 font-mono">{signalResult.dbm} dBm</b>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Latência / Ping:</span>
                      <b className="text-slate-900 font-mono">{signalResult.ping} ms</b>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Velocidade Medida:</span>
                      <b className="text-blue-700 font-mono">{signalResult.download} Mbps</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Diagnóstico:</span>
                      <b className="text-emerald-800">{signalResult.status}</b>
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Client Card */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Cartão Digital de Cliente</span>
                  <QrCode size={18} className="text-white" />
                </div>
                <div>
                  <b className="text-sm font-bold block">{activeClient.fullName}</b>
                  <span className="font-mono text-xs text-blue-300">{activeClient.code}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-slate-400">
                  <span>OSDEL TECNOLOGIA ANGOLA</span>
                  <span>CLIENTE VÁLIDO</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION TABS */}
        <nav className="shrink-0 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'inicio' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <Tv size={18} />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveTab('contrato')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'contrato' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <FileText size={18} />
            <span>Contrato</span>
          </button>

          <button
            onClick={() => setActiveTab('avarias')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'avarias' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <AlertCircle size={18} />
            <span>Avarias</span>
          </button>

          <button
            onClick={() => setActiveTab('noticias')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'noticias' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <Bell size={18} />
            <span>Notícias</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'diagnostico' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <Activity size={18} />
            <span>Sinal</span>
          </button>
        </nav>
      </div>

      {/* MODAL: SOLICITAR ACORDO DE PAGAMENTO */}
      {modalPromise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <b className="text-sm text-slate-900">Pedir Acordo de Não-Corte</b>
              <button onClick={() => setModalPromise(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Submeta um compromisso de liquidação. Se aprovado pelo operador da OSDEL, o seu sinal não sofrerá corte até à data indicada.
            </p>

            <form onSubmit={handleRequestPromise} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Prometida de Pagamento</label>
                <input
                  required
                  type="date"
                  value={promiseForm.promisedDate}
                  onChange={(e) => setPromiseForm({ ...promiseForm, promisedDate: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor a Liquidar (Kz)</label>
                <input
                  required
                  type="number"
                  value={promiseForm.promisedAmount}
                  onChange={(e) => setPromiseForm({ ...promiseForm, promisedAmount: Number(e.target.value) })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo do Atraso</label>
                <textarea
                  rows={2}
                  required
                  value={promiseForm.reason}
                  onChange={(e) => setPromiseForm({ ...promiseForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalPromise(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Submeter Acordo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RELATAR PROBLEMA */}
      {modalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <b className="text-sm text-slate-900">Relatar Avaria Técnica</b>
              <button onClick={() => setModalTicket(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Problema</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value as any })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-2 text-xs"
                >
                  <option value="sem_sinal_tv">TV sem sinal / Chuvisco</option>
                  <option value="sem_internet">Sem Internet / Fibra Desligada</option>
                  <option value="router_los">Luz Vermelha (LOS) no Router</option>
                  <option value="cabo_partido">Cabo caído ou partido na rua</option>
                  <option value="lentidao">Internet lenta</option>
                  <option value="outros">Outro problema</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título Resumido</label>
                <input
                  required
                  placeholder="Ex.: Televisão da sala sem canais"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o que acontece..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalTicket(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const ClientMobileAppPage = ClientMobileApp;
