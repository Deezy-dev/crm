/**
 * OSDEL TECNOLOGIA - GERADOR DE CREDENCIAIS DE ACESSO MOBILE (APK CLIENTE)
 * Permite gerar e imprimir códigos de contrato, PINs numéricos de 4 dígitos
 * e senhas de acesso para os clientes entrarem no seu aplicativo Android.
 */

export interface ClientCredentials {
  clientId: number;
  clientCode: string;
  clientName: string;
  phone: string;
  pin: string; // 4 dígitos
  password?: string;
  generatedAt: string;
  generatedBy: string;
  isActive: boolean;
}

const CLIENT_CREDS_STORAGE_KEY = 'osdel_client_credentials';

const SEED_CREDENTIALS: Record<number, ClientCredentials> = {
  1: {
    clientId: 1,
    clientCode: 'CLI-00001',
    clientName: 'António Domingos Pedro',
    phone: '+244 923 456 789',
    pin: '4821',
    password: 'osdel#antonio',
    generatedAt: '2024-01-10T10:00:00Z',
    generatedBy: 'Albert (deezy)',
    isActive: true,
  },
  2: {
    clientId: 2,
    clientCode: 'CLI-00002',
    clientName: 'Maria Teresa Sebastião',
    phone: '+244 945 882 103',
    pin: '7732',
    password: 'osdel#maria',
    generatedAt: '2024-02-15T11:30:00Z',
    generatedBy: 'Albert (deezy)',
    isActive: true,
  },
  3: {
    clientId: 3,
    clientCode: 'CLI-00003',
    clientName: 'Mateus Manuel da Silva',
    phone: '+244 926 555 777',
    pin: '1094',
    password: 'osdel#mateus',
    generatedAt: '2024-03-05T09:20:00Z',
    generatedBy: 'Albert (deezy)',
    isActive: true,
  },
  4: {
    clientId: 4,
    clientCode: 'CLI-00004',
    clientName: 'Joaquim Bernardo Afonso',
    phone: '+244 931 774 219',
    pin: '5561',
    password: 'osdel#joaquim',
    generatedAt: '2024-03-12T14:15:00Z',
    generatedBy: 'Albert (deezy)',
    isActive: true,
  },
};

export function getAllClientCredentials(): Record<number, ClientCredentials> {
  if (typeof window === 'undefined') return SEED_CREDENTIALS;
  try {
    const raw = localStorage.getItem(CLIENT_CREDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_CREDS_STORAGE_KEY, JSON.stringify(SEED_CREDENTIALS));
      return SEED_CREDENTIALS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CREDENTIALS;
  }
}

export function getClientCredentials(clientId: number): ClientCredentials | null {
  const all = getAllClientCredentials();
  return all[clientId] || null;
}

export function generateOrResetClientCredentials(
  client: { id?: any; code?: any; fullName?: any; name?: any; phone?: any; [key: string]: any },
  generatedByName = 'Operador OSDEL',
): ClientCredentials {
  const all = getAllClientCredentials();
  const cId = Number(client.id || 0);
  const cCode = String(client.code || `CLI-${String(cId).padStart(5, '0')}`);
  const cName = String(client.fullName || client.name || 'Cliente');
  const cPhone = String(client.phone || '');

  // Generate random 4-digit PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const cleanName = cName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) || 'cliente';
  const password = `osdel@${cleanName}`;

  const newCreds: ClientCredentials = {
    clientId: cId,
    clientCode: cCode,
    clientName: cName,
    phone: cPhone,
    pin,
    password,
    generatedAt: new Date().toISOString(),
    generatedBy: generatedByName,
    isActive: true,
  };

  all[cId] = newCreds;
  try {
    localStorage.setItem(CLIENT_CREDS_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('osdel-client-creds-updated', { detail: { clientId: cId } }));
  } catch (err) {
    console.error('Erro ao salvar credenciais do cliente:', err);
  }

  return newCreds;
}

export function verifyClientLogin(
  identifier: string, // Code (CLI-00001) or phone (+244923456789 or 923456789)
  pinOrPassword: string,
): { success: boolean; credentials?: ClientCredentials; message: string } {
  const all = getAllClientCredentials();
  const cleanId = identifier.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPin = pinOrPassword.trim();

  const found = Object.values(all).find((creds) => {
    const matchCode = creds.clientCode.toLowerCase() === cleanId;
    const matchPhone = creds.phone.replace(/[^0-9]/g, '').endsWith(cleanId.replace(/[^0-9]/g, ''));
    return matchCode || matchPhone;
  });

  if (!found) {
    return {
      success: false,
      message: 'Cliente não encontrado. Verifique o código de contrato (ex: CLI-00001) ou o número de telefone.',
    };
  }

  if (!found.isActive) {
    return {
      success: false,
      message: 'Acesso do cliente desactivado pela administração da OSDEL.',
    };
  }

  if (found.pin === cleanPin || (found.password && found.password === cleanPin)) {
    return {
      success: true,
      credentials: found,
      message: 'Autenticação bem-sucedida.',
    };
  }

  return {
    success: false,
    message: 'PIN ou Senha de acesso incorrecta. Solicite a reemissão ao suporte da OSDEL.',
  };
}
