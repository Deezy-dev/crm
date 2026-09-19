/**
 * OSDEL TECNOLOGIA - Configuração Centralizada de API e Ambientes
 *
 * Este ficheiro centraliza a URL da API do sistema e das aplicações móveis.
 * Pode ser editado aqui directamente, através de variáveis de ambiente (.env)
 * ou em tempo de execução através da interface de administração.
 */

// Chave utilizada no armazenamento local para permitir alterar a URL em tempo de execução
const STORAGE_KEY_API_URL = 'osdel_api_base_url';
const STORAGE_KEY_API_MODE = 'osdel_api_mode';

// URL padrão da API (Pode alterar para o seu domínio final: ex. https://api.osdel.co.ao)
export const DEFAULT_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://api.osdeltecnologia.ao';

export type ApiMode = 'local_offline' | 'remote_hybrid' | 'production_api';

/**
 * Obtém a URL da API activa actualmente no sistema
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY_API_URL);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }
  return DEFAULT_API_URL;
}

/**
 * Guarda uma nova URL de API (ex: quando o utilizador decide onde hospedar o servidor)
 */
export function setApiBaseUrl(newUrl: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = newUrl.trim().replace(/\/$/, '');
    window.localStorage.setItem(STORAGE_KEY_API_URL, cleanUrl);
    window.dispatchEvent(new CustomEvent('osdel-api-url-changed', { detail: cleanUrl }));
  }
}

export const setCustomApiBaseUrl = setApiBaseUrl;

export function resetApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY_API_URL);
    window.dispatchEvent(new CustomEvent('osdel-api-url-changed', { detail: DEFAULT_API_URL }));
  }
}

export function isUsingCustomApi(): boolean {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY_API_URL);
    return Boolean(saved && saved.trim() && saved.trim() !== DEFAULT_API_URL);
  }
  return false;
}

/**
 * Obtém o modo de conexão da API
 */
export function getApiMode(): ApiMode {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY_API_MODE) as ApiMode;
    if (saved) return saved;
  }
  return 'local_offline'; // Padrão seguro sem necessidade de servidor externo imediato
}

/**
 * Define o modo de conexão da API
 */
export function setApiMode(mode: ApiMode): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY_API_MODE, mode);
    window.dispatchEvent(new CustomEvent('osdel-api-mode-changed', { detail: mode }));
  }
}

/**
 * Catálogo de Endpoints da API OSDEL
 */
export const API_ENDPOINTS = {
  // Autenticação & Sessão
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_CLIENT_LOGIN: '/api/v1/auth/client-login',
  AUTH_VERIFY: '/api/v1/auth/verify',

  // Clientes & Contratos
  CLIENTS: '/api/v1/clients',
  CLIENT_DETAILS: (id: number | string) => `/api/v1/clients/${id}`,
  CLIENT_CONTRACT: (clientId: number | string) => `/api/v1/clients/${clientId}/contract`,
  CLIENT_PAYMENTS: (clientId: number | string) => `/api/v1/clients/${clientId}/payments`,
  CLIENT_PROMISES: '/api/v1/payment-promises',
  CLIENT_TICKETS: '/api/v1/support-tickets',

  // Ordens de Serviço & Piquetes
  SERVICE_ORDERS: '/api/v1/service-orders',
  TEAM_MISSIONS: '/api/v1/team-missions',
  MISSION_CUTS_BY_STREET: '/api/v1/team-missions/cuts-by-street',
  MISSION_COMPLETE_TASK: (missionId: string, taskId: string) => `/api/v1/team-missions/${missionId}/tasks/${taskId}/complete`,

  // Agenda & Rotinas
  SCHEDULE_EVENTS: '/api/v1/schedule/events',
  SCHEDULE_TEMPLATES: '/api/v1/schedule/templates',

  // Notícias & Comunicados
  ANNOUNCEMENTS: '/api/v1/announcements',

  // Colaboradores & Folha Salarial
  TEAM_MEMBERS: '/api/v1/team/members',
  MY_SALARY: '/api/v1/team/my-salary',
  BANK_ACCOUNTS: '/api/v1/company/bank-accounts',
};
