/**
 * OSDEL TECNOLOGIA - APLICATIVO DA EQUIPA & TÉCNICOS (APK)
 * =========================================================================
 * CONFIGURAÇÃO CENTRALIZADA DA API DO SERVIDOR
 * =========================================================================
 * 
 * Para ligar este aplicativo ao servidor da sua empresa:
 * Altere a variável API_BASE_URL abaixo para o endereço onde está hospedada a API.
 * 
 * Exemplos:
 *  - Servidor na nuvem: 'https://api.osdeltecnologia.ao'
 *  - Servidor em rede local: 'http://192.168.1.100:3000'
 */

export const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://api.osdeltecnologia.ao';

export const APP_CONFIG = {
  appName: 'OSDEL Equipa',
  companyName: 'OSDEL TECNOLOGIA',
  supervisorContact: '+244 945 882 103',
  supportEmail: 'operacoes@osdeltecnologia.ao',
};
