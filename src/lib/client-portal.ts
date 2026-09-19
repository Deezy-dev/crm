/**
 * OSDEL TECNOLOGIA - Portal do Cliente & Serviços Mobile
 * Suporte a Acordos de Pagamento, Tickets de Avaria, Notícias, Contratos e Multicaixa Express
 */

export interface PaymentPromise {
  id: string;
  clientId: number;
  clientName: string;
  clientCode: string;
  phone: string;
  serviceType: 'tv' | 'internet' | 'combo';
  promisedDate: string;
  promisedAmount: number;
  reason: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cumprido';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  operatorNotes?: string;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  clientId: number;
  clientName: string;
  phone: string;
  address: string;
  category: 'sem_sinal_tv' | 'sem_internet' | 'cabo_partido' | 'lentidao' | 'router_los' | 'outros';
  title: string;
  description: string;
  photoUrl?: string;
  status: 'aberto' | 'em_atendimento' | 'tecnico_a_caminho' | 'resolvido';
  priority: 'normal' | 'alta' | 'urgente';
  assignedTechnician?: string;
  createdAt: string;
  updatedAt?: string;
  resolutionNotes?: string;
}

export interface CompanyAnnouncement {
  id: string;
  title: string;
  category: 'manutencao' | 'comunicado' | 'novidade' | 'urgente';
  content: string;
  date: string;
  affectedStreets?: string[];
  bannerUrl?: string;
  active: boolean;
}

const STORAGE_PROMISES = 'osdel_payment_promises';
const STORAGE_TICKETS = 'osdel_support_tickets';
const STORAGE_ANNOUNCEMENTS = 'osdel_announcements';

const SEED_ANNOUNCEMENTS: CompanyAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Manutenção Preventiva da Rede de Fibra Troncal - Bairro Golf I',
    category: 'manutencao',
    content:
      'Informamos todos os estimados clientes das Ruas 12, 13 e adjacências que na próxima quinta-feira, entre as 02h00 e as 05h00, realizaremos uma fusão e limpeza geral nos nossos armários de distribuição para melhorar a estabilidade do sinal. Agradecemos a compreensão.',
    date: '2026-09-14',
    affectedStreets: ['Rua 12', 'Rua 13', 'Rua 14'],
    active: true,
  },
  {
    id: 'ann-2',
    title: 'Novos Canais Digitais adicionados na grelha de TV a Cabo!',
    category: 'novidade',
    content:
      'A OSDEL adicionou 4 novos canais desportivos e de entretenimento em alta definição à nossa rede comunitária de TV por cabo. Faça uma sintonização automática na sua televisão para actualizar a lista de canais sem custos adicionais.',
    date: '2026-09-10',
    active: true,
  },
  {
    id: 'ann-3',
    title: 'Aviso de Pagamento: Liquide até ao dia 5 de cada mês',
    category: 'comunicado',
    content:
      'Lembramos que o período regular de liquidação das mensalidades decorre do dia 1 ao dia 5. Utilize os dados de pagamento por Multicaixa Express indicados no seu aplicativo para evitar filas e garantir a continuidade ininterrupta do seu sinal.',
    date: '2026-09-01',
    active: true,
  },
];

const SEED_PROMISES: PaymentPromise[] = [
  {
    id: 'prom-1',
    clientId: 2,
    clientName: 'Maria Teresa Sebastião',
    clientCode: 'CLI-00002',
    phone: '+244 945 882 103',
    serviceType: 'internet',
    promisedDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    promisedAmount: 6500,
    reason: 'Aguardando pagamento de salário pela entidade patronal até sexta-feira.',
    status: 'aprovado',
    requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewedBy: 'Maria Teresa (Operadora)',
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    operatorNotes: 'Acordo confirmado. Não realizar corte até ao dia acordado.',
  },
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketCode: 'TCK-2024-001',
    clientId: 1,
    clientName: 'António Domingos Pedro',
    phone: '+244 923 456 789',
    address: 'Rua 12, Casa 45B, Bairro Golf I',
    category: 'sem_sinal_tv',
    title: 'Televisão da sala sem sinal desde a manhã',
    description: 'A TV do quarto funciona com algum chuvisco, mas a televisão principal da sala perdeu totalmente o sinal da OSDEL. Conectores parecem firmes.',
    status: 'tecnico_a_caminho',
    priority: 'normal',
    assignedTechnician: 'Mestre Job (Job Batalha)',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// --- GESTÃO DE ACORDOS DE PAGAMENTO ---
export function getStoredPromises(): PaymentPromise[] {
  if (typeof window === 'undefined') return SEED_PROMISES;
  const raw = window.localStorage.getItem(STORAGE_PROMISES);
  if (!raw) {
    window.localStorage.setItem(STORAGE_PROMISES, JSON.stringify(SEED_PROMISES));
    return SEED_PROMISES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_PROMISES;
  }
}

export function savePromises(list: PaymentPromise[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_PROMISES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('osdel-promises-updated', { detail: list }));
  }
}

