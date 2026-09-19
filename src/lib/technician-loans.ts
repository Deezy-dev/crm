/**
 * OSDEL TECNOLOGIA - MÓDULO DE EMPRÉSTIMOS & ADIANTAMENTOS SALARIAIS
 * Permite que técnicos de campo e operadores solicitem adiantamento ou empréstimo
 * com desconto directo na folha salarial e aprovação pela gerência.
 */

import { pushNotification } from './notifications';

export interface LoanRepaymentRecord {
  id: string;
  date: string;
  paidAt?: string;
  amount: number;
  source: 'folha_salarial' | 'pagamento_directo' | 'ajuste_contabil';
  note?: string;
  notes?: string;
  registeredBy: string;
  paymentMethod?: string;
  remainingDebtAfter?: number;
  receiptReference?: string;
}

export interface TechnicianLoan {
  id: string;
  technicianId: number;
  technicianName: string;
  department?: string;
  amount: number;
  purpose: string;
  installments: number; // 1, 2, 3 ou mais meses
  monthlyDeduction: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'liquidado';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  reviewNotes?: string;
  targetBank: string;
  targetIban: string;
  receiptMethod?: 'iban' | 'multicaixa_express' | 'numerario';
  expressPhone?: string;
  totalRepaid: number;
  remainingDebt: number;
  repaymentHistory: LoanRepaymentRecord[];
}

const LOANS_STORAGE_KEY = 'osdel_technician_loans';

const SEED_LOANS: TechnicianLoan[] = [
  {
    id: 'loan-1',
    technicianId: 3,
    technicianName: 'Job Batalha (Mestre Job)',
    department: 'Técnico',
    amount: 50000,
    purpose: 'Aquisição de máquina de fusão óptica portátil e alicate clivador',
    installments: 2,
    monthlyDeduction: 25000,
    status: 'aprovado',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    approvedBy: 'Albert (deezy) - Administrador Geral',
    reviewNotes: 'Aprovado. Desconto programado nas folhas salariais de Outubro e Novembro.',
    targetBank: 'Banco BAI',
    targetIban: 'AO06.0040.0000.4412.9012.1023.1',
    receiptMethod: 'iban',
    totalRepaid: 25000,
    remainingDebt: 25000,
    repaymentHistory: [
      {
        id: 'rep-1',
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        amount: 25000,
        source: 'folha_salarial',
        note: 'Desconto da 1ª prestação na folha salarial',
        registeredBy: 'Albert (deezy)',
      },
    ],
  },
  {
    id: 'loan-2',
    technicianId: 7,
    technicianName: 'Júlio Afonso (Técnico de Rede)',
    department: 'Técnico',
    amount: 35000,
    purpose: 'Despesas de saúde familiar e medicação urgente',
    installments: 1,
    monthlyDeduction: 35000,
    status: 'pendente',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    targetBank: 'Banco BFA',
    targetIban: 'AO06.0006.0000.1123.8821.9012.4',
    receiptMethod: 'multicaixa_express',
    expressPhone: '923 881 902',
    totalRepaid: 0,
    remainingDebt: 35000,
    repaymentHistory: [],
  },
];

function sanitizeLoan(loan: any): TechnicianLoan {
  const amount = Number(loan.amount || 0);
  const totalRepaid = Number(loan.totalRepaid || 0);
  const remainingDebt =
    typeof loan.remainingDebt === 'number'
      ? loan.remainingDebt
      : Math.max(0, amount - totalRepaid);
  const installments = Math.max(1, Number(loan.installments || 1));
  const monthlyDeduction =
    Number(loan.monthlyDeduction || 0) || Math.round(amount / installments);

  return {
    id: String(loan.id || `loan-${Date.now()}`),
    technicianId: Number(loan.technicianId || 0),
    technicianName: String(loan.technicianName || 'Colaborador OSDEL'),
    department: loan.department || 'Técnico',
    amount,
    purpose: String(loan.purpose || 'Adiantamento salarial'),
    installments,
    monthlyDeduction,
    status:
      loan.status === 'liquidado' || (loan.status === 'aprovado' && remainingDebt <= 0)
        ? 'liquidado'
        : loan.status === 'rejeitado'
        ? 'rejeitado'
        : loan.status === 'aprovado'
        ? 'aprovado'
        : 'pendente',
    requestedAt: loan.requestedAt || new Date().toISOString(),
    approvedAt: loan.approvedAt,
    approvedBy: loan.approvedBy,
    reviewNotes: loan.reviewNotes,
    targetBank: loan.targetBank || 'Banco BAI',
    targetIban: loan.targetIban || 'AO06.0040.0000.0000.0000.0000.0',
    receiptMethod: loan.receiptMethod || 'iban',
    expressPhone: loan.expressPhone,
    totalRepaid,
    remainingDebt,
    repaymentHistory: Array.isArray(loan.repaymentHistory) ? loan.repaymentHistory : [],
  };
}

