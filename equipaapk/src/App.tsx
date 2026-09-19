import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Wrench,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  User,
  Users,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Send,
  Building2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { API_BASE_URL, APP_CONFIG } from './config/api';

const kz = (val: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(val)
    .replace('AOA', 'Kz');

interface StaffUser {
  id: number;
  name: string;
  role: 'tecnico' | 'operador' | 'admin';
  roleTitle: string;
  phone: string;
  bankName: string;
  iban: string;
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
}

interface ServiceOrder {
  id: string;
  code: string;
  type: 'instalacao' | 'reparacao' | 'corte' | 'religacao';
  clientName: string;
  address: string;
  pdoBox: string;
  phone: string;
  priority: 'alta' | 'normal' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluido';
  date: string;
  notes: string;
}

interface ScheduleTask {
  id: string;
  time: string;
  title: string;
  type: 'ordem' | 'piquete' | 'rotina' | 'reuniao';
  location: string;
  done: boolean;
}

interface ClientAgreement {
  id: string;
  clientName: string;
  clientCode: string;
  phone: string;
  serviceType: string;
  promisedDate: string;
  promisedAmount: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  requestedAt: string;
  operatorNotes?: string;
}

const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: 1,
    name: 'Job Batalha (Mestre Job)',
    role: 'tecnico',
    roleTitle: 'Mestre de Piquete & Redes Fibra',
    phone: '+244 923 111 222',
    bankName: 'Banco BAI',
    iban: 'AO06.0040.0000.4412.9012.1023.1',
    baseSalary: 180000,
    mealAllowance: 35000,
    transportAllowance: 40000,
  },
  {
    id: 2,
    name: 'Albert (deezy)',
    role: 'admin',
    roleTitle: 'Director de Operações & Administrador',
    phone: '+244 945 882 103',
    bankName: 'Banco BFA',
    iban: 'AO06.0006.0000.9921.8741.2012.3',
    baseSalary: 350000,
    mealAllowance: 45000,
    transportAllowance: 60000,
  },
  {
    id: 3,
    name: 'Maria Teresa Sebastião',
    role: 'operador',
    roleTitle: 'Operadora Comercial & Atendimento',
    phone: '+244 931 445 566',
    bankName: 'Millennium Atlântico',
    iban: 'AO06.0055.0000.3341.1122.9011.5',
    baseSalary: 140000,
    mealAllowance: 30000,
    transportAllowance: 35000,
  },
];

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: 'ord-1',
    code: 'OS-2024-104',
    type: 'reparacao',
    clientName: 'António Domingos Pedro',
    address: 'Rua 12, Casa 45B, Bairro Golf I',
    pdoBox: 'PDO-04 / Porta 08',
    phone: '+244 923 456 789',
    priority: 'alta',
    status: 'em_andamento',
    date: 'Hoje, 10:30',
    notes: 'Sinal de TV com ruído. Verificar conector RG6 e nível de sinal no splitter.',
  },
  {
    id: 'ord-2',
    code: 'OS-2024-105',
    type: 'corte',
    clientName: 'Manuel Francisco Chivela',
    address: 'Rua 13, Casa 12, Bairro Golf I',
    pdoBox: 'PDO-04 / Porta 03',
    phone: '+244 912 334 455',
    priority: 'normal',
    status: 'pendente',
    date: 'Hoje, 14:00',
    notes: 'Atraso de 2 mensalidades. Desconectar drop na caixa PDO caso não apresente comprovativo.',
  },
  {
    id: 'ord-3',
    code: 'OS-2024-106',
    type: 'instalacao',
    clientName: 'Esperança Santos Silva',
    address: 'Rua Direita, Casa 88, Bairro Golf I',
    pdoBox: 'PDO-06 / Porta 01',
    phone: '+244 944 887 766',
    priority: 'normal',
    status: 'pendente',
    date: 'Hoje, 16:00',
    notes: 'Nova adesão Combo TV + Fibra 20 Mbps. Lançar 60 metros de drop óptico.',
  },
];

const DEFAULT_SCHEDULE: ScheduleTask[] = [
  {
    id: 'sch-1',
    time: '08:00 - 08:30',
    title: 'Briefing Matinal & Distribuição de Material de Fibra',
    type: 'reuniao',
    location: 'Sede OSDEL Tecnologia',
    done: true,
  },
  {
    id: 'sch-2',
    time: '09:00 - 11:30',
    title: 'Operação Piquete: Vistoria e Fusão nas Ruas 12 e 13',
    type: 'piquete',
    location: 'Bairro Golf I (Postes 12 a 18)',
    done: false,
  },
  {
    id: 'sch-3',
    time: '14:00 - 15:30',
    title: 'Cortes Programados por Falta de Pagamento',
    type: 'ordem',
    location: 'Rua 13 e adjacências',
    done: false,
  },
  {
    id: 'sch-4',
    time: '16:00 - 17:30',
    title: 'Instalação Nova de Cliente Fibra',
    type: 'ordem',
    location: 'Rua Direita, Casa 88',
    done: false,
  },
];