export function requestPaymentPromise(data: Omit<PaymentPromise, 'id' | 'status' | 'requestedAt'>): PaymentPromise {
  const existing = getStoredPromises();
  const newPromise: PaymentPromise = {
    ...data,
    id: `prom-${Date.now()}`,
    status: 'pendente',
    requestedAt: new Date().toISOString(),
  };
  const updated = [newPromise, ...existing];
  savePromises(updated);
  return newPromise;
}

export function reviewPaymentPromise(
  promiseId: string,
  decision: 'aprovado' | 'rejeitado',
  reviewerName: string,
  notes?: string,
): PaymentPromise | null {
  const list = getStoredPromises();
  let updatedItem: PaymentPromise | null = null;
  const updated = list.map((p) => {
    if (p.id === promiseId) {
      updatedItem = {
        ...p,
        status: decision,
        reviewedBy: reviewerName,
        reviewedAt: new Date().toISOString(),
        operatorNotes: notes || (decision === 'aprovado' ? 'Acordo aceite. Sinal protegido contra cortes.' : 'Acordo recusado.'),
      };
      return updatedItem;
    }
    return p;
  });
  savePromises(updated);
  return updatedItem;
}

export function approvePaymentPromise(
  promiseId: string,
  reviewerName: string,
  notes?: string,
): PaymentPromise | null {
  return reviewPaymentPromise(promiseId, 'aprovado', reviewerName, notes);
}

export function rejectPaymentPromise(
  promiseId: string,
  reviewerName: string,
  notes?: string,
): PaymentPromise | null {
  return reviewPaymentPromise(promiseId, 'rejeitado', reviewerName, notes);
}

// --- GESTÃO DE TICKETS DE SUPORTE ---
export function getStoredTickets(): SupportTicket[] {
  if (typeof window === 'undefined') return SEED_TICKETS;
  const raw = window.localStorage.getItem(STORAGE_TICKETS);
  if (!raw) {
    window.localStorage.setItem(STORAGE_TICKETS, JSON.stringify(SEED_TICKETS));
    return SEED_TICKETS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_TICKETS;
  }
}

export function saveTickets(list: SupportTicket[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_TICKETS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('osdel-tickets-updated', { detail: list }));
  }
}

export function createSupportTicket(data: Omit<SupportTicket, 'id' | 'ticketCode' | 'status' | 'createdAt'>): SupportTicket {
  const existing = getStoredTickets();
  const nextNum = existing.length + 1;
  const year = new Date().getFullYear();
  const ticketCode = `TCK-${year}-${String(nextNum).padStart(3, '0')}`;
  const newTicket: SupportTicket = {
    ...data,
    id: `tkt-${Date.now()}`,
    ticketCode,
    status: 'aberto',
    createdAt: new Date().toISOString(),
  };
  const updated = [newTicket, ...existing];
  saveTickets(updated);
  return newTicket;
}

// --- GESTÃO DE COMUNICADOS / NOTÍCIAS ---
export function getStoredAnnouncements(): CompanyAnnouncement[] {
  if (typeof window === 'undefined') return SEED_ANNOUNCEMENTS;
  const raw = window.localStorage.getItem(STORAGE_ANNOUNCEMENTS);
  if (!raw) {
    window.localStorage.setItem(STORAGE_ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    return SEED_ANNOUNCEMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_ANNOUNCEMENTS;
  }
}