export function getTechnicianLoans(): TechnicianLoan[] {
  if (typeof window === 'undefined') return SEED_LOANS;
  try {
    const raw = localStorage.getItem(LOANS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(SEED_LOANS));
      return SEED_LOANS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_LOANS;
    return parsed.map(sanitizeLoan);
  } catch {
    return SEED_LOANS;
  }
}

export function saveTechnicianLoans(loans: TechnicianLoan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    window.dispatchEvent(new CustomEvent('osdel-loans-updated', { detail: { loans } }));
  } catch (err) {
    console.error('Erro ao guardar empréstimos:', err);
  }
}

export function getLoansByTechnicianId(technicianId: number): TechnicianLoan[] {
  return getTechnicianLoans().filter((l) => l.technicianId === Number(technicianId));
}

export function getTechnicianActiveDebt(technicianId: number): {
  totalActiveDebt: number;
  monthlyDeduction: number;
  activeLoansCount: number;
  pendingLoansCount: number;
} {
  const loans = getLoansByTechnicianId(technicianId);
  const activeLoans = loans.filter((l) => l.status === 'aprovado' && l.remainingDebt > 0);
  const pendingLoans = loans.filter((l) => l.status === 'pendente');

  const totalActiveDebt = activeLoans.reduce((sum, l) => sum + l.remainingDebt, 0);
  const monthlyDeduction = activeLoans.reduce(
    (sum, l) => sum + Math.min(l.monthlyDeduction, l.remainingDebt),
    0,
  );

  return {
    totalActiveDebt,
    monthlyDeduction,
    activeLoansCount: activeLoans.length,
    pendingLoansCount: pendingLoans.length,
  };
}

