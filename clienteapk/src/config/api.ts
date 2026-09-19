/**
 * OSDEL TECNOLOGIA - APLICATIVO DO CLIENTE (APK)
 * =========================================================================
 * CONFIGURAÇÃO CENTRALIZADA DA API DO SERVIDOR
 * =========================================================================
 * 
 * Para ligar este aplicativo ao seu servidor de produção ou servidor local:
 * Altere a variável API_BASE_URL abaixo para o endereço onde está hospedada a sua API.
 * 
 * Exemplos:
 *  - Servidor na nuvem: 'https://api.osdeltecnologia.ao'
 *  - Servidor de testes: 'https://meu-servidor-osdel.com'
 *  - Em rede local (Wi-Fi): 'http://192.168.1.100:3000'
 */

export const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://api.osdeltecnologia.ao';

export const APP_CONFIG = {
  appName: 'OSDEL Cliente',
  companyName: 'OSDEL TECNOLOGIA',
  supportPhone: '+244 945 882 103',
  supportEmail: 'apoio@osdeltecnologia.ao',
  officeHours: 'Segunda a Sábado, 08h00 - 18h00',
  defaultDueDay: 5,
};