const DEFAULT_AGREEMENTS: ClientAgreement[] = [
  {
    id: 'agr-101',
    clientName: 'Carlos Alberto Domingos',
    clientCode: 'CLI-00088',
    phone: '+244 923 881 900',
    serviceType: 'TV a Cabo (Mensalidade Kz 6.500)',
    promisedDate: '2026-09-20',
    promisedAmount: 6500,
    reason: 'Empresa atrasou salários. Pagarei assim que cair na sexta-feira.',
    status: 'pendente',
    requestedAt: '15/09/2026 09:15',
  },
  {
    id: 'agr-102',
    clientName: 'Teresa Baptista de Sousa',
    clientCode: 'CLI-00045',
    phone: '+244 912 770 114',
    serviceType: 'Combo TV + Fibra 20M (Kz 14.500)',
    promisedDate: '2026-09-18',
    promisedAmount: 14500,
    reason: 'Estive fora de Luanda por motivos de saúde. Já regressei.',
    status: 'pendente',
    requestedAt: '15/09/2026 10:40',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'ordens' | 'salario' | 'acordos'>('agenda');
  const [currentUser, setCurrentUser] = useState<StaffUser>(DEFAULT_STAFF_USERS[0]);
  const [orders, setOrders] = useState<ServiceOrder[]>(DEFAULT_ORDERS);
  const [schedule, setSchedule] = useState<ScheduleTask[]>(DEFAULT_SCHEDULE);
  const [agreements, setAgreements] = useState<ClientAgreement[]>(DEFAULT_AGREEMENTS);

  const isOperatorOrAdmin = currentUser.role === 'admin' || currentUser.role === 'operador';

  // Toggle schedule item done
  const toggleSchedule = (id: string) => {
    setSchedule(
      schedule.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  // Complete an order
  const updateOrderStatus = (id: string, newStatus: ServiceOrder['status']) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
    );
  };

  // Operator approves client agreement
  const handleReviewAgreement = (id: string, decision: 'aprovado' | 'rejeitado') => {
    setAgreements(
      agreements.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision,
              operatorNotes:
                decision === 'aprovado'
                  ? `Acordo aprovado por ${currentUser.name}. Sinal mantido sem cortes até à data prometida.`
                  : `Acordo recusado por ${currentUser.name}. Cliente deve regularizar a dívida imediatamente.`,
            }
          : a,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center text-slate-100 pb-20 font-sans">
      <div className="w-full max-w-md bg-slate-900 min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800">
        {/* Top Header */}
        <header className="bg-slate-900/90 backdrop-blur-md px-4 pt-4 pb-3 sticky top-0 z-30 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
                O
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white">OSDEL EQUIPA</h1>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Centro Técnico Mobile</p>
              </div>
            </div>

            {/* Profile / Role Selector */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = DEFAULT_STAFF_USERS.find((u) => u.id === Number(e.target.value));
                if (found) setCurrentUser(found);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {DEFAULT_STAFF_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name.split(' ')[0]} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* User Badge Bar */}
          <div className="mt-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                <User size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.roleTitle}</p>
              </div>
            </div>

            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                currentUser.role === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : currentUser.role === 'operador'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: AGENDA DO TÉCNICO */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Minha Agenda & Escala</h3>
                  <p className="text-xs text-slate-400">Tarefas e compromissos para hoje</p>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                  {schedule.filter((s) => s.done).length}/{schedule.length} Concluídas
                </span>
              </div>

              <div className="space-y-2.5">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSchedule(item.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      item.done
                        ? 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 transition ${
                        item.done ? 'bg-emerald-600 text-white' : 'border border-slate-600 bg-slate-900'
                      }`}
                    >
                      {item.done && <Check size={12} />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono text-blue-400 font-bold">{item.time}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase font-bold">
                          {item.type}
                        </span>
                      </div>
                      <p className={`text-xs font-bold ${item.done ? 'text-slate-500' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <MapPin size={11} className="text-slate-500" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ORDENS DE SERVIÇO & PIQUETE */}
          {activeTab === 'ordens' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Ordens & Piquete de Campo</h3>
                  <p className="text-xs text-slate-400">Instalações, reparações e cortes</p>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  {orders.filter((o) => o.status !== 'concluido').length} Pendentes
                </span>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-400 font-mono">{ord.code}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                            ord.type === 'corte'
                              ? 'bg-rose-500/20 text-rose-300'
                              : ord.type === 'instalacao'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ord.type}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ord.status === 'concluido'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            : ord.status === 'em_andamento'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">{ord.clientName}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-rose-400 shrink-0" />
                        {ord.address}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-2 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-500">Caixa PDO: </span>
                        <span className="font-mono font-bold text-indigo-300">{ord.pdoBox}</span>
                      </div>
                      <a href={`tel:${ord.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-emerald-400 font-bold hover:underline">
                        <Phone size={11} /> {ord.phone}
                      </a>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-800">
                      <b>Obs:</b> {ord.notes}
                    </p>

                    {/* Action buttons for technician */}
                    <div className="flex items-center gap-2 pt-1">
                      {ord.status !== 'concluido' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'concluido')}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={13} /> Concluir Trabalho
                          </button>
                          {ord.status !== 'em_andamento' && (
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'em_andamento')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                            >
                              Iniciar
                            </button>
                          )}
                        </>
                      )}
                      {ord.status === 'concluido' && (
                        <div className="w-full py-1 text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-lg flex items-center justify-center gap-1">
                          <CheckCircle2 size={14} /> Missão Concluída no Sistema
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SALÁRIO DO TÉCNICO */}
          {activeTab === 'salario' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-800 rounded-2xl p-4 shadow-lg space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Folha de Vencimento Mensal
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] text-blue-200">Salário Líquido Estimado:</p>
                    <h3 className="text-2xl font-black text-white">
                      {kz(currentUser.baseSalary + currentUser.mealAllowance + currentUser.transportAllowance)}
                    </h3>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Aprovado
                  </span>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 space-y-1.5 text-xs border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Salário Base:</span>
                    <span className="font-bold text-white">{kz(currentUser.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subsídio de Alimentação:</span>
                    <span className="font-bold text-emerald-400">+{kz(currentUser.mealAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subsídio de Transporte:</span>
                    <span className="font-bold text-emerald-400">+{kz(currentUser.transportAllowance)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs">
                  <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">Conta Bancária de Depósito:</p>
                  <div className="bg-black/40 rounded-lg p-2.5 space-y-0.5">
                    <p className="font-bold text-white text-xs">{currentUser.bankName}</p>
                    <p className="font-mono text-[10px] text-slate-300">{currentUser.iban}</p>
                  </div>
                </div>
              </div>

              {/* Payment Schedule Notice */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-400" /> Previsão de Pagamento
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  O processamento da folha salarial da OSDEL decorre entre os dias <b>28 e 30 de cada mês</b> através de transferência bancária directa.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: OPERADOR / APROVAÇÃO DE ACORDOS DE CORTE */}
          {activeTab === 'acordos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Acordos de Pagamento (Não Corte)</h3>
                  <p className="text-xs text-slate-400">
                    {isOperatorOrAdmin
                      ? 'Analise os pedidos dos clientes para não sofrerem corte'
                      : 'Apenas Operadores e Administradores podem confirmar acordos'}
                  </p>
                </div>
              </div>

              {!isOperatorOrAdmin ? (
                <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 text-xs text-amber-200 space-y-2">
                  <AlertTriangle className="text-amber-400" size={20} />
                  <p className="font-bold">Acesso Restrito a Operadores & Administradores</p>
                  <p className="text-[11px] text-amber-300">
                    Os técnicos de piquete consultam apenas as missões atribuídas. Seleccione o perfil de Operador ou Administrador no topo para aprovar ou rejeitar os pedidos de acordo dos clientes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agreements.map((agr) => (
                    <div
                      key={agr.id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white">{agr.clientName}</span>
                            <span className="text-[10px] font-mono text-blue-400">({agr.clientCode})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{agr.serviceType}</p>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            agr.status === 'aprovado'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                              : agr.status === 'rejeitado'
                              ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {agr.status}
                        </span>
                      </div>

                      <div className="bg-slate-900/70 p-2.5 rounded-lg text-xs space-y-1 border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Promete Pagar Até:</span>
                          <span className="font-bold text-amber-400">{agr.promisedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Valor a Liquidar:</span>
                          <span className="font-bold text-white">{kz(agr.promisedAmount)}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] pt-1 border-t border-slate-800 mt-1">
                          <b>Motivo:</b> {agr.reason}
                        </p>
                      </div>

                      {agr.operatorNotes && (
                        <p className="text-[10px] text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900">
                          {agr.operatorNotes}
                        </p>
                      )}

                      {agr.status === 'pendente' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleReviewAgreement(agr.id, 'aprovado')}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <Check size={13} /> Confirmar Acordo (Sem Corte)
                          </button>
                          <button
                            onClick={() => handleReviewAgreement(agr.id, 'rejeitado')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                          >
                            <X size={13} /> Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t border-slate-800 px-3 py-1.5 flex justify-around items-center z-30 shadow-2xl">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'agenda' ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <Calendar size={18} />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('ordens')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'ordens' ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <Wrench size={18} />
            <span>Ordens</span>
          </button>

          <button
            onClick={() => setActiveTab('salario')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'salario' ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <DollarSign size={18} />
            <span>Salário</span>
          </button>

          <button
            onClick={() => setActiveTab('acordos')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 transition ${
              activeTab === 'acordos' ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            <ShieldCheck size={18} />
            <span>Acordos</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