export function requestTechnicianLoan(data: {
  technicianId: number;
  technicianName: string;
  department?: string;
  amount: number;
  purpose: string;
  installments: number;
  targetBank: string;
  targetIban: string;
  receiptMethod?: 'iban' | 'multicaixa_express' | 'numerario';
  expressPhone?: string;
}): TechnicianLoan {
  const current = getTechnicianLoans();
  const installments = Math.max(1, data.installments || 1);
  const monthlyDeduction = Math.round(data.amount / installments);

  const newLoan: TechnicianLoan = {
    id: `loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    technicianId: data.technicianId,
    technicianName: data.technicianName,
    department: data.department || 'Técnico',
    amount: data.amount,
    purpose: data.purpose,
    installments,
    monthlyDeduction,
    status: 'pendente',
    requestedAt: new Date().toISOString(),
    targetBank: data.targetBank,
    targetIban: data.targetIban,
    receiptMethod: data.receiptMethod || 'iban',
    expressPhone: data.expressPhone,
    totalRepaid: 0,
    remainingDebt: data.amount,
    repaymentHistory: [],
  };

  const updated = [newLoan, ...current];
  saveTechnicianLoans(updated);

  // Trigger system notification for administrators
  pushNotification({
    title: `Novo Pedido de Adiantamento: ${data.technicianName}`,
    message: `${data.technicianName} solicitou adiantamento de Kz ${data.amount.toLocaleString('pt-AO')} para desconto em ${installments}x mês(es). Motivo: ${data.purpose}`,
    type: 'emprestimo',
    priority: 'alta',
    targetRole: 'admin',
    link: '/equipe',
  });

  return newLoan;
}

export function createDirectLoanByAdmin(data: {
  technicianId: number;
  technicianName: string;
  department?: string;
  amount: number;
  purpose: string;
  installments: number;
  targetBank?: string;
  targetIban?: string;
  receiptMethod?: 'iban' | 'multicaixa_express' | 'numerario';
  expressPhone?: string;
  adminName: string;
  notes?: string;
}): TechnicianLoan {
  const current = getTechnicianLoans();
  const installments = Math.max(1, data.installments || 1);
  const monthlyDeduction = Math.round(data.amount / installments);

  const newLoan: TechnicianLoan = {
    id: `loan-adm-${Date.now()}`,
    technicianId: data.technicianId,
    technicianName: data.technicianName,
    department: data.department || 'Técnico',
    amount: data.amount,
    purpose: data.purpose,
    installments,
    monthlyDeduction,
    status: 'aprovado',
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: data.adminName,
    reviewNotes: data.notes || 'Adiantamento registado directamente pela administração.',
    targetBank: data.targetBank || 'Caixa Geral',
    targetIban: data.targetIban || '—',
    receiptMethod: data.receiptMethod || 'numerario',
    expressPhone: data.expressPhone,
    totalRepaid: 0,
    remainingDebt: data.amount,
    repaymentHistory: [],
  };

  const updated = [newLoan, ...current];
  saveTechnicianLoans(updated);

  pushNotification({
    title: `Adiantamento Registado: ${data.technicianName}`,
    message: `Adiantamento de Kz ${data.amount.toLocaleString('pt-AO')} concedido a ${data.technicianName}. Desconto de Kz ${monthlyDeduction.toLocaleString('pt-AO')}/mês em ${installments}x.`,
    type: 'emprestimo',
    priority: 'normal',
    targetRole: 'tecnico',
    targetUserId: data.technicianId,
    link: '/equipe',
  });

  return newLoan;
}

export function reviewTechnicianLoan(
  loanId: string,
  decision: 'aprovado' | 'rejeitado',
  reviewerName: string,
  reviewNotes?: string,
): void {
  const current = getTechnicianLoans();
  const updated = current.map((loan) => {
    if (loan.id === loanId) {
      return {
        ...loan,
        status: decision,
        approvedAt: new Date().toISOString(),
        approvedBy: reviewerName,
        reviewNotes:
          reviewNotes ||
          (decision === 'aprovado'
            ? 'Adiantamento aprovado para liquidação financeira.'
            : 'Pedido indeferido pela gerência.'),
      };
    }
    return loan;
  });

  saveTechnicianLoans(updated);

  const targetLoan = current.find((l) => l.id === loanId);
  if (targetLoan) {
    pushNotification({
      title: `Adiantamento Salarial ${decision === 'aprovado' ? 'Aprovado' : 'Recusado'}`,
      message: `O pedido de Kz ${targetLoan.amount.toLocaleString('pt-AO')} de ${targetLoan.technicianName} foi ${decision} por ${reviewerName}.`,
      type: 'emprestimo',
      priority: decision === 'aprovado' ? 'alta' : 'normal',
      targetRole: 'tecnico',
      targetUserId: targetLoan.technicianId,
      link: '/equipe',
    });
  }
}

export function registerLoanRepayment(
  loanIdOrObj:
    | string
    | {
        loanId: string;
        amount: number;
        source?: 'folha_salarial' | 'pagamento_directo' | 'ajuste_contabil';
        paymentMethod?: string;
        note?: string;
        notes?: string;
        registeredBy?: string;
        receiptReference?: string;
      },
  paramAmount?: number,
  paramSource?: 'folha_salarial' | 'pagamento_directo' | 'ajuste_contabil',
  paramNote?: string,
  paramRegisteredBy?: string,
): TechnicianLoan | null {
  const loanId = typeof loanIdOrObj === 'string' ? loanIdOrObj : loanIdOrObj.loanId;
  const amount = typeof loanIdOrObj === 'string' ? Number(paramAmount || 0) : Number(loanIdOrObj.amount || 0);
  const source =
    typeof loanIdOrObj === 'string'
      ? paramSource || 'pagamento_directo'
      : loanIdOrObj.source || 'pagamento_directo';
  const note =
    typeof loanIdOrObj === 'string'
      ? paramNote || 'Amortização de dívida'
      : loanIdOrObj.notes || loanIdOrObj.note || 'Amortização de dívida';
  const registeredBy =
    typeof loanIdOrObj === 'string'
      ? paramRegisteredBy || 'Administrador'
      : loanIdOrObj.registeredBy || 'Administrador';
  const paymentMethod = typeof loanIdOrObj === 'object' ? loanIdOrObj.paymentMethod : undefined;
  const receiptReference = typeof loanIdOrObj === 'object' ? loanIdOrObj.receiptReference : undefined;

  const current = getTechnicianLoans();
  let updatedTarget: TechnicianLoan | null = null;

  const updated = current.map((loan) => {
    if (loan.id === loanId) {
      const newTotalRepaid = loan.totalRepaid + amount;
      const newRemaining = Math.max(0, loan.amount - newTotalRepaid);
      const isSettled = newRemaining <= 0;

      const record: LoanRepaymentRecord = {
        id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString(),
        amount,
        source,
        note,
        registeredBy,
        paymentMethod,
        remainingDebtAfter: newRemaining,
        receiptReference,
      };

      updatedTarget = {
        ...loan,
        totalRepaid: newTotalRepaid,
        remainingDebt: newRemaining,
        status: isSettled ? ('liquidado' as const) : ('aprovado' as const),
        repaymentHistory: [...loan.repaymentHistory, record],
      };

      return updatedTarget;
    }
    return loan;
  });

  saveTechnicianLoans(updated);
  return updatedTarget;
}

export function cancelTechnicianLoan(loanId: string, technicianId: number): boolean {
  const current = getTechnicianLoans();
  const target = current.find((l) => l.id === loanId && l.technicianId === technicianId);
  if (!target || target.status !== 'pendente') {
    return false;
  }

  const updated = current.filter((l) => l.id !== loanId);
  saveTechnicianLoans(updated);
  return true;
}

export function applyMonthlyPayrollDeductions(
  monthOrAdmin?: string,
  maybeAdmin?: string,
): {
  totalDeducted: number;
  count: number;
  deductionsCount: number;
} {
  const current = getTechnicianLoans();
  let totalDeducted = 0;
  let count = 0;

  const month =
    maybeAdmin !== undefined
      ? monthOrAdmin || new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' });
  const adminName = maybeAdmin || monthOrAdmin || 'Administrador OSDEL';

  const updated = current.map((loan) => {
    if (loan.status === 'aprovado' && loan.remainingDebt > 0) {
      const deduction = Math.min(loan.monthlyDeduction, loan.remainingDebt);
      if (deduction > 0) {
        totalDeducted += deduction;
        count += 1;
        const newTotalRepaid = loan.totalRepaid + deduction;
        const newRemaining = Math.max(0, loan.amount - newTotalRepaid);

        const record: LoanRepaymentRecord = {
          id: `rep-auto-${Date.now()}-${count}`,
          date: new Date().toISOString(),
          amount: deduction,
          source: 'folha_salarial',
          note: `Desconto automático na folha salarial de ${month}`,
          registeredBy: adminName,
          remainingDebtAfter: newRemaining,
          paymentMethod: 'folha_salarial',
        };

        return {
          ...loan,
          totalRepaid: newTotalRepaid,
          remainingDebt: newRemaining,
          status: (newRemaining <= 0 ? 'liquidado' : 'aprovado') as any,
          repaymentHistory: [...loan.repaymentHistory, record],
        };
      }
    }
    return loan;
  });

  saveTechnicianLoans(updated);
  return { totalDeducted, count, deductionsCount: count };
}

export function getCompanyLoanStats() {
  const loans = getTechnicianLoans();

  const totalLent = loans
    .filter((l) => l.status === 'aprovado' || l.status === 'liquidado')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalActiveDebt = loans
    .filter((l) => l.status === 'aprovado')
    .reduce((sum, l) => sum + l.remainingDebt, 0);

  const totalRepaid = loans
    .filter((l) => l.status === 'aprovado' || l.status === 'liquidado')
    .reduce((sum, l) => sum + l.totalRepaid, 0);

  const pendingCount = loans.filter((l) => l.status === 'pendente').length;
  const approvedActiveCount = loans.filter(
    (l) => l.status === 'aprovado' && l.remainingDebt > 0,
  ).length;
  const liquidatedCount = loans.filter((l) => l.status === 'liquidado').length;

  const employeesInDebtSet = new Set(
    loans.filter((l) => l.status === 'aprovado' && l.remainingDebt > 0).map((l) => l.technicianId),
  );

  return {
    totalLent,
    totalLoaned: totalLent,
    totalActiveDebt,
    totalOutstandingDebt: totalActiveDebt,
    totalRepaid,
    pendingCount,
    pendingRequests: pendingCount,
    approvedActiveCount,
    activeLoans: approvedActiveCount,
    liquidatedCount,
    fullyLiquidatedLoans: liquidatedCount,
    totalLoans: loans.length,
    employeesInDebtCount: employeesInDebtSet.size,
  };
}

