import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Scissors,
  FileText,
  DollarSign,
  Maximize2,
  Minimize2,
  Bell,
  Check,
  ChevronRight,
  UserCheck,
  Smartphone,
  Layers,
  AlertCircle,
  LogOut,
  Send,
  Printer,
  Sparkles,
  Plus,
  CreditCard,
  History,
  X,
  ArrowDownRight,
  TrendingDown,
  Info,
  Banknote,
  AlertTriangle,
} from 'lucide-react';
import {
  type TeamMission,
  type MissionTask,
  getStoredMissions,
  saveMissions,
  updateMissionTask,
} from '@/lib/team-missions';
import {
  type ScheduleEvent,
  getStoredSchedule,
  updateScheduleEvent,
} from '@/lib/schedule-advanced';
import {
  type PaymentPromise,
  getStoredPromises,
  approvePaymentPromise,
  rejectPaymentPromise,
} from '@/lib/client-portal';
import {
  type TechnicianLoan,
  getTechnicianLoans,
  getLoansByTechnicianId,
  getTechnicianActiveDebt,
  requestTechnicianLoan,
  reviewTechnicianLoan,
  cancelTechnicianLoan,
} from '@/lib/technician-loans';
import { useListUsers } from '@/lib/local-api';
import { Link } from 'wouter';

const kz = (value: unknown) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace('AOA', 'Kz');

