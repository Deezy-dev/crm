/**
 * OSDEL TECNOLOGIA - GESTOR CENTRAL DE LOGOTIPO DA EMPRESA
 * Permite actualizar o logotipo em tempo real por upload ou URL,
 * reflectindo instantaneamente no cabeçalho, sidebar e em todos os documentos/PDFs.
 */

const LOGO_STORAGE_KEY = 'osdel_company_logo';
const DEFAULT_LOGO_URL = '/osdel-logo.jpg';

export function getCompanyLogo(customUrl?: string): string {
  if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0) {
    return customUrl;
  }
  if (typeof window === 'undefined') return DEFAULT_LOGO_URL;
  try {
    const custom = localStorage.getItem(LOGO_STORAGE_KEY);
    return custom && custom.trim().length > 0 ? custom : DEFAULT_LOGO_URL;
  } catch {
    return DEFAULT_LOGO_URL;
  }
}

export function setCompanyLogo(logoDataUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, logoDataUrl);
    window.dispatchEvent(new CustomEvent('osdel-logo-updated', { detail: { logoUrl: logoDataUrl } }));
  } catch (err) {
    console.error('Erro ao guardar logotipo:', err);
  }
}

export const saveCompanyLogo = setCompanyLogo;

export function resetCompanyLogo(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('osdel-logo-updated', { detail: { logoUrl: DEFAULT_LOGO_URL } }));
  } catch (err) {
    console.error('Erro ao repor logotipo padrão:', err);
  }
}