export function StaffMobileApp() {
  const usersQuery = useListUsers();
  const allUsers = usersQuery.data || [];
  const staffList = allUsers.filter((u: any) => u.active !== false);

  // Active logged-in user in the mobile staff app
  const [activeUserId, setActiveUserId] = useState<number>(() => {
    // Default to Mestre Job (Senior Technician)
    const mestre = staffList.find((u: any) => u.name?.includes('Job'));
    return mestre ? mestre.id : staffList[0]?.id || 1;
  });

  const currentUser = staffList.find((u: any) => u.id === Number(activeUserId)) || staffList[0] || {
    id: 1,
    name: 'Mestre Job (Job Baptista)',
    username: 'mestre.job',
    role: 'operador',
    jobTitle: 'Mestre de Piquete & Técnico Sénior',
    salaryBase: 190000,
    foodAllowance: 35000,
    transportAllowance: 30000,
    department: 'Técnico',
    bankIban: 'AO06.0040.0000.4412.9012.1023.1',
    phone: '923 881 902',
  };

  const isTechOnly = currentUser.jobTitle?.includes('Técnico') || currentUser.jobTitle?.includes('Mestre');
  const isAdminOrOperator = currentUser.role === 'admin' || currentUser.jobTitle?.includes('Operador') || currentUser.jobTitle?.includes('Admin');

  // Tabs for mobile app
  const [activeTab, setActiveTab] = useState<'agenda' | 'missoes' | 'salario' | 'acordos'>('agenda');
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Stored state
  const [missions, setMissions] = useState<TeamMission[]>(() => getStoredMissions());
  const [events, setEvents] = useState<ScheduleEvent[]>(() => getStoredSchedule());
  const [promises, setPromises] = useState<PaymentPromise[]>(() => getStoredPromises());
  const [loans, setLoans] = useState<TechnicianLoan[]>(() => getTechnicianLoans());

  // Modal for requesting loan
  const [modalRequestLoan, setModalRequestLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState('35000');
  const [loanPurpose, setLoanPurpose] = useState('Emergência Médica / Saúde Familiar');
  const [loanInstallments, setLoanInstallments] = useState(1);
  const [loanReceiptMethod, setLoanReceiptMethod] = useState<'iban' | 'multicaixa_express' | 'numerario'>('iban');
  const [loanBank, setLoanBank] = useState('Banco BAI');
  const [loanIban, setLoanIban] = useState(currentUser.bankIban || 'AO06.0040.0000.4412.9012.1023.1');
  const [loanExpressPhone, setLoanExpressPhone] = useState(currentUser.phone || currentUser.whatsapp || '923 881 902');

  // Listen to data events
  useEffect(() => {
    const handleMissions = () => setMissions(getStoredMissions());
    const handleSchedule = () => setEvents(getStoredSchedule());
    const handlePromises = () => setPromises(getStoredPromises());
    const handleLoans = () => setLoans(getTechnicianLoans());

    window.addEventListener('osdel-missions-updated', handleMissions);
    window.addEventListener('osdel-schedule-updated', handleSchedule);
    window.addEventListener('osdel-promises-updated', handlePromises);
    window.addEventListener('osdel-loans-updated', handleLoans);

    return () => {
      window.removeEventListener('osdel-missions-updated', handleMissions);
      window.removeEventListener('osdel-schedule-updated', handleSchedule);
      window.removeEventListener('osdel-promises-updated', handlePromises);
      window.removeEventListener('osdel-loans-updated', handleLoans);
    };
  }, []);

  // Update default payment data when user changes
  useEffect(() => {
    if (currentUser.bankIban) setLoanIban(currentUser.bankIban);
    if (currentUser.phone || currentUser.whatsapp) setLoanExpressPhone(currentUser.phone || currentUser.whatsapp);
  }, [currentUser]);

  // Filter tasks & missions assigned to this technician or all if admin
  const myMissions = missions.filter((m) => {
    if (isAdminOrOperator) return true;
    return (
      m.leaderId === currentUser.id ||
      m.technicianIds?.includes(currentUser.id) ||
      m.leaderName?.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
      m.technicianNames?.some((n) => n.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
    );
  });

  const myEvents = events.filter((e) => {
    if (isAdminOrOperator) return true;
    return (
      e.leaderId === currentUser.id ||
      e.assignedTechnicianIds?.includes(currentUser.id) ||
      e.assignedTechnicianNames?.some((n) => n.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
    );
  });

  // Technician loans & debts
  const myLoans = loans.filter((l) => l.technicianId === currentUser.id);
  const myActiveDebt = getTechnicianActiveDebt(currentUser.id);
  const pendingTeamLoans = loans.filter((l) => l.status === 'pendente');

  // Handle technician completing a task in field
  const handleCompleteMissionTask = (missionId: string, taskId: string, newStatus: MissionTask['status']) => {
    updateMissionTask(missionId, taskId, newStatus, currentUser.name, 'Concluído no local pelo técnico através do APK móvel.');
    setMissions(getStoredMissions());
    alert(`Estado marcado como "${newStatus.toUpperCase()}"! O sistema central da OSDEL foi atualizado em tempo real.`);
  };

  // Operator approving/rejecting payment promise
  const handleApprovePromise = (promiseId: string) => {
    approvePaymentPromise(promiseId, currentUser.name);
    setPromises(getStoredPromises());
    alert('Acordo de pagamento APROVADO! O cliente recebeu a confirmação no aplicativo móvel dele.');
  };

  const handleRejectPromise = (promiseId: string) => {
    const reason = prompt('Motivo do indeferimento:', 'Histórico de acordos anteriores incumpridos.');
    if (reason) {
      rejectPaymentPromise(promiseId, currentUser.name, reason);
      setPromises(getStoredPromises());
    }
  };

  // Salary calculations
  const baseSalary = Number(currentUser.salaryBase || 160000);
  const foodSub = Number(currentUser.foodAllowance || 30000);
  const transSub = Number(currentUser.transportAllowance || 25000);
  const grossSalary = baseSalary + foodSub + transSub;
  const currentMonthDeduction = myActiveDebt.monthlyDeduction;
  const projectedNetSalary = Math.max(0, grossSalary - currentMonthDeduction);

  // Submit loan request from APK
  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(loanAmount);
    if (isNaN(val) || val <= 0) {
      alert('Por favor insira um valor válido de adiantamento.');
      return;
    }

    if (val > grossSalary * 2) {
      if (!confirm(`Atenção: O valor de ${kz(val)} ultrapassa 2x o seu salário bruto mensal (${kz(grossSalary)}). Deseja mesmo enviar este pedido extraordinário à administração?`)) {
        return;
      }
    }

    requestTechnicianLoan({
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      department: currentUser.department || 'Técnico',
      amount: val,
      purpose: loanPurpose,
      installments: loanInstallments,
      targetBank: loanBank,
      targetIban: loanReceiptMethod === 'iban' ? loanIban : '—',
      receiptMethod: loanReceiptMethod,
      expressPhone: loanReceiptMethod === 'multicaixa_express' ? loanExpressPhone : undefined,
    });

    setLoans(getTechnicianLoans());
    setModalRequestLoan(false);
    alert(`Pedido de adiantamento de ${kz(val)} enviado com sucesso à gerência! O valor será analisado e deduzido em ${loanInstallments}x parcela(s) após aprovação.`);
  };

  // Cancel own pending loan
  const handleCancelMyLoan = (loanId: string) => {
    if (confirm('Tem a certeza que deseja cancelar este pedido de adiantamento salarial?')) {
      const ok = cancelTechnicianLoan(loanId, currentUser.id);
      if (ok) {
        setLoans(getTechnicianLoans());
        alert('Pedido cancelado com sucesso.');
      }
    }
  };

  // Admin/Operator quick review on APK
  const handleReviewLoan = (loanId: string, decision: 'aprovado' | 'rejeitado') => {
    const notes = prompt(
      decision === 'aprovado'
        ? 'Observações para aprovação (opcional):'
        : 'Motivo do indeferimento do adiantamento:',
      decision === 'aprovado' ? 'Aprovado via Terminal Mobile.' : 'Ajustar valor ou data com a administração.'
    );
    if (notes !== null) {
      reviewTechnicianLoan(loanId, decision, currentUser.name, notes);
      setLoans(getTechnicianLoans());
    }
  };

  return (
    <div className={`min-h-screen ${fullscreenMode ? 'bg-slate-950 p-0' : 'p-4 md:p-8 bg-slate-100 flex flex-col items-center'}`}>
      {/* Top Controls Bar */}
      {!fullscreenMode && (
        <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white font-serif text-lg font-bold">
              E
            </div>
            <div>
              <b className="text-sm font-extrabold text-slate-900 block">
                Aplicativo Mobile da Empresa (OSDEL Equipa & Campo)
              </b>
              <span className="text-xs text-slate-500">
                Acesso diferenciado: Técnicos de campo (Job, Júlio, Enock) vs. Operadores/Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">Autenticado como:</span>
              <select
                value={activeUserId}
                onChange={(e) => setActiveUserId(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs font-bold"
              >
                {staffList.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle || u.role}
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
        {/* Dynamic Island / Notch */}
        <div className="relative shrink-0 bg-slate-900 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-white select-none">
          <span>09:41</span>
          <div className="h-4 w-24 rounded-full bg-black mx-auto" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-emerald-400">● 5G</span>
            <div className="h-2.5 w-5 rounded-sm border border-white p-0.5">
              <div className="h-full w-full bg-white rounded-2xs" />
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
        <header className="shrink-0 bg-slate-900 text-white p-4 border-b border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-slate-950 font-serif text-sm font-black">
                O
              </div>
              <div>
                <b className="text-xs tracking-wider uppercase opacity-90 block">OSDEL EQUIPA</b>
                <span className="text-[10px] text-slate-400">Terminal de Piquete & Operações</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-amber-400 font-bold">
                {currentUser.jobTitle || 'Técnico'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-300 font-bold truncate max-w-[200px]">
              Olá, {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date().toLocaleDateString('pt-AO')}
            </span>
          </div>
        </header>

        {/* SCROLLABLE SCREEN CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-100 text-slate-900 p-4 space-y-4">
          {/* TAB 1: AGENDA PESSOAL DO TÉCNICO */}
          {activeTab === 'agenda' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <b className="text-xs font-bold uppercase text-slate-500">A Minha Agenda de Hoje</b>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {myEvents.length} Intervenções
                </span>
              </div>

              {myEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {myEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-blue-700 flex items-center gap-1">
                          <Clock size={12} /> {ev.startTime} - {ev.endTime}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            ev.status === 'concluida'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>

                      <b className="text-xs text-slate-900 block leading-tight font-extrabold">
                        {ev.title}
                      </b>

                      {ev.street && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <MapPin size={12} className="text-red-500" />
                          <span>{ev.street}</span>
                        </div>
                      )}

                      {/* Checklist */}
                      {ev.checklist && ev.checklist.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Tarefas:</span>
                          {ev.checklist.map((c) => (
                            <div key={c.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                              <span className={`h-1.5 w-1.5 rounded-full ${c.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span className={c.done ? 'line-through text-slate-400' : ''}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Complete event button */}
                      {ev.status !== 'concluida' && (
                        <button
                          onClick={() => {
                            updateScheduleEvent(ev.id, { status: 'concluida' });
                            setEvents(getStoredSchedule());
                            alert('Intervenção concluída na agenda!');
                          }}
                          className="w-full mt-2 inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 text-white py-1.5 text-[11px] font-bold hover:bg-black"
                        >
                          <CheckCircle2 size={13} /> Marcar como Concluída
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                  <Calendar size={24} className="mx-auto mb-1 text-slate-300" />
                  <p>Sem intervenções agendadas para hoje.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MISSÕES DE CORTE & RELIGAÇÃO POR RUA */}
          {activeTab === 'missoes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <b className="text-xs font-bold uppercase text-slate-500">Piquetes em Equipa</b>
                  <p className="text-[10px] text-slate-400">Assinale os cortes e religações feitas na rua</p>
                </div>
                {isAdminOrOperator && (
                  <Link
                    href="/missoes"
                    className="text-[10px] bg-slate-900 text-white font-bold px-2 py-1 rounded-lg"
                  >
                    + Criar Missão
                  </Link>
                )}
              </div>

              {myMissions.length > 0 ? (
                <div className="space-y-3">
                  {myMissions.map((mission) => (
                    <div key={mission.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 text-xs shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 block">{mission.code}</span>
                          <b className="text-xs text-slate-900 font-extrabold block leading-tight">{mission.title}</b>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-700">
                          {mission.type}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 text-[11px] border border-slate-100">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin size={12} className="text-red-500" />
                          <span>Ruas: {mission.streets.join(' e ')}</span>
                        </div>
                        <div className="text-slate-600">
                          <span>Equipa: <b>{mission.technicianNames.join(', ')}</b></span>
                        </div>
                      </div>

                      {/* Tasks of this mission */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <b className="text-[10px] uppercase font-bold text-slate-400 block">
                          Clientes a Intervencionar ({mission.tasks.length}):
                        </b>

                        {mission.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`rounded-xl border p-2.5 space-y-2 transition ${
                              task.status === 'cortado'
                                ? 'bg-red-50/70 border-red-200'
                                : task.status === 'religado'
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <b className="text-slate-900 block text-xs">{task.clientName}</b>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {task.street} · {task.address}
                                </span>
                              </div>
                              <span className="font-bold text-red-700 text-xs">{kz(task.debtAmount)}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200/50 pt-1">
                              <span>Caixa: <b className="font-mono">{task.pdoNumber}</b> ({task.portNumber})</span>
                              <span className="font-bold uppercase">
                                {task.status === 'cortado' ? (
                                  <span className="text-red-700">Cortado [X]</span>
                                ) : task.status === 'religado' ? (
                                  <span className="text-emerald-700">Religado [X]</span>
                                ) : (
                                  <span className="text-slate-400">Pendente</span>
                                )}
                              </span>
                            </div>

                            {/* Actions on task */}
                            <div className="grid grid-cols-3 gap-1.5 pt-1">
                              <button
                                onClick={() => handleCompleteMissionTask(mission.id, task.id, 'cortado')}
                                className="rounded-lg bg-red-600 text-white py-1 text-[10px] font-bold hover:bg-red-700"
                              >
                                ✂ Cortar
                              </button>
                              <button
                                onClick={() => handleCompleteMissionTask(mission.id, task.id, 'religado')}
                                className="rounded-lg bg-emerald-600 text-white py-1 text-[10px] font-bold hover:bg-emerald-700"
                              >
                                ✓ Religar
                              </button>
                              <button
                                onClick={() => handleCompleteMissionTask(mission.id, task.id, 'acordo_no_local')}
                                className="rounded-lg bg-slate-200 text-slate-800 py-1 text-[10px] font-bold hover:bg-slate-300"
                              >
                                Acordo
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                  <Scissors size={24} className="mx-auto mb-1 text-slate-300" />
                  <p>Sem missões de corte atribuídas à sua equipa.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: O MEU SALÁRIO & ADIANTAMENTOS (INDIVIDUAL & PRIVADO) */}
          {activeTab === 'salario' && (
            <div className="space-y-3.5 text-xs">
              {/* Main Salary Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4 shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute right-2 -bottom-2 opacity-10">
                  <Banknote size={100} />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Salário Líquido a Receber
                    </span>
                    <b className="text-2xl font-black text-amber-400 block mt-0.5">
                      {kz(projectedNetSalary)}
                    </b>
                  </div>
                  {myActiveDebt.totalActiveDebt > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <TrendingDown size={11} /> Dívida Activa
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-300 border-t border-slate-800 pt-2.5">
                  <span>Colaborador: <b>{currentUser.name}</b></span>
                  <span className="text-[10px] text-slate-400">{currentUser.jobTitle || 'Técnico'}</span>
                </div>
              </div>

              {/* Debt & Loan Action Banner */}
              <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <b className="text-slate-900 text-xs block">Adiantamento de Salário</b>
                      <span className="text-[10px] text-slate-500">
                        {myActiveDebt.totalActiveDebt > 0
                          ? `Saldo Devedor: ${kz(myActiveDebt.totalActiveDebt)}`
                          : 'Sem dívidas activas registadas'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalRequestLoan(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] shadow-sm hover:bg-blue-700 active:scale-95 transition"
                  >
                    <Plus size={13} /> Pedir Adiantamento
                  </button>
                </div>

                {myActiveDebt.totalActiveDebt > 0 && (
                  <div className="rounded-xl bg-white/90 border border-blue-100 p-2.5 text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dívida Total em Aberto:</span>
                      <b className="text-red-700 font-bold">{kz(myActiveDebt.totalActiveDebt)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Desconto previsto este mês:</span>
                      <b className="text-amber-700 font-bold">-{kz(myActiveDebt.monthlyDeduction)}</b>
                    </div>
                    <p className="text-[10px] text-slate-500 italic pt-0.5">
                      O montante de {kz(myActiveDebt.monthlyDeduction)} será retido automaticamente no fecho da folha do dia 28.
                    </p>
                  </div>
                )}
              </div>

              {/* Salary details breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <b className="text-xs font-bold text-slate-800 block border-b border-slate-100 pb-2">
                  Discriminação Detalhada de Vencimento
                </b>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Salário Base Contratual:</span>
                    <b className="text-slate-900">{kz(baseSalary)}</b>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Subsídio de Alimentação:</span>
                    <b className="text-emerald-700">+{kz(foodSub)}</b>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500">Subsídio de Transporte:</span>
                    <b className="text-emerald-700">+{kz(transSub)}</b>
                  </div>

                  <div className="flex justify-between pb-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Total Ilíquido Contratual:</span>
                    <b className="text-slate-900">{kz(grossSalary)}</b>
                  </div>

                  {myActiveDebt.monthlyDeduction > 0 && (
                    <div className="flex justify-between pb-1 border-b border-red-100 text-red-700 font-bold">
                      <span>Dedução de Adiantamento:</span>
                      <span>-{kz(myActiveDebt.monthlyDeduction)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-1 font-bold text-xs">
                    <span className="text-slate-900">Total Líquido a Transferir:</span>
                    <b className="text-emerald-700 text-sm">{kz(projectedNetSalary)}</b>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 text-[10px] text-slate-500 border border-slate-100 space-y-1">
                  <div>
                    <b>IBAN Bancário:</b> <span className="font-mono">{currentUser.bankIban || 'Não cadastrado'}</span>
                  </div>
                  <div>
                    <b>Data de Pagamento:</b> 28 a 30 de cada mês através de transferência interbancária.
                  </div>
                </div>
              </div>

              {/* MY LOANS HISTORY & DEBT STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <History size={15} className="text-slate-500" />
                    <b className="text-xs font-bold text-slate-800">
                      Os Meus Pedidos de Adiantamento ({myLoans.length})
                    </b>
                  </div>
                  <span className="text-[10px] text-slate-400">Histórico de dívidas</span>
                </div>

                {myLoans.length > 0 ? (
                  <div className="space-y-2.5">
                    {myLoans.map((loan) => {
                      const percentPaid = loan.amount > 0 ? Math.min(100, Math.round((loan.totalRepaid / loan.amount) * 100)) : 0;
                      return (
                        <div
                          key={loan.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <b className="text-xs font-bold text-slate-900 block">{kz(loan.amount)}</b>
                              <span className="text-[10px] text-slate-500">
                                {new Date(loan.requestedAt).toLocaleDateString('pt-AO')} · {loan.installments}x parcela(s)
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                loan.status === 'liquidado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : loan.status === 'aprovado'
                                  ? 'bg-blue-100 text-blue-800'
                                  : loan.status === 'rejeitado'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {loan.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 bg-white rounded-lg p-2 border border-slate-100 space-y-1">
                            <p><b>Motivo:</b> {loan.purpose}</p>
                            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>Desconto mensal: <b>{kz(loan.monthlyDeduction)}/mês</b></span>
                              <span>Recebimento: <b>{loan.receiptMethod === 'multicaixa_express' ? 'Multicaixa Express' : loan.receiptMethod === 'numerario' ? 'Numerário' : 'Transferência IBAN'}</b></span>
                            </div>
                          </div>

                          {/* Progress of repayment */}
                          {loan.status === 'aprovado' && (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Amortizado: <b>{kz(loan.totalRepaid)}</b> ({percentPaid}%)</span>
                                <span className="text-red-700 font-bold">Saldo Devedor: {kz(loan.remainingDebt)}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${percentPaid}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {loan.status === 'pendente' && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-amber-700 font-medium italic">
                                Aguarda validação pela administração da OSDEL.
                              </span>
                              <button
                                onClick={() => handleCancelMyLoan(loan.id)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-800 hover:underline"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}

                          {loan.reviewNotes && (
                            <p className="text-[10px] text-slate-500 italic bg-white/50 p-1.5 rounded border border-slate-100">
                              <b>Nota da Administração:</b> {loan.reviewNotes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs">
                    <CreditCard size={20} className="mx-auto mb-1 text-slate-300" />
                    <p>Não possui nenhum pedido de adiantamento registado.</p>
                  </div>
                )}
              </div>

              {/* ADMIN / OPERATOR: TEAM LOANS APPROVAL PANEL */}
              {isAdminOrOperator && pendingTeamLoans.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-amber-600" />
                      <b className="text-xs font-bold text-amber-900">
                        Pedidos de Adiantamento da Equipa ({pendingTeamLoans.length})
                      </b>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-800">
                      Painel Operador
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {pendingTeamLoans.map((pLoan) => (
                      <div key={pLoan.id} className="rounded-xl border border-amber-200 bg-white p-3 space-y-2 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <b className="text-slate-900 text-xs block">{pLoan.technicianName}</b>
                            <span className="text-[10px] text-slate-500">
                              {pLoan.department || 'Técnico'} · {new Date(pLoan.requestedAt).toLocaleDateString('pt-AO')}
                            </span>
                          </div>
                          <b className="text-blue-700 text-xs font-black">{kz(pLoan.amount)}</b>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 space-y-0.5 border border-slate-100">
                          <div><b>Motivo:</b> {pLoan.purpose}</div>
                          <div><b>Plano:</b> {pLoan.installments}x parcelas de {kz(pLoan.monthlyDeduction)}/mês</div>
                          <div><b>Recebimento:</b> {pLoan.receiptMethod === 'multicaixa_express' ? `Multicaixa Express (${pLoan.expressPhone || '—'})` : `IBAN: ${pLoan.targetIban}`}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleReviewLoan(pLoan.id, 'aprovado')}
                            className="rounded-lg bg-emerald-600 text-white py-1.5 font-bold text-[11px] hover:bg-emerald-700 shadow-xs"
                          >
                            ✓ Aprovar
                          </button>
                          <button
                            onClick={() => handleReviewLoan(pLoan.id, 'rejeitado')}
                            className="rounded-lg bg-red-100 text-red-700 py-1.5 font-bold text-[11px] hover:bg-red-200"
                          >
                            ✕ Indeferir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PEDIDOS DE ACORDO DE CLIENTES (ADMIN & OPERADOR) */}
          {activeTab === 'acordos' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <b className="text-xs font-bold uppercase text-slate-500">Acordos de Não-Corte</b>
                  <p className="text-[10px] text-slate-400">Promessas de pagamento submetidas pelos clientes</p>
                </div>
              </div>

              {promises.length > 0 ? (
                <div className="space-y-2.5">
                  {promises.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <b className="text-slate-900 block text-xs font-extrabold">{p.clientName}</b>
                          <span className="text-[10px] text-slate-400">{p.clientCode} · {p.phone}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            p.status === 'aprovado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'rejeitado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Data Prometida:</span>
                          <b className="text-blue-700">{p.promisedDate}</b>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valor a Pagar:</span>
                          <b className="text-slate-900">{kz(p.promisedAmount)}</b>
                        </div>
                        <p className="text-[10px] text-slate-600 italic mt-1">
                          "{p.reason}"
                        </p>
                      </div>

                      {/* Approval buttons if pending */}
                      {p.status === 'pendente' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleApprovePromise(p.id)}
                            className="rounded-lg bg-emerald-600 text-white py-1.5 font-bold text-[11px] hover:bg-emerald-700"
                          >
                            ✓ Aprovar Acordo
                          </button>
                          <button
                            onClick={() => handleRejectPromise(p.id)}
                            className="rounded-lg bg-red-100 text-red-700 py-1.5 font-bold text-[11px] hover:bg-red-200"
                          >
                            ✕ Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400" />
                  <p>Nenhum pedido de acordo de pagamento pendente.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: PEDIR ADIANTAMENTO DE SALÁRIO NO APK */}
        {modalRequestLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Banknote size={20} />
                  <div>
                    <b className="text-sm block">Solicitar Adiantamento de Salário</b>
                    <span className="text-[10px] text-blue-100">Desconto directo na folha salarial da OSDEL</span>
                  </div>
                </div>
                <button
                  onClick={() => setModalRequestLoan(false)}
                  className="rounded-lg p-1.5 hover:bg-white/20 text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRequestLoan} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
                {/* Colaborador Info */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex justify-between items-center text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Colaborador Solicitante:</span>
                    <b className="text-slate-900">{currentUser.name}</b>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Salário Bruto:</span>
                    <b className="text-emerald-700">{kz(grossSalary)}</b>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Valor do Adiantamento (Kz) *
                  </label>
                  <input
                    type="number"
                    min="5000"
                    step="1000"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="Ex.: 35000"
                  />
                  {/* Quick Chips */}
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {[20000, 35000, 50000, 75000, 100000].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setLoanAmount(String(chip))}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                          loanAmount === String(chip)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {kz(chip)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Motivo / Justificação *
                  </label>
                  <select
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="Emergência Médica / Saúde Familiar">Emergência Médica / Saúde Familiar</option>
                    <option value="Despesas de Habitação / Renda">Despesas de Habitação / Renda</option>
                    <option value="Educação / Propinas dos Filhos">Educação / Propinas dos Filhos</option>
                    <option value="Ferramentas Técnicas / Equipamento">Ferramentas Técnicas / Equipamento</option>
                    <option value="Despesas Pessoais Imprevistas">Despesas Pessoais Imprevistas</option>
                  </select>
                </div>

                {/* Installments */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Prazo de Desconto em Folha *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { months: 1, label: '1 Mês (100%)' },
                      { months: 2, label: '2 Meses (50%/mês)' },
                      { months: 3, label: '3 Meses (33%/mês)' },
                    ].map((inst) => (
                      <button
                        type="button"
                        key={inst.months}
                        onClick={() => setLoanInstallments(inst.months)}
                        className={`py-2 px-1 rounded-xl text-center border font-bold text-[10px] transition ${
                          loanInstallments === inst.months
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {inst.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receipt Method */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Forma de Pagamento Desejada *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLoanReceiptMethod('iban')}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center ${
                        loanReceiptMethod === 'iban' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      IBAN Bancário
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanReceiptMethod('multicaixa_express')}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center ${
                        loanReceiptMethod === 'multicaixa_express' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      Multicaixa Express
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanReceiptMethod('numerario')}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center ${
                        loanReceiptMethod === 'numerario' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      Numerário (Caixa)
                    </button>
                  </div>
                </div>

                {loanReceiptMethod === 'iban' && (
                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 block">Banco:</span>
                      <input
                        value={loanBank}
                        onChange={(e) => setLoanBank(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="Ex: Banco BAI"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 block">IBAN de Destino (AO06...):</span>
                      <input
                        value={loanIban}
                        onChange={(e) => setLoanIban(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 font-mono text-[11px] bg-white"
                        placeholder="AO06.0040.0000.xxxx.xxxx.xxxx.x"
                      />
                    </div>
                  </div>
                )}

                {loanReceiptMethod === 'multicaixa_express' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 block">Número de Telemóvel MCX:</span>
                    <input
                      value={loanExpressPhone}
                      onChange={(e) => setLoanExpressPhone(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                      placeholder="923 000 000"
                    />
                  </div>
                )}

                {/* Simulation Card */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-900 space-y-1">
                  <b className="block text-[11px] text-emerald-800">Simulação de Desconto:</b>
                  <div className="flex justify-between">
                    <span>Desconto Mensal:</span>
                    <b className="font-bold">{kz(Math.round(Number(loanAmount || 0) / Math.max(1, loanInstallments)))} / mês</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Salário Estimado Pós-Desconto:</span>
                    <b className="font-bold">{kz(Math.max(0, grossSalary - Math.round(Number(loanAmount || 0) / Math.max(1, loanInstallments))))}</b>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setModalRequestLoan(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm"
                  >
                    Submeter Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION TABS */}
        <nav className="shrink-0 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'agenda' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <Calendar size={18} />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('missoes')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'missoes' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <Scissors size={18} />
            <span>Piquete Ruas</span>
          </button>

          <button
            onClick={() => setActiveTab('salario')}
            className={`flex flex-col items-center gap-1 transition relative ${
              activeTab === 'salario' ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <DollarSign size={18} />
            <span>Salário & Dívidas</span>
            {myActiveDebt.totalActiveDebt > 0 && (
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('acordos')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'acordos' ? 'text-blue-700' : 'text-slate-400'
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

export const StaffMobileAppPage = StaffMobileApp;

