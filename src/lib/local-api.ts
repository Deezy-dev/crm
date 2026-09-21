import { useMutation, useQuery } from '@tanstack/react-query';

export type AnyRecord = Record<string, any>;

const seedClients: AnyRecord[] = [
  {
    id: 1,
    code: 'CLI-00001',
    fullName: 'António Domingos Pedro',
    phone: '+244 923 456 789',
    alternatePhone: '+244 992 111 222',
    email: 'antonio.pedro@gmail.com',
    address: 'Rua 12, Casa 45B, Bairro Golf I',
    neighborhood: 'Golf I, Kilamba Kiaxi',
    documentNumber: '004829104LA041',
    houseCode: 'G1-C45B',
    pdoNumber: 'PDO-04',
    onuNumber: '',
    serviceType: 'tv',
    status: 'active',
    createdAt: '2024-01-10',
    notes: 'Cliente antigo de TV a Cabo. Pagamento sempre regular até dia 5.',
  },
  {
    id: 2,
    code: 'CLI-00002',
    fullName: 'Maria Teresa Sebastião',
    phone: '+244 945 882 103',
    alternatePhone: '',
    email: 'mteresa.sebastiao@hotmail.com',
    address: 'Rua Principal, Vivenda 12, Palanca',
    neighborhood: 'Palanca, Kilamba Kiaxi',
    documentNumber: '007193845LA039',
    houseCode: 'PAL-V12',
    pdoNumber: 'PDO-02',
    onuNumber: 'ONU-OSD-8821',
    serviceType: 'internet',
    status: 'late',
    createdAt: '2024-02-15',
    notes: 'Sinal de internet em atraso. Enviar alerta antes do corte definitivo.',
  },
  {
    id: 3,
    code: 'CLI-00003',
    fullName: 'Mateus Manuel da Silva',
    phone: '+244 926 555 777',
    alternatePhone: '+244 912 333 444',
    email: null,
    address: 'Bloco B, Prédio 4, Apt 201, Talatona',
    neighborhood: 'Talatona',
    documentNumber: '009283741LA045',
    houseCode: 'TAL-B4-201',
    pdoNumber: 'PDO-08',
    onuNumber: 'ONU-OSD-5577',
    serviceType: 'combo',
    status: 'active',
    createdAt: '2024-03-05',
    notes: 'PEDIDO DE NÃO CORTE — acordado pagamento via transferência bancária.',
  },
  {
    id: 4,
    code: 'CLI-00004',
    fullName: 'Joaquim Bernardo Afonso',
    phone: '+244 931 774 219',
    alternatePhone: '',
    email: null,
    address: 'Rua Direita, Casa 8, Golf II',
    neighborhood: 'Golf II',
    documentNumber: '002948172LA028',
    houseCode: 'G2-C08',
    pdoNumber: 'PDO-01',
    onuNumber: '',
    serviceType: 'tv',
    status: 'suspended',
    createdAt: '2023-11-20',
    notes: 'Ultrapassou 3 meses sem pagamento. Requer renovação de contrato (10.000 Kz) para religar.',
  },
];

const seedPayments: AnyRecord[] = [
  {
    id: 1,
    clientId: 1,
    amount: 4000,
    penalty: 0,
    paymentMonth: new Date().toISOString().slice(0, 7),
    paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    method: 'multicaixa',
    reference: 'MCX-94821',
    operator: 'deezy',
  },
  {
    id: 2,
    clientId: 3,
    amount: 10500,
    penalty: 0,
    paymentMonth: new Date().toISOString().slice(0, 7),
    paidAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    method: 'transferência',
    reference: 'TRF-BFA-00492',
    operator: 'deezy',
  },
  {
    id: 3,
    clientId: 2,
    amount: 6500,
    penalty: 1000,
    paymentMonth: '2024-05',
    paidAt: '2024-05-12T10:30:00Z',
    method: 'multicaixa',
    reference: 'MCX-38291',
    operator: 'deezy',
  },
];

const seedContracts: AnyRecord[] = [
  {
    id: 1,
    clientId: 1,
    planName: 'TV a Cabo Comunitária',
    planSpeed: 'Sinal Digital RF',
    monthlyPrice: 4000,
    startDate: '2024-01-10',
    endDate: null,
    dueDay: 5,
    status: 'active',
    terms: 'Contrato TV a Cabo Comunitária OSDEL. Mensalidade de 4.000 Kz paga de 1 a 5 de cada mês.',
  },
  {
    id: 2,
    clientId: 2,
    planName: 'Fibra 10',
    planSpeed: '10 Mbps/s',
    monthlyPrice: 6500,
    startDate: '2024-02-15',
    endDate: null,
    dueDay: 5,
    status: 'active',
    terms: 'Internet Fibra Óptica OSDEL de alta velocidade.',
  },
  {
    id: 3,
    clientId: 3,
    planName: 'Combo Fibra 22 + TV',
    planSpeed: '22 Mbps/s',
    monthlyPrice: 12500,
    startDate: '2024-03-05',
    endDate: null,
    dueDay: 5,
    status: 'active',
    terms: 'Pacote Integrado TV a Cabo + Internet Fibra OSDEL.',
  },
  {
    id: 4,
    clientId: 4,
    planName: 'TV a Cabo Comunitária',
    planSpeed: 'Sinal Digital RF',
    monthlyPrice: 4000,
    startDate: '2023-11-20',
    endDate: null,
    dueDay: 5,
    status: 'suspended',
    terms: 'Contrato suspenso por falta de pagamento prolongada (superior a 3 meses).',
  },
];

const seedSettings: AnyRecord = {
  companyName: 'OSDEL TECNOLOGIA',
  companyNif: '5600857127',
  companyPhone: '926 153 736 / 992 854 740',
  companyPhone2: '926 153 736',
  companySupportPhone: '992 854 740',
  companyWhatsApp: '+244 926 153 736',
  companyEmail: 'comercial@osdeltecnologia.ao',
  companyWebsite: 'www.osdeltecnologia.ao',
  companyAddress: 'Rua 12, Bairro Golf I, Kilamba Kiaxi, Luanda',
  companySubtitle: 'TV CABO COMUNITÁRIA · INTERNET FIBRA',
  currency: 'Kz',
  defaultMonthlyPrice: 4000,
  tvMonthlyPrice: 4000,
  tvExtraPrice: 1000,
  connectionFee: 15000,
  cableIncludedMeters: 25,
  extraMeterPrice: 250,
  paymentDueDay: 5,
  latePenalty: 1000,
  toleranceDays: 3,
  suspensionAfterMonths: 3,
  renewalFee: 10000,
  transferFee: 3000,
  reconnectionFee: 2500,
  derivationFee: 7000,
  dailyGuarantee: 150,
  urgentInstallationFee: 2000,
  installationWindowHours: 48,
  serviceRecoveryHours: 72,
  supportHours: 'Segunda a sexta, 09h00–15h00 · Sábado, 08h00–11h00',
  // Bank accounts
  bank1Name: 'Banco BAI',
  bank1Holder: 'OSDEL TECNOLOGIA LDA',
  bank1Iban: 'AO06.0040.0000.1234.5678.9012.3',
  bank1Account: '1234567810',
  bank2Name: 'Banco BFA',
  bank2Holder: 'OSDEL TECNOLOGIA LDA',
  bank2Iban: 'AO06.0006.0000.9876.5432.1098.7',
  bank2Account: '9876543210',
  // Invoice & Documents
  invoicePrefix: 'FT',
  receiptPrefix: 'FR',
  proformaPrefix: 'FP',
  contractPrefix: 'CT',
  taxRetentionRate: 0,
  taxExemptionReason: 'Isento nos termos do Art. 12 do CIVA - Regime de Exclusão',
  invoiceFooter: 'Documento emitido pelo sistema de gestão da OSDEL TECNOLOGIA. Processado por computador. Válido com carimbo oficial.',
  termsAndConditions: 'Garantia técnica de 30 dias na instalação. O atraso no pagamento após o dia 5 acarreta multa contratual de 1.000 Kz.',
  contractIntro: 'A TV comunitária e Internet fibra Osdel é uma rede voltada à comunidade, com informação, entretenimento, actualidade e conectividade de alta velocidade.',
  invoiceTemplate: 'recibo-pagamento',
  contractTemplate: 'termos-adesao-osdel',
  // Messaging & Automation
  smsEnabled: true,
  smsProvider: 'BulkSMS Angola / Unitel API',
  smsApiUrl: 'https://api.bulksmsangola.ao/v2/messages',
  smsSender: 'OSDEL',
  automaticReminderEnabled: true,
  reminderDaysBeforeDue: 2,
  whatsappEnabled: true,
  whatsappGateway: 'https://api.whatsapp.com/send',
  logoUrl: '/osdel-logo.jpg',
  internetPlans: [
    { id: 'fibra-10', name: 'Fibra 10', speed: '10 Mbps/s', price: 6500 },
    { id: 'fibra-22', name: 'Fibra 22', speed: '22 Mbps/s', price: 8500 },
    { id: 'fibra-50', name: 'Fibra 50', speed: '50 Mbps/s', price: 12000 },
    { id: 'fibra-100', name: 'Fibra 100', speed: '100 Mbps/s', price: 20000 },
  ],
  // Pacotes de TV por Cabo Comunitária
  tvPackages: [
    { id: 'tv-basico', name: 'Pacote Básico Comunitário', channelsCount: 35, price: 4000, maxTvs: 1, description: 'Sinal digital RF com canais essenciais (TPA, Zap Viva, Record, SIC, Globo, Desporto).', active: true },
    { id: 'tv-familia', name: 'Pacote Família Digital', channelsCount: 60, price: 6500, maxTvs: 2, description: 'Canais infantis, novelas, filmes e entretenimento para até 2 televisores.', active: true },
    { id: 'tv-premium', name: 'Pacote Premium Desporto & Filmes', channelsCount: 90, price: 9500, maxTvs: 2, description: 'Transmissões desportivas ao vivo (Girabola, Premier League, UEFA), cinema e séries HD.', active: true },
    { id: 'tv-comercial', name: 'Pacote Comercial / Estabelecimentos', channelsCount: 50, price: 15000, maxTvs: 4, description: 'Licença pública para bares, restaurantes e estabelecimentos comerciais.', active: true },
  ],
  // Bairros e Zonas de Cobertura
  coverageNeighborhoods: [
    { id: 'bairro-1', name: 'Golf I', sector: 'Sector Central & Rua 12', pdosCount: 24, status: 'ativo', notes: 'Sede e centro de transmissão principal' },
    { id: 'bairro-2', name: 'Golf II', sector: 'Zonas A, B e C', pdosCount: 18, status: 'ativo', notes: 'Alta densidade de clientes fibra e TV' },
    { id: 'bairro-3', name: 'Palanca', sector: 'Palanca 1 & 2', pdosCount: 16, status: 'ativo', notes: 'Backbone interligado via anel óptico' },
    { id: 'bairro-4', name: 'Kilamba Kiaxi', sector: 'Sede Municipal', pdosCount: 30, status: 'ativo', notes: 'Infraestrutura com OLT redundante' },
    { id: 'bairro-5', name: 'Sapú', sector: 'Sapú 1 & 2', pdosCount: 12, status: 'ativo', notes: 'Expansão recente de rede primária' },
    { id: 'bairro-6', name: 'Rocha Pinto', sector: 'Encosta & Parte Alta', pdosCount: 14, status: 'ativo', notes: 'Rede mista coaxial e fibra FTTH' },
    { id: 'bairro-7', name: 'Vila Estoril', sector: 'Projecto Novo', pdosCount: 8, status: 'expansao', notes: 'Lançamento de cabos de 48 FO em curso' },
  ],
  // Parâmetros de Rede & FTTH
  oltIp: '10.200.0.1',
  oltModel: 'Huawei SmartAX EA5800 / ZTE C320 GPON',
  oltUplinkSpeed: '10 Gbps SFP+',
  routerOsIp: '10.200.0.254',
  routerOsApiPort: 8728,
  dnsPrimary: '1.1.1.1',
  dnsSecondary: '8.8.8.8',
  dnsSecondaryAlternative: '208.67.222.222',
  pppoePoolRange: '100.64.10.1 - 100.64.13.254',
  publicIpPool: '102.164.x.0/28 (IP Transit Angola Cables)',
  onuManagementSubnet: '192.168.100.0/24',
  opticalIdealPowerRx: '-19 dBm',
  opticalMinPowerRx: '-25 dBm',
  opticalCriticalPowerRx: '-27 dBm',
  rfInitialFrequencyMhz: 306,
  rfModulation: 'DVB-C 256-QAM',
  rfTargetPowerDbuv: '65 - 75 dBuV',
  clientCodePrefix: 'CLI-',
  onuPrefix: 'ONU-',
  pdoPrefix: 'PDO-',
  // Políticas de Acordos e Fidelização
  maxInstallments: 4,
  minInitialPaymentPercentage: 30,
  provisionalReconnectionAllowed: true,
  autoCancelGraceDays: 3,
  semiannualDiscountPercentage: 5,
  annualDiscountPercentage: 10,
  neighborReferralDiscountKz: 1000,
  // Equipa de Campo & Piquete
  installationAllowanceKz: 2500,
  recoveryBonusKz: 1000,
  maxDailyOrdersPerTeam: 6,
  fieldWarrantyDays: 30,
  emergencyResponseHours: 2,
  dailyToolInspectionRequired: true,
  // Modelos de Mensagens
  templateReminderBefore: 'Olá {cliente}, lembramos que a mensalidade do seu serviço OSDEL vence dia {vencimento} no valor de {valor}. Pague por Multicaixa Express ou no nosso balcão para evitar interrupções.',
  templateDueToday: 'OSDEL: A sua mensalidade de {valor} vence hoje ({vencimento}). Referência de pagamento: {referencia}. IBAN BAI: {iban}. Obrigado pela preferência!',
  templateCutWarning: 'Aviso OSDEL: O prazo de tolerância expirou. Evite o corte do sinal e a taxa de religação liquidando hoje o valor de {valor}. Apoio: 926 153 736.',
  templatePaymentConfirmation: 'OSDEL: Confirmamos a recepção do seu pagamento de {valor} referente a {mes}. O seu sinal encontra-se regularizado. Recibo n.º {recibo}.',
  templateWelcome: 'Bem-vindo à OSDEL Tecnologia, {cliente}! A sua adesão ao serviço ({plano}) foi concluída com sucesso. Apoio técnico: 926 153 736.',
  // Fiscalidade AGT
  agtCertificateNumber: 'AGT-CERT/2024/0981',
  agtSoftwareVersion: 'OSDEL v2.4-AO',
  fiscalSeries: '2026/A',
  withholdingTaxRate: 6.5,
  ivaExemptionReason: 'Regime de Exclusão nos termos do Artigo 12.º do Código do Imposto sobre o Valor Acrescentado (CIVA).',
  // Segurança & Sessão
  sessionTimeoutMinutes: 60,
  minPasswordLength: 6,
  requireAdminPasswordForDeletions: true,
  maintenanceMode: false,
  maxFailedLogins: 5,
  auditRetentionDays: 365,
};

export interface JobRole {
  id: number;
  title: string;
  department: 'Técnico' | 'Atendimento' | 'TI / NOC' | 'Administração' | 'Direcção' | 'Logística';
  baseSalaryMin: number;
  baseSalaryMax: number;
  permissionLevel: 'admin' | 'operador' | 'tecnico' | 'leitura';
  description: string;
  isCustom?: boolean;
}

export interface CashClosure {
  id: number;
  closureCode?: string;
  code?: string;
  date: string;
  periodType?: 'diario' | 'semanal' | 'mensal';
  shiftName?: string;
  shift?: string;
  openedAt?: string;
  closedAt?: string;
  operator: string;
  operatorName?: string;
  initialCashAmount?: number;
  openingCash?: number;
  physicalCashCounted?: number;
  countedCash?: number;
  expectedCash?: number;
  difference?: number;
  status: 'pendente_validacao' | 'validado_admin' | 'rejeitado' | 'validado' | 'pendente';
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
  adminNotes?: string;
  breakdowns?: {
    cash?: number;
    multicaixaTpa?: number;
    mcxExpress?: number;
    transferBai?: number;
    transferBfa?: number;
  };
  banknotesBreakdown?: Record<string, number>;
  totalIn?: number;
  totalOut?: number;
  totalRevenue?: number;
  totalExpenses?: number;
  cashIn?: number;
  tpaIn?: number;
  expressIn?: number;
  transferIn?: number;
  withdrawals?: number;
  [key: string]: any;
}

const seedJobRoles: JobRole[] = [
  {
    id: 1,
    title: 'Mestre de Rede (Técnico Sénior)',
    department: 'Técnico',
    permissionLevel: 'tecnico',
    baseSalaryMin: 180000,
    baseSalaryMax: 260000,
    description: 'Líder técnico de infraestrutura, fusão de fibra óptica, alinhamento de troncal e coordenação de piquetes.',
  },
  {
    id: 2,
    title: 'Técnico Instalador Fibra & TV',
    department: 'Técnico',
    permissionLevel: 'tecnico',
    baseSalaryMin: 120000,
    baseSalaryMax: 170000,
    description: 'Lançamento de cabos drop, conectorização óptica/coaxial, instalação de ONUs e derivações nas casas.',
  },
  {
    id: 3,
    title: 'Ajudante do Mestre (Aprendiz)',
    department: 'Técnico',
    permissionLevel: 'tecnico',
    baseSalaryMin: 70000,
    baseSalaryMax: 100000,
    description: 'Auxiliar nas instalações de rua, apoio em escadas, manuseio de ferramentas e puxamento de cabos.',
  },
  {
    id: 4,
    title: 'Secretária & Operadora de Atendimento',
    department: 'Atendimento',
    permissionLevel: 'operador',
    baseSalaryMin: 110000,
    baseSalaryMax: 160000,
    description: 'Atendimento ao público, cobranças, emissão de faturas e recibos, fecho de caixa e agendamento de OS.',
  },
  {
    id: 5,
    title: 'Secretária Administrativa & Contratos',
    department: 'Administração',
    permissionLevel: 'operador',
    baseSalaryMin: 130000,
    baseSalaryMax: 180000,
    description: 'Elaboração e arquivo de contratos, gestão documental, apoio financeiro e relacionamento com fornecedores.',
  },
  {
    id: 6,
    title: 'Recepcionista',
    department: 'Atendimento',
    permissionLevel: 'operador',
    baseSalaryMin: 85000,
    baseSalaryMax: 115000,
    description: 'Recepção de clientes no balcão, triagem de pedidos, esclarecimento de dúvidas e encaminhamento de chamadas.',
  },
  {
    id: 7,
    title: 'Informático - Programador Júnior',
    department: 'TI / NOC',
    permissionLevel: 'operador',
    baseSalaryMin: 150000,
    baseSalaryMax: 220000,
    description: 'Manutenção do sistema web, testes de conectividade, suporte a computadores e impressoras da empresa.',
  },
  {
    id: 8,
    title: 'Informático - Programador Fullstack',
    department: 'TI / NOC',
    permissionLevel: 'admin',
    baseSalaryMin: 280000,
    baseSalaryMax: 450000,
    description: 'Desenvolvimento das aplicações OSDEL, backend, integrações de APIs bancárias e preparação do app mobile.',
  },
  {
    id: 9,
    title: 'Informático - Engenheiro Sénior / NOC',
    department: 'TI / NOC',
    permissionLevel: 'admin',
    baseSalaryMin: 400000,
    baseSalaryMax: 650000,
    description: 'Gestão de servidores centrais, OLT Huawei GPON, roteadores MikroTik Core, rotas BGP e monitorização de tráfego.',
  },
  {
    id: 10,
    title: 'Administrador de Sistemas & Redes',
    department: 'TI / NOC',
    permissionLevel: 'admin',
    baseSalaryMin: 320000,
    baseSalaryMax: 500000,
    description: 'Supervisão da infraestrutura informática, políticas de segurança, gestão de utilizadores e cópias de segurança.',
  },
  {
    id: 11,
    title: 'Gerente Operacional',
    department: 'Direcção',
    permissionLevel: 'admin',
    baseSalaryMin: 350000,
    baseSalaryMax: 550000,
    description: 'Coordenação operacional geral, supervisão de campo, controlo de compras e cumprimento de SLAs.',
  },
  {
    id: 12,
    title: 'Director Geral',
    department: 'Direcção',
    permissionLevel: 'admin',
    baseSalaryMin: 600000,
    baseSalaryMax: 1200000,
    description: 'Direcção executiva, liderança corporativa, estratégia de expansão e representação legal da OSDEL Tecnologia.',
  },
];

const seedUsers: AnyRecord[] = [
  {
    id: 1,
    username: 'deezy',
    name: 'Albert (Administrador Geral)',
    role: 'admin',
    password: '52863400',
    active: true,
    jobTitle: 'Director Geral',
    jobRoleId: 12,
    department: 'Direcção',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    biNumber: '004819284LA042',
    age: 34,
    birthDate: '1992-05-18',
    gender: 'Masculino',
    phone: '926 153 736',
    whatsapp: '926 153 736',
    email: 'albert.geral@osdeltecnologia.ao',
    address: 'Golf I, Rua 12, Kilamba Kiaxi, Luanda',
    salaryBase: 650000,
    foodAllowance: 50000,
    transportAllowance: 45000,
    bankIban: 'AO06.0040.0000.1111.2222.3333.4',
    admissionDate: '2021-02-01',
    contractType: 'Efectivo',
    workStatus: 'disponivel',
    currentTask: 'Supervisão Geral das Operações, Fechos Financeiros e Estratégia de Expansão',
    schedule: [
      {
        id: 'sch-1',
        time: '08:30 - 10:00',
        title: 'Reunião de Alinhamento com Piquete Técnico',
        clientName: 'Equipa de Campo OSDEL',
        location: 'Base Operacional Golf I',
        priority: 'alta',
        status: 'concluida',
      },
      {
        id: 'sch-2',
        time: '11:00 - 12:30',
        title: 'Auditoria de Fechos de Caixa e Conciliação Bancária',
        clientName: 'Contabilidade Interna',
        location: 'Escritório Geral',
        priority: 'alta',
        status: 'em_curso',
      },
      {
        id: 'sch-3',
        time: '15:00 - 16:30',
        title: 'Negociação com Provedor de Link de Fibra Dedicado',
        clientName: 'Unitel / Angola Cables',
        location: 'Sede Comercial',
        priority: 'normal',
        status: 'pendente',
      },
    ],
  },
  {
    id: 2,
    username: 'operador1',
    name: 'Maria Teresa dos Santos',
    role: 'operador',
    password: '123',
    active: true,
    jobTitle: 'Secretária & Operadora de Atendimento',
    jobRoleId: 4,
    department: 'Atendimento',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    biNumber: '007291845LA031',
    age: 27,
    birthDate: '1999-08-14',
    gender: 'Feminino',
    phone: '992 854 740',
    whatsapp: '992 854 740',
    email: 'maria.teresa@osdeltecnologia.ao',
    address: 'Palanca, Rua Principal, Luanda',
    salaryBase: 145000,
    foodAllowance: 30000,
    transportAllowance: 25000,
    bankIban: 'AO06.0006.0000.4444.5555.6666.7',
    admissionDate: '2022-06-15',
    contractType: 'Efectivo',
    workStatus: 'disponivel',
    currentTask: 'Atendimento e Cobrança no Balcão Central e Emissão de Recibos',
    schedule: [
      {
        id: 'sch-4',
        time: '08:00 - 12:30',
        title: 'Atendimento Presencial e Recepção de Pagamentos em Numerário/TPA',
        clientName: 'Clientes em Balcão',
        location: 'Balcão de Atendimento Golf I',
        priority: 'alta',
        status: 'em_curso',
      },
      {
        id: 'sch-5',
        time: '14:00 - 16:30',
        title: 'Contactos Telefónicos para Acordos de Regularização de Atrasos',
        clientName: 'Clientes em Atraso',
        location: 'Central de Apoio',
        priority: 'normal',
        status: 'pendente',
      },
      {
        id: 'sch-6',
        time: '16:30 - 17:00',
        title: 'Preparação do Termo de Fecho de Caixa Diário',
        clientName: 'Caixa Geral',
        location: 'Tesouraria',
        priority: 'alta',
        status: 'pendente',
      },
    ],
  },
  {
    id: 3,
    username: 'carlos.mestre',
    name: 'Carlos Manuel Batalha',
    role: 'operador',
    password: '123',
    active: true,
    jobTitle: 'Mestre de Rede (Técnico Sénior)',
    jobRoleId: 1,
    department: 'Técnico',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    biNumber: '003819274LA029',
    age: 39,
    birthDate: '1987-03-22',
    gender: 'Masculino',
    phone: '923 881 920',
    whatsapp: '923 881 920',
    email: 'carlos.batalha@osdeltecnologia.ao',
    address: 'Sapú, Kilamba Kiaxi, Luanda',
    salaryBase: 240000,
    foodAllowance: 35000,
    transportAllowance: 30000,
    bankIban: 'AO06.0040.0000.7777.8888.9999.0',
    admissionDate: '2021-03-10',
    contractType: 'Efectivo',
    workStatus: 'em_campo',
    currentTask: 'Fusão de Fibra na Caixa CTO-04 e Re-alinhamento da Troncal Principal',
    schedule: [
      {
        id: 'sch-7',
        time: '08:00 - 10:00',
        title: 'Inspecção dos Amplificadores Troncal TV Rua 12',
        clientName: 'Rede Troncal TV',
        location: 'Poste 14, Rua da Missão',
        priority: 'alta',
        status: 'concluida',
      },
      {
        id: 'sch-8',
        time: '10:30 - 13:00',
        title: 'Fusão de Fibra Óptica CTO-04 danificada por camião',
        clientName: 'Piquete de Emergência',
        location: 'Cruzamento Rua 12 c/ Rua 5',
        priority: 'urgente',
        status: 'em_curso',
      },
      {
        id: 'sch-9',
        time: '14:30 - 16:30',
        title: 'Supervisão da Instalação Fibra 50 com Ajudante Pedro',
        clientName: 'Joaquim Santos (CLI-00002)',
        location: 'Golf I, Casa 14B',
        priority: 'normal',
        status: 'pendente',
      },
    ],
  },
  {
    id: 4,
    username: 'mateus.tecnico',
    name: 'Mateus Domingos Silva',
    role: 'operador',
    password: '123',
    active: true,
    jobTitle: 'Técnico Instalador Fibra & TV',
    jobRoleId: 2,
    department: 'Técnico',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    biNumber: '005928174LA041',
    age: 29,
    birthDate: '1997-11-05',
    gender: 'Masculino',
    phone: '945 119 283',
    whatsapp: '945 119 283',
    email: 'mateus.silva@osdeltecnologia.ao',
    address: 'Golf II, Luanda',
    salaryBase: 155000,
    foodAllowance: 30000,
    transportAllowance: 25000,
    bankIban: 'AO06.0051.0000.3333.2222.1111.9',
    admissionDate: '2023-01-20',
    contractType: 'Efectivo',
    workStatus: 'em_deslocacao',
    currentTask: 'Deslocação para instalação de Fibra 22 no Cliente Joaquim Santos (Golf I)',
    schedule: [
      {
        id: 'sch-10',
        time: '09:00 - 11:00',
        title: 'Troca de Conector RG6 oxidado em residência',
        clientName: 'Ana Maria da Silva (CLI-00001)',
        location: 'Golf I, Rua 12, Casa 4',
        priority: 'normal',
        status: 'concluida',
      },
      {
        id: 'sch-11',
        time: '11:30 - 13:30',
        title: 'Baixada de Cabo Drop Fibra e Fixação de Roldanas',
        clientName: 'Joaquim Santos (CLI-00002)',
        location: 'Golf I, Rua 5, Casa 14B',
        priority: 'alta',
        status: 'em_curso',
      },
      {
        id: 'sch-12',
        time: '15:00 - 17:00',
        title: 'Execução de Ordem de Corte Técnico por Falta de Pagamento',
        clientName: 'Margarida Costa (CLI-00006)',
        location: 'Golf I, Rua 3, Casa 8',
        priority: 'normal',
        status: 'pendente',
      },
    ],
  },
  {
    id: 5,
    username: 'pedro.ajudante',
    name: 'Pedro Afonso Kiala',
    role: 'operador',
    password: '123',
    active: true,
    jobTitle: 'Ajudante do Mestre (Aprendiz)',
    jobRoleId: 3,
    department: 'Técnico',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    biNumber: '009182736LA048',
    age: 22,
    birthDate: '2004-04-12',
    gender: 'Masculino',
    phone: '931 772 819',
    whatsapp: '931 772 819',
    email: 'pedro.kiala@osdeltecnologia.ao',
    address: 'Bairro Popular, Luanda',
    salaryBase: 85000,
    foodAllowance: 25000,
    transportAllowance: 25000,
    bankIban: 'AO06.0006.0000.6666.7777.8888.1',
    admissionDate: '2024-02-10',
    contractType: 'A Termo',
    workStatus: 'em_campo',
    currentTask: 'Apoio no esticamento de cabos drop e segurança de escada com Mestre Carlos',
    schedule: [
      {
        id: 'sch-13',
        time: '08:00 - 12:00',
        title: 'Apoio em Puxada de Linha e Fixação de Parafusos nos Postes',
        clientName: 'Piquete Técnico Golf I',
        location: 'Postes 12 a 18',
        priority: 'alta',
        status: 'em_curso',
      },
      {
        id: 'sch-14',
        time: '14:00 - 17:00',
        title: 'Organização de Bobinas e Ferramental de Campo na Carrinha',
        clientName: 'Logística de Ferramentas',
        location: 'Armazém Central',
        priority: 'normal',
        status: 'pendente',
      },
    ],
  },
  {
    id: 6,
    username: 'lucas.dev',
    name: 'Lucas Sebastião Neto',
    role: 'admin',
    password: '123',
    active: true,
    jobTitle: 'Informático - Programador Fullstack',
    jobRoleId: 8,
    department: 'TI / NOC',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    biNumber: '006281947LA033',
    age: 26,
    birthDate: '2000-09-29',
    gender: 'Masculino',
    phone: '942 990 124',
    whatsapp: '942 990 124',
    email: 'lucas.neto@osdeltecnologia.ao',
    address: 'Morro Bento, Luanda',
    salaryBase: 380000,
    foodAllowance: 40000,
    transportAllowance: 35000,
    bankIban: 'AO06.0040.0000.9999.0000.1111.2',
    admissionDate: '2023-08-01',
    contractType: 'Efectivo',
    workStatus: 'disponivel',
    currentTask: 'Desenvolvimento do Módulo de Fecho de Caixa e Preparação da API Mobile para Técnicos',
    schedule: [
      {
        id: 'sch-15',
        time: '08:30 - 11:30',
        title: 'Implementação dos Endpoints REST para App Mobile dos Técnicos',
        clientName: 'Arquitetura de Software',
        location: 'NOC / TI',
        priority: 'alta',
        status: 'concluida',
      },
      {
        id: 'sch-16',
        time: '11:30 - 14:00',
        title: 'Auditoria de Permissões RBAC e Histórico de Atividades',
        clientName: 'Segurança OSDEL',
        location: 'NOC / TI',
        priority: 'alta',
        status: 'em_curso',
      },
      {
        id: 'sch-17',
        time: '15:00 - 17:30',
        title: 'Otimização das Rotas de Conexão com a OLT Huawei',
        clientName: 'Rede Central Fibra',
        location: 'Sala de Servidores',
        priority: 'normal',
        status: 'pendente',
      },
    ],
  },
];

const seedCashClosures: AnyRecord[] = [
  {
    id: 1,
    closureCode: 'FC-2026-09-13-01',
    date: '2026-09-13',
    periodType: 'diario',
    shiftName: 'Turno Completo',
    openedAt: '2026-09-13T08:00:00Z',
    closedAt: '2026-09-13T17:30:00Z',
    operator: 'operador1',
    operatorName: 'Maria Teresa dos Santos',
    initialCashAmount: 20000,
    physicalCashCounted: 44000,
    expectedCash: 44000,
    difference: 0,
    status: 'validado_admin',
    validatedBy: 'deezy',
    validatedAt: '2026-09-13T18:00:00Z',
    notes: 'Fecho concluído com sucesso sem qualquer quebra ou sobra de caixa.',
    breakdowns: {
      cash: 24000,
      multicaixaTpa: 36000,
      mcxExpress: 45000,
      transferBai: 20000,
      transferBfa: 15000,
    },
    totalIn: 140000,
    totalOut: 8500,
    withdrawals: 0,
  },
  {
    id: 2,
    closureCode: 'FC-2026-09-12-01',
    date: '2026-09-12',
    periodType: 'diario',
    shiftName: 'Turno Completo',
    openedAt: '2026-09-12T08:00:00Z',
    closedAt: '2026-09-12T17:15:00Z',
    operator: 'operador1',
    operatorName: 'Maria Teresa dos Santos',
    initialCashAmount: 20000,
    physicalCashCounted: 48000,
    expectedCash: 48000,
    difference: 0,
    status: 'validado_admin',
    validatedBy: 'deezy',
    validatedAt: '2026-09-12T17:45:00Z',
    notes: 'Valores conferidos e entregues ao cofre da tesouraria.',
    breakdowns: {
      cash: 28000,
      multicaixaTpa: 42000,
      mcxExpress: 52000,
      transferBai: 18000,
      transferBfa: 12000,
    },
    totalIn: 152000,
    totalOut: 5000,
    withdrawals: 0,
  },
];

const seedInvoices: AnyRecord[] = [
  {
    id: 1,
    invoiceNumber: 'FT-2026/0001',
    clientId: 1,
    clientName: 'Ana Maria da Silva',
    clientDocument: '004829104LA042',
    clientPhone: '923 456 789',
    clientAddress: 'Golf I, Rua 12, Casa 4',
    type: 'factura_recibo',
    status: 'paga',
    issueDate: '2026-09-02',
    dueDate: '2026-09-05',
    paidDate: '2026-09-02',
    paymentMethod: 'Multicaixa Express',
    referenceMonth: '2026-09',
    items: [
      { description: 'Mensalidade de TV a Cabo Comunitária - Setembro/2026', quantity: 1, unitPrice: 4000, total: 4000 },
    ],
    subtotal: 4000,
    discount: 0,
    penalty: 0,
    taxRetention: 0,
    total: 4000,
    notes: 'Pagamento pontual liquidado por Multicaixa Express.',
    operator: 'deezy',
    createdAt: '2026-09-02T10:15:00Z',
  },
  {
    id: 2,
    invoiceNumber: 'FT-2026/0002',
    clientId: 2,
    clientName: 'Joaquim Manuel dos Santos',
    clientDocument: '003928174LA038',
    clientPhone: '912 345 678',
    clientAddress: 'Golf I, Rua 5, Casa 14B',
    type: 'factura_recibo',
    status: 'paga',
    issueDate: '2026-09-03',
    dueDate: '2026-09-05',
    paidDate: '2026-09-03',
    paymentMethod: 'TPA Multicaixa',
    referenceMonth: '2026-09',
    items: [
      { description: 'Mensalidade Internet Fibra 22 Mbps - Setembro/2026', quantity: 1, unitPrice: 8500, total: 8500 },
    ],
    subtotal: 8500,
    discount: 0,
    penalty: 0,
    taxRetention: 0,
    total: 8500,
    notes: 'Pagamento presencial no balcão.',
    operator: 'operador1',
    createdAt: '2026-09-03T11:40:00Z',
  },
  {
    id: 3,
    invoiceNumber: 'FT-2026/0003',
    clientId: 4,
    clientName: 'Paulo Alexandre de Oliveira',
    clientDocument: '006192847LA021',
    clientPhone: '945 678 901',
    clientAddress: 'Golf I, Rua 18, Casa 29',
    type: 'factura_recibo',
    status: 'paga',
    issueDate: '2026-09-05',
    dueDate: '2026-09-05',
    paidDate: '2026-09-05',
    paymentMethod: 'Numerário (Dinheiro)',
    referenceMonth: '2026-09',
    items: [
      { description: 'Pacote Combo TV Comunitária + Fibra 22 - Setembro/2026', quantity: 1, unitPrice: 10500, total: 10500 },
      { description: 'Ponto TV Adicional no Quarto', quantity: 1, unitPrice: 1000, total: 1000 },
    ],
    subtotal: 11500,
    discount: 0,
    penalty: 0,
    taxRetention: 0,
    total: 11500,
    notes: 'Pago com numerário no atendimento.',
    operator: 'operador1',
    createdAt: '2026-09-05T14:20:00Z',
  },
  {
    id: 4,
    invoiceNumber: 'FP-2026/0004',
    clientId: 3,
    clientName: 'Esperança Domingos Garcia',
    clientDocument: '005718294LA019',
    clientPhone: '934 567 890',
    clientAddress: 'Golf I, Rua 8, Casa 12',
    type: 'proforma',
    status: 'emitida',
    issueDate: '2026-09-08',
    dueDate: '2026-09-18',
    referenceMonth: '2026-09',
    items: [
      { description: 'Taxa de Instalação e Adesão à Rede Fibra Óptica', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Metro Adicional de Cabo Drop (15 metros excedentes)', quantity: 15, unitPrice: 250, total: 3750 },
    ],
    subtotal: 18750,
    discount: 750,
    penalty: 0,
    taxRetention: 0,
    total: 18000,
    notes: 'Proforma para instalação solicitada. Aguarda liquidação para despacho da equipa de piquete.',
    operator: 'deezy',
    createdAt: '2026-09-08T09:30:00Z',
  },
];

const seedAuditLogs: AnyRecord[] = [
  {
    id: 1,
    action: 'INICIALIZACAO_SISTEMA',
    module: 'Sistema',
    description: 'Sistema OSDEL Tecnologia carregado e base de dados operacionalizada.',
    user: 'deezy',
    targetId: 'SYS-001',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    details: 'Versão 2.5 Pro ativada.',
  },
  {
    id: 2,
    action: 'CRIAR_PAGAMENTO',
    module: 'Pagamentos',
    description: 'Registado pagamento de 4.000 Kz para cliente Ana Maria da Silva.',
    user: 'deezy',
    targetId: 'PAY-1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    details: 'Método: Multicaixa Express, Mês Ref: 2026-09.',
  },
  {
    id: 3,
    action: 'EMISSAO_FACTURA',
    module: 'Facturação',
    description: 'Emitida factura-recibo FT-2026/0002 no valor de 8.500 Kz.',
    user: 'operador1',
    targetId: 'FT-2026/0002',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    details: 'Cliente: Joaquim Santos, Serviço: Fibra 22.',
  },
  {
    id: 4,
    action: 'VALIDAR_FECHO_CAIXA',
    module: 'Contabilidade',
    description: 'Validado termo de fecho de caixa FC-2026-09-13-01 com carimbo da administração.',
    user: 'deezy',
    targetId: 'FC-2026-09-13-01',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    details: 'Total verificado: 140.000 Kz. Diferença de caixa: 0 Kz.',
  },
  {
    id: 5,
    action: 'ATRIBUIR_TAREFA_AGENDA',
    module: 'Equipa',
    description: 'Atribuída intervenção de emergência na CTO-04 ao Mestre Carlos Batalha.',
    user: 'deezy',
    targetId: 'USER-3',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    details: 'Prioridade: Urgente. Local: Rua 12 c/ Rua 5.',
  },
];

const seedFinancialAccounts: AnyRecord[] = [
  {
    id: 'acc-caixa',
    name: 'Caixa Geral (Balcão Golf)',
    code: 'CX-01',
    type: 'caixa',
    initialBalance: 95000,
    currency: 'AOA',
    color: 'emerald',
    manager: 'deezy (Tesouraria)',
    status: 'active',
    description: 'Caixa físico da loja de atendimento ao público no Golf II para pagamentos a pronto.',
  },
  {
    id: 'acc-bai',
    name: 'Banco BAI (Arrecadação Principal)',
    code: 'BCO-BAI',
    type: 'banco',
    bankName: 'Banco Angolano de Investimentos (BAI)',
    accountNumber: '1234567810',
    iban: 'AO06.0040.0000.1234.5678.9012.3',
    initialBalance: 1850000,
    currency: 'AOA',
    color: 'blue',
    manager: 'Administração OSDEL',
    status: 'active',
    description: 'Conta principal para recebimentos de mensalidades e depósitos de receita diária.',
  },
  {
    id: 'acc-bfa',
    name: 'Banco BFA (Operações & Fornecedores)',
    code: 'BCO-BFA',
    type: 'banco',
    bankName: 'Banco de Fomento Angola (BFA)',
    accountNumber: '9876543210',
    iban: 'AO06.0006.0000.9876.5432.1098.7',
    initialBalance: 740000,
    currency: 'AOA',
    color: 'amber',
    manager: 'Administração OSDEL',
    status: 'active',
    description: 'Conta para liquidação de fornecedores de fibra, energia e encargos fiscais.',
  },
  {
    id: 'acc-tpa',
    name: 'Terminal Multicaixa Express (TPA / EMIS)',
    code: 'TPA-MCX',
    type: 'tpa',
    bankName: 'Rede Multicaixa EMIS',
    accountNumber: 'TPA-98421-MCX',
    initialBalance: 320000,
    currency: 'AOA',
    color: 'purple',
    manager: 'Operador de Balcão',
    status: 'active',
    description: 'Recebimentos com cartões Multicaixa no balcão e pagamentos via Express.',
  },
  {
    id: 'acc-piquete',
    name: 'Fundo de Maneio de Piquete Técnico',
    code: 'FM-PIQ',
    type: 'fundo_maneio',
    initialBalance: 50000,
    currency: 'AOA',
    color: 'cyan',
    manager: 'Carlos Batalha (Chefe de Piquete)',
    status: 'active',
    description: 'Fundo em dinheiro para despesas urgentes de rua, combustível e materiais imediatos.',
  },
];

const seedAccountTransfers: AnyRecord[] = [
  {
    id: 1,
    code: 'TRF-2026/0012',
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    fromAccountId: 'acc-caixa',
    fromAccountName: 'Caixa Geral (Balcão Golf)',
    toAccountId: 'acc-bai',
    toAccountName: 'Banco BAI (Arrecadação Principal)',
    amount: 150000,
    reason: 'Sangria de caixa - Depósito de receitas de mensalidades no balcão',
    proofNumber: 'DEP-BAI-99412',
    operator: 'deezy',
    status: 'concluido',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    code: 'TRF-2026/0013',
    date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    fromAccountId: 'acc-caixa',
    fromAccountName: 'Caixa Geral (Balcão Golf)',
    toAccountId: 'acc-piquete',
    toAccountName: 'Fundo de Maneio de Piquete Técnico',
    amount: 30000,
    reason: 'Reposição semanal de fundo de maneio para viatura de piquete',
    proofNumber: 'VALE-PIQ-041',
    operator: 'deezy',
    status: 'concluido',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 3,
    code: 'TRF-2026/0014',
    date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
    fromAccountId: 'acc-bai',
    fromAccountName: 'Banco BAI (Arrecadação Principal)',
    toAccountId: 'acc-bfa',
    toAccountName: 'Banco BFA (Operações & Fornecedores)',
    amount: 250000,
    reason: 'Transferência de liquidez para pagamento de lote de bobinas de fibra óptica',
    proofNumber: 'TRF-INTER-2026',
    operator: 'admin',
    status: 'concluido',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const seedCategoryBudgets: AnyRecord[] = [
  { id: 'b-material', category: 'material', label: 'Material de Rede & Fibra', monthlyBudget: 350000, color: 'blue' },
  { id: 'b-combustivel', category: 'combustivel', label: 'Combustível & Viaturas de Piquete', monthlyBudget: 120000, color: 'amber' },
  { id: 'b-link_ip', category: 'link_ip', label: 'Link IP Transit & Telecomunicações', monthlyBudget: 600000, color: 'purple' },
  { id: 'b-alimentacao', category: 'alimentacao', label: 'Alimentação & Diárias de Campo', monthlyBudget: 80000, color: 'rose' },
  { id: 'b-energia', category: 'energia', label: 'Energia Eléctrica ENDE & Gerador', monthlyBudget: 90000, color: 'emerald' },
  { id: 'b-manutencao', category: 'manutencao', label: 'Manutenção de Equipamentos & Ferramentas', monthlyBudget: 70000, color: 'indigo' },
  { id: 'b-operacional', category: 'operacional', label: 'Despesas de Balcão & Consumíveis', monthlyBudget: 50000, color: 'slate' },
  { id: 'b-impostos', category: 'impostos', label: 'Obrigações Fiscais & Taxas AGT', monthlyBudget: 140000, color: 'cyan' },
];

const seedExpenses: AnyRecord[] = [
  {
    id: 1,
    date: new Date().toISOString().slice(0, 10),
    amount: 14500,
    reason: '100 Conectores SC/APC rápidos e rolo de fita isoladora 3M',
    account: 'Caixa Geral (Balcão Golf)',
    accountId: 'acc-caixa',
    category: 'material',
    supplier: 'ElectroGolf Luanda Lda',
    supplierNif: '5417089214',
    documentNumber: 'FT-2026/0912',
    paymentMethod: 'Dinheiro',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'deezy',
    notes: 'Material urgente para ativação de 8 novas portas no Golf II.',
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    amount: 15000,
    reason: 'Abastecimento de gasóleo para carrinha Toyota Hilux do piquete',
    account: 'Fundo de Maneio de Piquete Técnico',
    accountId: 'acc-piquete',
    category: 'combustivel',
    supplier: 'Posto Sonangol Golf II',
    supplierNif: '5000012391',
    documentNumber: 'FR-SON-8821',
    paymentMethod: 'Dinheiro',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'deezy',
    notes: 'Tanque atestado para rondas noturnas e atendimento de corte de drop.',
  },
  {
    id: 3,
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    amount: 48000,
    reason: 'Bobina de cabo drop óptico 1FO auto-sustentado (1000 metros)',
    account: 'Banco BFA (Operações & Fornecedores)',
    accountId: 'acc-bfa',
    category: 'material',
    supplier: 'AngoTelecom Fornecimentos',
    supplierNif: '5401928410',
    documentNumber: 'FAT-2026/4102',
    paymentMethod: 'Transferência BFA',
    taxWithheld: 3120,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'deezy',
    notes: 'Aquisição com retenção na fonte de 6.5% aplicada.',
  },
  {
    id: 4,
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    amount: 12000,
    reason: 'Almoço e diárias de campo para equipa de instalação técnica externa',
    account: 'Caixa Geral (Balcão Golf)',
    accountId: 'acc-caixa',
    category: 'alimentacao',
    supplier: 'Restaurante Central Palanca',
    supplierNif: '5488102391',
    documentNumber: 'RC-9912',
    paymentMethod: 'Dinheiro',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'operador1',
    notes: 'Instalação de backbone na Rua do Povo com 4 técnicos.',
  },
  {
    id: 5,
    date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    amount: 185000,
    reason: 'Banda Larga IP Transit Dedicado STM-1 (Mensalidade Provedor)',
    account: 'Banco BAI (Arrecadação Principal)',
    accountId: 'acc-bai',
    category: 'link_ip',
    supplier: 'MSTelcom Angola',
    supplierNif: '5400019281',
    documentNumber: 'FAT-MST/2026/09',
    paymentMethod: 'Transferência BAI',
    taxWithheld: 12025,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'admin',
    notes: 'Conexão primária de fibra óptica da cabeceira OSDEL.',
  },
  {
    id: 6,
    date: new Date(Date.now() - 86400000 * 6).toISOString().slice(0, 10),
    amount: 25000,
    reason: 'Recarga pré-paga ENDE para Estação de Cabeceira e Transmissores CATV',
    account: 'Terminal Multicaixa Express (TPA / EMIS)',
    accountId: 'acc-tpa',
    category: 'energia',
    supplier: 'ENDE EP - Luanda Sul',
    supplierNif: '5400192812',
    documentNumber: 'REC-ENDE-41092',
    paymentMethod: 'Multicaixa Express',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'deezy',
    notes: 'Carregamento de 2.100 kWh para o quadro trifásico do rack.',
  },
  {
    id: 7,
    date: new Date(Date.now() - 86400000 * 8).toISOString().slice(0, 10),
    amount: 32000,
    reason: 'Calibração e lâminas novas para clivador de precisão e máquina de fusão',
    account: 'Banco BFA (Operações & Fornecedores)',
    accountId: 'acc-bfa',
    category: 'manutencao',
    supplier: 'FiberTech Angola',
    supplierNif: '5411902812',
    documentNumber: 'FT-FT/2026/012',
    paymentMethod: 'Transferência BFA',
    taxWithheld: 2080,
    status: 'pago',
    isReconciled: false,
    operator: 'deezy',
    notes: 'Revisão técnica semestral do equipamento de fusão Fujikura.',
  },
  {
    id: 8,
    date: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
    amount: 8500,
    reason: 'Rolos de papel térmico para TPA e resmas de papel timbrado A4',
    account: 'Caixa Geral (Balcão Golf)',
    accountId: 'acc-caixa',
    category: 'operacional',
    supplier: 'Papelaria Moderna Luanda',
    supplierNif: '5422819201',
    documentNumber: 'FR-PAP-2026',
    paymentMethod: 'Dinheiro',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: true,
    reconciledAt: new Date().toISOString(),
    operator: 'operador1',
    notes: 'Material para emissão de facturas-recibos físicas aos clientes.',
  },
  {
    id: 9,
    date: new Date(Date.now() - 86400000 * 12).toISOString().slice(0, 10),
    amount: 45000,
    reason: 'Taxa de licenciamento municipal de cabos aéreos e postes',
    account: 'Banco BAI (Arrecadação Principal)',
    accountId: 'acc-bai',
    category: 'impostos',
    supplier: 'Administração Municipal do Kilamba Kiaxi',
    supplierNif: '5000192810',
    documentNumber: 'DUC-2026/0491',
    paymentMethod: 'Transferência BAI',
    taxWithheld: 0,
    status: 'pago',
    isReconciled: false,
    operator: 'admin',
    notes: 'Guia DUC liquidada referente à ocupação de via aérea no Golf II.',
  },
  {
    id: 10,
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    amount: 65000,
    reason: 'Aquisição agendada de 4 novas Caixas CTO 16FO com Splitter 1:16',
    account: 'Banco BFA (Operações & Fornecedores)',
    accountId: 'acc-bfa',
    category: 'material',
    supplier: 'ElectroGolf Luanda Lda',
    supplierNif: '5417089214',
    documentNumber: 'ORC-2026/881',
    paymentMethod: 'Transferência BFA',
    taxWithheld: 0,
    status: 'pendente',
    isReconciled: false,
    operator: 'deezy',
    notes: 'Expansão planeada para o setor Palanca / Rua 15.',
  },
];

const seedMessages: AnyRecord[] = [
  {
    id: 1,
    audience: 'clientes em atraso',
    channel: 'SMS',
    message: 'OSDEL TECNOLOGIA: Informamos que o seu sinal de TV/Internet encontra-se em atraso. Evite o corte de sinal efectuando o pagamento hoje com a taxa de 1.000 Kz.',
    status: 'enviada',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    operator: 'deezy',
  },
  {
    id: 2,
    audience: 'todos os clientes',
    channel: 'SMS',
    message: 'OSDEL TECNOLOGIA: Estimado cliente, a mensalidade referente a este mês vence no dia 5. Evite multas e garanta o seu sinal ligado.',
    status: 'enviada',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    operator: 'deezy',
  },
];

const seedInventory: AnyRecord[] = [
  {
    id: 1,
    code: 'MAT-ONU-01',
    name: 'ONU GPON Huawei HG8310M',
    category: 'equipamento',
    unit: 'unidade',
    quantity: 18,
    minQuantity: 5,
    unitCost: 15000,
    location: 'Armazém Central - Prateleira A1',
    description: 'Terminal de rede óptica 1 porta Gigabit para clientes Fibra',
  },
  {
    id: 2,
    code: 'MAT-ROUT-01',
    name: 'Roteador Wi-Fi Gigabit AC1200 Dual-Band',
    category: 'equipamento',
    unit: 'unidade',
    quantity: 12,
    minQuantity: 4,
    unitCost: 18500,
    location: 'Armazém Central - Prateleira A2',
    description: 'Roteador Wi-Fi para clientes residenciais de Internet Fibra',
  },
  {
    id: 3,
    code: 'MAT-CAB-FO',
    name: 'Cabo Drop Fibra Óptica 1FO (Bobina)',
    category: 'fibra',
    unit: 'metros',
    quantity: 850,
    minQuantity: 200,
    unitCost: 120,
    location: 'Armazém Central - Piso Térreo',
    description: 'Cabo auto-sustentado para baixada de clientes até à caixa PDO',
  },
  {
    id: 4,
    code: 'MAT-CAB-RG6',
    name: 'Cabo Coaxial RG6 75 Ohms Malha 90%',
    category: 'tv',
    unit: 'metros',
    quantity: 1200,
    minQuantity: 300,
    unitCost: 180,
    location: 'Armazém Central - Piso Térreo',
    description: 'Cabo de TV comunitária para distribuição em residências',
  },
  {
    id: 5,
    code: 'MAT-CON-SC',
    name: 'Conector Rápido SC/APC de Campo',
    category: 'fibra',
    unit: 'unidade',
    quantity: 45,
    minQuantity: 20,
    unitCost: 450,
    location: 'Armazém Central - Gaveta 3',
    description: 'Conector óptico montável em campo sem máquina de fusão',
  },
  {
    id: 6,
    code: 'MAT-CON-RG6',
    name: 'Conector F de Compressão RG6',
    category: 'tv',
    unit: 'unidade',
    quantity: 160,
    minQuantity: 50,
    unitCost: 200,
    location: 'Armazém Central - Gaveta 4',
    description: 'Conectores coaxiais metálicos blindados para derivações de TV',
  },
  {
    id: 7,
    code: 'MAT-PDO-16',
    name: 'Caixa de Terminação Óptica (PDO) 16 Portas',
    category: 'fibra',
    unit: 'unidade',
    quantity: 6,
    minQuantity: 2,
    unitCost: 22000,
    location: 'Armazém Central - Prateleira B1',
    description: 'Caixa para poste equipada com splitter e bandejas de fusão',
  },
  {
    id: 8,
    code: 'MAT-SPL-TV',
    name: 'Repartidor / Divisor de TV 1x4 com Passagem DC',
    category: 'tv',
    unit: 'unidade',
    quantity: 24,
    minQuantity: 10,
    unitCost: 1500,
    location: 'Armazém Central - Prateleira B2',
    description: 'Divisor de sinal RF de alta frequência para múltiplos televisores',
  },
];

const seedEquipmentAssignments: AnyRecord[] = [
  {
    id: 1,
    clientId: 2,
    inventoryItemId: 1,
    equipmentType: 'ONU GPON',
    model: 'Huawei HG8310M',
    serialNumber: 'HWTC-882190A',
    macAddress: 'E4:C3:2A:88:21:03',
    pdoNumber: 'PDO-02',
    pdoPort: 'Porta 4',
    status: 'installed',
    installedAt: '2024-02-15',
    technician: 'Mateus Silva',
    notes: 'Instalação inicial com 35m de fibra drop.',
  },
  {
    id: 2,
    clientId: 3,
    inventoryItemId: 1,
    equipmentType: 'ONU GPON',
    model: 'Huawei HG8310M',
    serialNumber: 'HWTC-557712B',
    macAddress: 'E4:C3:2A:55:77:19',
    pdoNumber: 'PDO-08',
    pdoPort: 'Porta 7',
    status: 'installed',
    installedAt: '2024-03-05',
    technician: 'João Afonso',
    notes: 'Combo TV + Internet, roteador Wi-Fi instalado pelo cliente.',
  },
];

const seedServiceOrders: AnyRecord[] = [
  {
    id: 1,
    code: 'OS-00001',
    clientId: 2,
    type: 'corte',
    priority: 'urgente',
    status: 'pendente',
    technician: 'Piquete Golf (João & Carlos)',
    scheduledDate: new Date().toISOString().slice(0, 10),
    description: 'Corte temporário de sinal por atraso de mensalidade superior a 15 dias.',
    cableUsedMeters: 0,
    materialNotes: 'Nenhum material gasto, desconexão física na PDO-02 porta 4.',
    resolution: '',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: null,
    operator: 'deezy',
  },
  {
    id: 2,
    code: 'OS-00002',
    clientId: 3,
    type: 'manutencao',
    priority: 'normal',
    status: 'concluida',
    technician: 'Mateus Silva',
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    description: 'Revisão de conector SC/APC na entrada da residência por oscilação de sinal óptico.',
    cableUsedMeters: 5,
    materialNotes: 'Substituído 1 conector SC/APC rápido de campo.',
    resolution: 'Sinal estabilizado em -19.4 dBm. Cliente testou navegação com sucesso.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    operator: 'deezy',
  },
  {
    id: 3,
    code: 'OS-00003',
    clientId: 1,
    type: 'derivacao',
    priority: 'normal',
    status: 'concluida',
    technician: 'Carlos Batalha',
    scheduledDate: '2024-04-12',
    description: 'Adição de 2º ponto de TV no quarto do cliente.',
    cableUsedMeters: 18,
    materialNotes: '1 divisor 1x2 + 4 conectores F RG6 + 18m de cabo coaxial.',
    resolution: 'Instalação de ponto extra concluída, sinal nítido em ambos os televisores.',
    createdAt: '2024-04-11T14:00:00Z',
    completedAt: '2024-04-12T16:30:00Z',
    operator: 'deezy',
  },
  {
    id: 4,
    code: 'OS-00004',
    clientId: 4,
    type: 'religacao',
    priority: 'imediata',
    status: 'pendente',
    technician: 'Piquete Golf (João & Carlos)',
    scheduledDate: new Date().toISOString().slice(0, 10),
    description: 'Cliente solicitou religação de contrato após regularização pendente.',
    cableUsedMeters: 0,
    materialNotes: 'Reconectar drop na porta da PDO-01.',
    resolution: '',
    createdAt: new Date().toISOString(),
    completedAt: null,
    operator: 'deezy',
  },
];

function load<T>(name: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(`osdel:${name}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Smart merging for settings so new fields are always present
      if (name === 'settings' && typeof fallback === 'object' && fallback !== null) {
        return { ...fallback, ...parsed } as T;
      }
      // Smart merging for users if the cached array doesn't have the new rich team members
      if (name === 'users' && Array.isArray(parsed) && parsed.length < 5 && Array.isArray(fallback)) {
        return fallback as T;
      }
      return parsed as T;
    }
    // Backwards compatibility with previous key prefix
    const old = window.localStorage.getItem(`no-tv:${name}`);
    return old ? (JSON.parse(old) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(name: string, value: T) {
  try {
    window.localStorage.setItem(`osdel:${name}`, JSON.stringify(value));
  } catch {
    /* storage is optional */
  }
}

let clients = load('clients', seedClients);
let payments = load('payments', seedPayments);
let contracts = load('contracts', seedContracts);
let settings = load('settings', seedSettings);
let users = load('users', seedUsers);
let expenses = load('expenses', seedExpenses);
let financialAccounts = load('financial_accounts', seedFinancialAccounts);
let accountTransfers = load('account_transfers', seedAccountTransfers);
let categoryBudgets = load('category_budgets', seedCategoryBudgets);
let messages = load('messages', seedMessages);
let inventory = load('inventory', seedInventory);
let equipmentAssignments = load('equipment_assignments', seedEquipmentAssignments);
let serviceOrders = load('service_orders', seedServiceOrders);
let jobRoles = load('job_roles', seedJobRoles);
let cashClosures = load('cash_closures', seedCashClosures);
let invoices = load('invoices', seedInvoices);
let auditLogs = load('audit_logs', seedAuditLogs);

export const logAuditAction = (item: {
  action: string;
  module: string;
  description: string;
  targetId?: string;
  details?: string;
  user?: string;
}) => {
  const sessionUser = session();
  const newLog = {
    id: Math.max(0, ...auditLogs.map((l) => l.id)) + 1,
    action: item.action,
    module: item.module,
    description: item.description,
    targetId: item.targetId || 'N/A',
    details: item.details || '',
    user: item.user || sessionUser?.username || 'sistema',
    timestamp: new Date().toISOString(),
  };
  auditLogs = [newLog, ...auditLogs];
  save('audit_logs', auditLogs);
  return newLog;
};

const key = (name: string, ...args: any[]) => [name, ...args];
const query = (queryKey: any[], fn: () => any, options?: AnyRecord) =>
  useQuery({ queryKey, queryFn: async () => fn(), ...options });
const mutation = (fn: (data: any) => any) =>
  useMutation({ mutationFn: async (args: any) => fn(args) });

export type Client = AnyRecord;
export type ClientInput = AnyRecord;
export type ContractInput = AnyRecord;
export type PaymentInput = AnyRecord;
export type SettingsUpdate = AnyRecord;
export type ExpenseInput = AnyRecord;
export type UserInput = AnyRecord;
export type MessageInput = AnyRecord;

export const getGetDashboardQueryKey = () => key('dashboard');
export const getGetClientQueryKey = (id: number) => key('client', id);
export const getGetSettingsQueryKey = () => key('settings');
export const getListClientsQueryKey = (params: AnyRecord = {}) =>
  key('clients', params.search || '', params.serviceType || '', params.status || '');
export const getListClientContractsQueryKey = (id: number) => key('contracts', id);
export const getListPaymentsQueryKey = () => key('payments');
export const getListExpensesQueryKey = () => key('expenses');
export const getListFinancialAccountsQueryKey = () => key('financial_accounts');
export const getListTransfersQueryKey = (params: AnyRecord = {}) =>
  key('account_transfers', params.startDate || '', params.endDate || '');
export const getListCategoryBudgetsQueryKey = () => key('category_budgets');
export const getListUsersQueryKey = () => key('users');
export const getListMessagesQueryKey = () => key('messages');
export const getListInventoryQueryKey = (params: AnyRecord = {}) =>
  key('inventory', params.category || '', params.search || '');
export const getListEquipmentAssignmentsQueryKey = (clientId?: number) =>
  key('equipment_assignments', clientId || 0);
export const getListServiceOrdersQueryKey = (params: AnyRecord = {}) =>
  key('service_orders', params.status || '', params.type || '', params.clientId || 0);
export const getListJobRolesQueryKey = () => key('job_roles');
export const getListCashClosuresQueryKey = () => key('cash_closures');
export const getListInvoicesQueryKey = (params: AnyRecord = {}) =>
  key('invoices', params.search || '', params.status || '', params.period || '');
export const getListAuditLogsQueryKey = (params: AnyRecord = {}) =>
  key('audit_logs', params.module || '', params.user || '', params.search || '');
export const useHealthCheck = () => ({ isError: false, data: { status: 'ok' } });

const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

const monthsSince = (value?: string | null) => {
  if (!value) return 99;
  const d1 = new Date(value);
  const d2 = new Date();
  const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  return Math.max(0, diffMonths);
};

const latestPaymentFor = (clientId: number) =>
  payments
    .filter((item) => item.clientId === clientId)
    .sort((a, b) => String(b.paymentMonth).localeCompare(String(a.paymentMonth)))[0];

const dueDayFor = (clientId: number) =>
  Number(contracts.find((item) => item.clientId === clientId)?.dueDay ?? settings.paymentDueDay ?? 5);

export const visibleClient = (client: AnyRecord): AnyRecord => {
  if (client.status === 'inactive') return { ...client, status: 'inactive' };
  
  const last = latestPaymentFor(client.id);
  const currentMonth = monthKey();
  const currentDay = new Date().getDate();
  const dueDay = dueDayFor(client.id);

  let status = client.status;

  if (client.status === 'suspended') {
    return { ...client, status: 'suspended' };
  }

  if (last) {
    const elapsed = monthsSince(`${last.paymentMonth}-01`);
    if (elapsed >= Number(settings.suspensionAfterMonths ?? 3)) {
      status = 'suspended';
    } else if (last.paymentMonth === currentMonth) {
      status = 'active';
    } else if (currentDay > dueDay) {
      status = 'late';
    } else {
      status = 'active';
    }
  } else {
    // No payments yet recorded
    const clientAgeMonths = monthsSince(client.createdAt);
    if (clientAgeMonths >= Number(settings.suspensionAfterMonths ?? 3)) {
      status = 'suspended';
    } else if (currentDay > dueDay) {
      status = 'late';
    } else {
      status = 'active';
    }
  }

  return { ...client, status };
};

const isInRange = (value: string, start?: string, end?: string) =>
  (!start || value >= start) && (!end || value <= end);

export const useGetDashboard = () =>
  query(
    getGetDashboardQueryKey(),
    () => {
      const listed = clients.map(visibleClient);
      const currentMonth = monthKey();
      const currentMonthPayments = payments.filter((p) => p.paymentMonth === currentMonth);
      const paidClientsIds = new Set(currentMonthPayments.map((p) => p.clientId));
      const revenue = currentMonthPayments.reduce(
        (sum, p) => sum + Number(p.amount) + Number(p.penalty || 0),
        0,
      );

      const lowStockItems = inventory.filter((i) => Number(i.quantity) <= Number(i.minQuantity)).length;
      const pendingServiceOrders = serviceOrders.filter(
        (o) => o.status === 'pendente' || o.status === 'em_curso',
      ).length;

      return {
        totalClients: listed.length,
        activeClients: listed.filter((c) => c.status === 'active').length,
        lateClients: listed.filter((c) => c.status === 'late').length,
        suspendedClients: listed.filter((c) => c.status === 'suspended').length,
        inactiveClients: listed.filter((c) => c.status === 'inactive').length,
        tvClients: listed.filter((c) => c.serviceType === 'tv').length,
        internetClients: listed.filter((c) => c.serviceType === 'internet').length,
        comboClients: listed.filter((c) => c.serviceType === 'combo').length,
        revenue,
        paidClients: paidClientsIds.size,
        unpaidClients: Math.max(0, listed.length - paidClientsIds.size),
        openRequests: clients.filter((c) => String(c.notes || '').toLowerCase().includes('pedido')).length,
        lowStockItems,
        pendingServiceOrders,
        month: currentMonth,
        recentActivity: [
          ...payments.map((p) => ({
            id: `pay-${p.id}`,
            description: `Pagamento de ${money(Number(p.amount) + Number(p.penalty || 0))} de ${
              clients.find((c) => c.id === p.clientId)?.fullName || 'Cliente'
            }`,
            createdAt: p.paidAt,
            method: p.method,
            type: 'payment',
          })),
          ...serviceOrders.map((so) => ({
            id: `so-${so.id}`,
            description: `O.S. ${so.code} (${so.type}) - ${
              clients.find((c) => c.id === so.clientId)?.fullName || 'Cliente'
            } [${so.status}]`,
            createdAt: so.createdAt,
            method: so.status,
            type: 'service_order',
          })),
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10),
      };
    },
    { staleTime: 0 },
  );

export const useGetClient = (id: number, options?: AnyRecord) =>
  query(
    getGetClientQueryKey(id),
    () => {
      const found = clients.find((c) => c.id === id);
      return found ? visibleClient(found) : undefined;
    },
    options?.query,
  );

export const useListClients = (params: AnyRecord = {}) =>
  query(getListClientsQueryKey(params), () => {
    const needle = String(params.search || '').toLowerCase().trim();
    const filtered = clients
      .map(visibleClient)
      .filter((c) => {
        const text = `${c.fullName} ${c.code} ${c.phone} ${c.alternatePhone || ''} ${c.documentNumber || ''} ${
          c.houseCode || ''
        } ${c.address} ${c.neighborhood || ''}`.toLowerCase();
        const matchesSearch = !needle || text.includes(needle);
        const matchesService = !params.serviceType || c.serviceType === params.serviceType;
        const matchesStatus =
          !params.status ||
          c.status === params.status ||
          (params.status === 'request' && String(c.notes || '').toLowerCase().includes('pedido'));
        return matchesSearch && matchesService && matchesStatus;
      });

    return Object.assign([...filtered], { items: filtered, total: filtered.length });
  });

export const useListClientContracts = (id: number, options?: AnyRecord) =>
  query(getListClientContractsQueryKey(id), () => contracts.filter((c) => c.clientId === id), options?.query);

export const useListPayments = (params: AnyRecord = {}) =>
  query(getListPaymentsQueryKey(), () => {
    const items = payments
      .filter((p) => !params.paymentMonth || p.paymentMonth === params.paymentMonth)
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    return Object.assign([...items], { items, total: items.length });
  });

export const useListExpenses = (params: AnyRecord = {}) =>
  query(getListExpensesQueryKey(), () => {
    const needle = String(params.search || '').toLowerCase().trim();
    const items = expenses
      .filter((e) => {
        if (!isInRange(e.date, params.startDate, params.endDate)) return false;
        if (params.category && e.category !== params.category) return false;
        if (params.account && e.account !== params.account && e.accountId !== params.account) return false;
        if (params.status && e.status !== params.status) return false;
        if (needle) {
          const hay = `${e.reason} ${e.supplier || ''} ${e.documentNumber || ''} ${e.operator || ''}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return Object.assign([...items], { items, total: items.length });
  });

export const useListFinancialAccounts = () =>
  query(getListFinancialAccountsQueryKey(), () => {
    return Object.assign([...financialAccounts], { items: financialAccounts, total: financialAccounts.length });
  });

export const useListTransfers = (params: AnyRecord = {}) =>
  query(getListTransfersQueryKey(params), () => {
    const list = accountTransfers
      .filter((t) => isInRange(t.date, params.startDate, params.endDate))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return Object.assign([...list], { items: list, total: list.length });
  });

export const useListCategoryBudgets = () =>
  query(getListCategoryBudgetsQueryKey(), () => {
    return Object.assign([...categoryBudgets], { items: categoryBudgets, total: categoryBudgets.length });
  });

export const useListUsers = () =>
  query(getListUsersQueryKey(), () => {
    const active = users.filter((u) => u.active !== false);
    return Object.assign([...active], { items: active, total: active.length });
  });

export const useListMessages = () =>
  query(getListMessagesQueryKey(), () => {
    const list = messages.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Object.assign([...list], { items: list, total: list.length });
  });

export const useListInventory = (params: AnyRecord = {}) =>
  query(getListInventoryQueryKey(params), () => {
    const needle = String(params.search || '').toLowerCase().trim();
    const list = inventory
      .filter((item) => {
        const matchesCategory = !params.category || item.category === params.category;
        const text = `${item.code} ${item.name} ${item.description} ${item.location}`.toLowerCase();
        const matchesSearch = !needle || text.includes(needle);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return Object.assign([...list], { items: list, total: list.length });
  });

export const useListEquipmentAssignments = (clientId?: number) =>
  query(getListEquipmentAssignmentsQueryKey(clientId), () => {
    const list = equipmentAssignments.slice();
    const filtered = clientId ? list.filter((eq) => eq.clientId === clientId) : list;
    const sorted = filtered.sort((a, b) => new Date(b.installedAt || '').getTime() - new Date(a.installedAt || '').getTime());
    return Object.assign([...sorted], { items: sorted, total: sorted.length });
  });

export const useListServiceOrders = (params: AnyRecord = {}) =>
  query(getListServiceOrdersQueryKey(params), () => {
    const sorted = serviceOrders
      .filter((so) => {
        const matchesStatus = !params.status || so.status === params.status;
        const matchesType = !params.type || so.type === params.type;
        const matchesClient = !params.clientId || so.clientId === params.clientId;
        return matchesStatus && matchesType && matchesClient;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Object.assign([...sorted], { items: sorted, total: sorted.length });
  });

export const useListJobRoles = () =>
  query(getListJobRolesQueryKey(), () => {
    return Object.assign([...jobRoles], { items: jobRoles, total: jobRoles.length });
  });

export const useListCashClosures = () =>
  query(getListCashClosuresQueryKey(), () => {
    const sorted = cashClosures
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return Object.assign([...sorted], { items: sorted, total: sorted.length });
  });

export const useListInvoices = (params: AnyRecord = {}) =>
  query(getListInvoicesQueryKey(params), () => {
    const needle = (params.search || '').toLowerCase().trim();
    const sorted = invoices
      .filter((inv) => {
        const matchesStatus = !params.status || inv.status === params.status;
        const text = `${inv.invoiceNumber} ${inv.clientName} ${inv.clientDocument || ''} ${inv.paymentMethod || ''}`.toLowerCase();
        const matchesSearch = !needle || text.includes(needle);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime());
    return Object.assign([...sorted], { items: sorted, total: sorted.length });
  });

export const useListAuditLogs = (params: AnyRecord = {}) =>
  query(getListAuditLogsQueryKey(params), () => {
    const needle = (params.search || '').toLowerCase().trim();
    const sorted = auditLogs
      .filter((log) => {
        const matchesModule = !params.module || log.module === params.module;
        const matchesUser = !params.user || log.user === params.user;
        const text = `${log.action} ${log.description} ${log.user} ${log.targetId || ''}`.toLowerCase();
        const matchesSearch = !needle || text.includes(needle);
        return matchesModule && matchesUser && matchesSearch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return Object.assign([...sorted], { items: sorted, total: sorted.length });
  });

export const useGetReports = (params: AnyRecord) =>
  query(key('reports', params.reportType, params.startDate, params.endDate), () => {
    const ps = payments.filter((p) => isInRange(p.paidAt.slice(0, 10), params.startDate, params.endDate));
    const es = expenses.filter((e) => isInRange(e.date, params.startDate, params.endDate));

    const totalReceita = ps.reduce((s, p) => s + Number(p.amount) + Number(p.penalty || 0), 0);
    const totalSaidas = es.reduce((s, e) => s + Number(e.amount), 0);
    const totalResto = totalReceita - totalSaidas;

    const dates = Array.from(
      new Set([...ps.map((p) => p.paidAt.slice(0, 10)), ...es.map((e) => e.date)]),
    ).sort().reverse();

    let cumulativeTotal = 0;
    const rowsAsc = dates.slice().reverse().map((date) => {
      const dayPayments = ps.filter((p) => p.paidAt.slice(0, 10) === date);
      const dayExpenses = es.filter((e) => e.date === date);
      const valor = dayPayments.reduce((s, p) => s + Number(p.amount) + Number(p.penalty || 0), 0);
      const saidas = dayExpenses.reduce((s, e) => s + Number(e.amount), 0);
      const motivo = dayExpenses.map((e) => `${money(e.amount)} (${e.reason})`).join(', ') || '—';
      const resto = valor - saidas;
      cumulativeTotal += resto;
      const operador = dayPayments[0]?.operator || dayExpenses[0]?.operator || 'deezy';

      return {
        data: date,
        pagamentos: dayPayments.length,
        valor,
        saidas,
        motivo,
        resto,
        total: cumulativeTotal,
        operador,
      };
    });

    const rows = rowsAsc.reverse();

    return {
      summary: {
        pagamentos: ps.length,
        receita_total: totalReceita,
        saidas: totalSaidas,
        resto: totalResto,
        clientes: clients.length,
      },
      rows,
    };
  });

export const useGetSettings = () => query(getGetSettingsQueryKey(), () => settings);

export const useCreateClient = () =>
  mutation(({ data }) => {
    const nextId = Math.max(0, ...clients.map((c) => c.id)) + 1;
    const code = `CLI-${String(nextId).padStart(5, '0')}`;
    const newClient = {
      ...data,
      id: nextId,
      code,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };

    clients = [newClient, ...clients];
    save('clients', clients);

    // Auto generate contract
    let planName = 'TV a Cabo Comunitária';
    let planSpeed: string | null = 'Sinal Digital RF';
    let monthlyPrice = Number(settings.tvMonthlyPrice ?? 4000);

    if (newClient.serviceType === 'internet') {
      const plan =
        settings.internetPlans?.find((p: any) => p.id === data.planId) ||
        settings.internetPlans?.[0] ||
        { name: 'Fibra 10', speed: '10 Mbps/s', price: 6500 };
      planName = plan.name;
      planSpeed = plan.speed;
      monthlyPrice = Number(plan.price);
    } else if (newClient.serviceType === 'combo') {
      const plan =
        settings.internetPlans?.find((p: any) => p.id === data.planId) ||
        settings.internetPlans?.[0] ||
        { name: 'Fibra 10', speed: '10 Mbps/s', price: 6500 };
      planName = `Combo TV + ${plan.name}`;
      planSpeed = plan.speed;
      monthlyPrice = Number(settings.tvMonthlyPrice ?? 4000) + Number(plan.price);
    }

    const newContract = {
      id: Math.max(0, ...contracts.map((c) => c.id)) + 1,
      clientId: nextId,
      planName,
      planSpeed,
      monthlyPrice,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      dueDay: Number(settings.paymentDueDay ?? 5),
      status: 'active',
      terms: 'Contrato gerado automaticamente no registo do cliente.',
    };

    contracts = [newContract, ...contracts];
    save('contracts', contracts);

    return { client: newClient, contract: newContract };
  });

export const useUpdateClient = () =>
  mutation(({ clientId, data }) => {
    clients = clients.map((c) => (c.id === clientId ? { ...c, ...data } : c));
    save('clients', clients);
    return clients.find((c) => c.id === clientId);
  });

export const useCreateContract = () =>
  mutation(({ clientId, data }) => {
    const item = {
      ...data,
      id: Math.max(0, ...contracts.map((c) => c.id)) + 1,
      clientId,
      status: 'active',
    };
    contracts = [item, ...contracts];
    save('contracts', contracts);
    return item;
  });

export const useCreatePayment = () =>
  mutation(({ data }) => {
    const currentDay = new Date().getDate();
    const dueDay = Number(settings.paymentDueDay ?? 5);
    const isLate = currentDay > dueDay;
    const defaultPenalty = isLate ? Number(settings.latePenalty ?? 1000) : 0;
    const penalty = data.penalty !== undefined ? Number(data.penalty) : defaultPenalty;

    const sessionUser = session();
    const operator = sessionUser?.username || 'deezy';

    const item = {
      ...data,
      id: Math.max(0, ...payments.map((p) => p.id)) + 1,
      penalty,
      paidAt: new Date().toISOString(),
      operator,
    };

    payments = [item, ...payments];
    // Reactivate client on payment
    clients = clients.map((c) => (c.id === Number(data.clientId) ? { ...c, status: 'active' } : c));
    save('payments', payments);
    save('clients', clients);
    return item;
  });

export const useUpdateSettings = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    if (sessionUser && sessionUser.role !== 'admin') {
      throw new Error('Acesso negado: Apenas o Administrador tem autorização para alterar as definições e parâmetros globais do sistema.');
    }
    settings = { ...settings, ...data };
    save('settings', settings);
    logAuditAction({
      action: 'ATUALIZAR_DEFINICOES',
      module: 'Definições',
      description: 'Alterações efetuadas nas definições da empresa e parâmetros comerciais.',
      user: sessionUser?.username || 'admin',
    });
    return settings;
  });

export const useCreateExpense = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const item = {
      ...data,
      id: Math.max(0, ...expenses.map((e) => e.id)) + 1,
      date: data.date || new Date().toISOString().slice(0, 10),
      operator: sessionUser?.username || 'deezy',
    };
    expenses = [item, ...expenses];
    save('expenses', expenses);
    logAuditAction({
      action: 'REGISTAR_DESPESA',
      module: 'Contabilidade',
      description: `Registada despesa de ${money(item.amount)}: ${item.reason}`,
      targetId: `EXP-${item.id}`,
      user: sessionUser?.username || 'operador',
    });
    return item;
  });

export const useCreateMessage = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const item = {
      ...data,
      id: Math.max(0, ...messages.map((m) => m.id)) + 1,
      createdAt: new Date().toISOString(),
      operator: sessionUser?.username || 'deezy',
      status: 'enviada',
    };
    messages = [item, ...messages];
    save('messages', messages);
    return item;
  });

export const useCreateUser = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    if (sessionUser && sessionUser.role !== 'admin') {
      throw new Error('Apenas o Administrador pode cadastrar novos utilizadores ou colaboradores na equipa.');
    }
    const item = {
      ...data,
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      active: true,
      schedule: data.schedule || [],
      workStatus: data.workStatus || 'disponivel',
    };
    users = [...users, item];
    save('users', users);
    logAuditAction({
      action: 'CRIAR_COLABORADOR',
      module: 'Equipa',
      description: `Cadastrado colaborador ${item.name} (${item.jobTitle || item.role})`,
      targetId: `USER-${item.id}`,
      user: sessionUser?.username || 'admin',
    });
    return item;
  });

export const useUpdateUser = () =>
  mutation(({ userId, data }) => {
    const sessionUser = session();
    if (sessionUser?.role !== 'admin' && sessionUser?.id !== userId) {
      throw new Error('Apenas o Administrador ou o próprio titular pode alterar estes dados de perfil.');
    }
    users = users.map((u) => (u.id === userId ? { ...u, ...data } : u));
    save('users', users);
    const updatedUser = users.find((u) => u.id === userId);
    if (sessionUser && (sessionUser.id === userId || sessionUser.username === updatedUser?.username) && updatedUser) {
      window.localStorage.setItem(
        'osdel-session',
        JSON.stringify({
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          role: updatedUser.role,
          photoUrl: updatedUser.photoUrl,
        }),
      );
      window.dispatchEvent(new Event('osdel-auth-changed'));
    }
    logAuditAction({
      action: 'ATUALIZAR_PERFIL_COLABORADOR',
      module: 'Equipa',
      description: `Dados de perfil atualizados para ID ${userId}`,
      targetId: `USER-${userId}`,
      user: sessionUser?.username || 'admin',
    });
    return updatedUser;
  });

export const useUpdateUserWorkStatus = () =>
  mutation(({ userId, workStatus, currentTask }) => {
    users = users.map((u) =>
      u.id === userId
        ? { ...u, workStatus, ...(currentTask !== undefined ? { currentTask } : {}) }
        : u,
    );
    save('users', users);
    return users.find((u) => u.id === userId);
  });

export const useAssignTaskToUserSchedule = () =>
  mutation(({ userId, task }) => {
    const sessionUser = session();
    const newTask = {
      id: `sch-${Date.now()}`,
      time: task.time || '09:00 - 11:00',
      title: task.title,
      clientName: task.clientName || 'Cliente OSDEL',
      location: task.location || 'Luanda',
      priority: task.priority || 'normal',
      status: task.status || 'pendente',
    };
    users = users.map((u) => {
      if (u.id === userId) {
        const schedule = Array.isArray(u.schedule) ? [...u.schedule, newTask] : [newTask];
        return { ...u, schedule };
      }
      return u;
    });
    save('users', users);
    logAuditAction({
      action: 'ATRIBUIR_TAREFA_AGENDA',
      module: 'Equipa',
      description: `Atribuída tarefa "${task.title}" ao colaborador ID ${userId}`,
      targetId: `USER-${userId}`,
      user: sessionUser?.username || 'admin',
    });
    return newTask;
  });

export const useDeleteUser = () =>
  mutation(({ userId }) => {
    const sessionUser = session();
    if (sessionUser && sessionUser.role !== 'admin') {
      throw new Error('Apenas o Administrador tem autorização para desactivar colaboradores da equipa.');
    }
    users = users.map((u) => (u.id === userId ? { ...u, active: false } : u));
    save('users', users);
    logAuditAction({
      action: 'DESACTIVAR_COLABORADOR',
      module: 'Equipa',
      description: `Desactivado colaborador ID ${userId}`,
      targetId: `USER-${userId}`,
      user: sessionUser?.username || 'admin',
    });
    return true;
  });

export const useCreateJobRole = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    if (sessionUser && sessionUser.role !== 'admin') {
      throw new Error('Apenas o Administrador pode cadastrar novos cargos.');
    }
    const newRole: JobRole = {
      ...data,
      id: Math.max(0, ...jobRoles.map((r) => r.id)) + 1,
      isCustom: true,
    };
    jobRoles = [...jobRoles, newRole];
    save('job_roles', jobRoles);
    logAuditAction({
      action: 'CRIAR_CARGO',
      module: 'Equipa',
      description: `Criado novo cargo: ${newRole.title} (${newRole.department})`,
      targetId: `ROLE-${newRole.id}`,
      user: sessionUser?.username || 'admin',
    });
    return newRole;
  });

export const useDeleteJobRole = () =>
  mutation(({ roleId }) => {
    const sessionUser = session();
    if (sessionUser && sessionUser.role !== 'admin') {
      throw new Error('Apenas o Administrador pode remover cargos.');
    }
    jobRoles = jobRoles.filter((r) => r.id !== roleId);
    save('job_roles', jobRoles);
    logAuditAction({
      action: 'REMOVER_CARGO',
      module: 'Equipa',
      description: `Removido cargo ID ${roleId}`,
      targetId: `ROLE-${roleId}`,
      user: sessionUser?.username || 'admin',
    });
    return true;
  });

export const useCreateCashClosure = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const nextId = Math.max(0, ...cashClosures.map((c) => c.id)) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const closureCode = `FC-${today.replace(/-/g, '')}-${String(nextId).padStart(2, '0')}`;
    const newClosure = {
      ...data,
      id: nextId,
      closureCode,
      date: data.date || today,
      openedAt: data.openedAt || new Date().toISOString(),
      closedAt: new Date().toISOString(),
      operator: sessionUser?.username || 'operador1',
      operatorName: sessionUser?.name || 'Operador',
      status: 'pendente_validacao',
      createdAt: new Date().toISOString(),
    };
    cashClosures = [newClosure, ...cashClosures];
    save('cash_closures', cashClosures);
    logAuditAction({
      action: 'CRIAR_FECHO_CAIXA',
      module: 'Contabilidade',
      description: `Submetido termo de fecho de caixa ${closureCode} pelo operador ${newClosure.operatorName}`,
      targetId: closureCode,
      user: sessionUser?.username || 'operador',
    });
    return newClosure;
  });

export const useValidateCashClosure = () =>
  mutation(({ closureId, notes }) => {
    const sessionUser = session();
    if (sessionUser?.role !== 'admin') {
      throw new Error('Apenas o Administrador Geral tem autorização para validar e homologar fechos de caixa.');
    }
    cashClosures = cashClosures.map((c) => {
      if (c.id === closureId) {
        return {
          ...c,
          status: 'validado_admin',
          validatedBy: sessionUser.username,
          validatedAt: new Date().toISOString(),
          adminNotes: notes || 'Conferido e validado pela Direcção Financeira.',
        };
      }
      return c;
    });
    save('cash_closures', cashClosures);
    logAuditAction({
      action: 'VALIDAR_FECHO_CAIXA',
      module: 'Contabilidade',
      description: `Homologado e carimbado fecho de caixa ID ${closureId} pelo Administrador`,
      targetId: `FC-${closureId}`,
      user: sessionUser.username,
    });
    return cashClosures.find((c) => c.id === closureId);
  });

export const useCreateInvoice = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const nextId = Math.max(0, ...invoices.map((i) => i.id)) + 1;
    const year = new Date().getFullYear();
    const prefix = data.type === 'proforma' ? (settings.proformaPrefix || 'FP') : (settings.invoicePrefix || 'FT');
    const invoiceNumber = `${prefix}-${year}/${String(nextId).padStart(4, '0')}`;
    const newInvoice = {
      ...data,
      id: nextId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      operator: sessionUser?.username || 'deezy',
    };
    invoices = [newInvoice, ...invoices];
    save('invoices', invoices);
    logAuditAction({
      action: 'EMITIR_FACTURA',
      module: 'Facturação',
      description: `Emitido documento ${invoiceNumber} para ${newInvoice.clientName} no valor de ${money(newInvoice.total)}`,
      targetId: invoiceNumber,
      user: sessionUser?.username || 'operador',
    });
    return newInvoice;
  });

export const useUpdateInvoice = () =>
  mutation(({ invoiceId, data }) => {
    const sessionUser = session();
    invoices = invoices.map((inv) => (inv.id === invoiceId ? { ...inv, ...data } : inv));
    save('invoices', invoices);
    logAuditAction({
      action: 'EDITAR_FACTURA',
      module: 'Facturação',
      description: `Fatura ID ${invoiceId} atualizada`,
      targetId: `INV-${invoiceId}`,
      user: sessionUser?.username || 'operador',
    });
    return invoices.find((inv) => inv.id === invoiceId);
  });

export const useDeleteInvoice = () =>
  mutation(({ invoiceId, reason, adminPassword }) => {
    const sessionUser = session();
    const isAdmin = sessionUser?.role === 'admin';
    const isValidAdminPass = adminPassword === '52863400' || adminPassword === 'admin';
    if (!isAdmin && !isValidAdminPass) {
      throw new Error('Apenas Administradores ou operadores com credencial de supervisor podem cancelar ou anular faturas emitidas.');
    }
    if (!reason || reason.trim().length < 5) {
      throw new Error('É obrigatório justificar o motivo do cancelamento/anulação da fatura para o livro de auditoria.');
    }
    const target = invoices.find((i) => i.id === invoiceId);
    invoices = invoices.map((inv) =>
      inv.id === invoiceId
        ? {
            ...inv,
            status: 'anulada',
            cancelledAt: new Date().toISOString(),
            cancelledBy: sessionUser?.username || 'admin',
            cancelReason: reason,
          }
        : inv,
    );
    save('invoices', invoices);
    logAuditAction({
      action: 'ANULAR_FACTURA',
      module: 'Facturação',
      description: `Anulada fatura ${target?.invoiceNumber || invoiceId}. Motivo: ${reason}`,
      targetId: target?.invoiceNumber || `INV-${invoiceId}`,
      details: `Autorizado por: ${sessionUser?.username || 'admin'}. Justificativa: ${reason}`,
      user: sessionUser?.username || 'admin',
    });
    return true;
  });

export const useDeleteClient = () =>
  mutation(({ clientId }) => {
    clients = clients.filter((c) => c.id !== clientId);
    save('clients', clients);
    return true;
  });

export const useSetClientStatus = () =>
  mutation(({ clientId, status, notes }) => {
    clients = clients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          status,
          ...(notes !== undefined ? { notes } : {}),
        };
      }
      return c;
    });
    save('clients', clients);
    return clients.find((c) => c.id === clientId);
  });

export const useRegisterPaymentPromise = () =>
  mutation(({ clientId, promiseDate, notes }: { clientId: number; promiseDate: string; notes?: string }) => {
    const sessionUser = session();
    clients = clients.map((c) => {
      if (c.id === clientId) {
        const agreementNote = `[Acordo em ${new Date().toISOString().slice(0, 10)}: Prometeu liquidar até ${promiseDate}${notes ? ` - ${notes}` : ''}]`;
        return {
          ...c,
          paymentPromiseDate: promiseDate,
          promiseNotes: notes || '',
          notes: c.notes ? `${c.notes}\n${agreementNote}` : agreementNote,
        };
      }
      return c;
    });
    save('clients', clients);
    logAuditAction({
      action: 'ACORDO_PAGAMENTO',
      module: 'Cobrança',
      description: `Registado acordo/promessa de pagamento até ${promiseDate} para cliente ID ${clientId}`,
      targetId: `CLI-${clientId}`,
      user: sessionUser?.username || 'operador',
    });
    return clients.find((c) => c.id === clientId);
  });

export const useDeleteContract = () =>
  mutation(({ contractId }) => {
    contracts = contracts.filter((c) => c.id !== contractId);
    save('contracts', contracts);
    return true;
  });

export const useDeletePayment = () =>
  mutation(({ paymentId }) => {
    payments = payments.filter((p) => p.id !== paymentId);
    save('payments', payments);
    return true;
  });

export const useDeleteExpense = () =>
  mutation(({ expenseId }) => {
    expenses = expenses.filter((e) => e.id !== expenseId);
    save('expenses', expenses);
    return true;
  });

export const useUpdateExpense = () =>
  mutation(({ expenseId, data }) => {
    const sessionUser = session();
    expenses = expenses.map((e) =>
      e.id === expenseId
        ? {
            ...e,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        : e,
    );
    save('expenses', expenses);
    logAuditAction({
      action: 'ACTUALIZAR_DESPESA',
      module: 'Contabilidade',
      description: `Atualizada despesa EXP-${expenseId}: ${data.reason || ''}`,
      targetId: `EXP-${expenseId}`,
      user: sessionUser?.username || 'operador',
    });
    return expenses.find((e) => e.id === expenseId);
  });

export const useCreateTransfer = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const nextId = Math.max(0, ...accountTransfers.map((t) => t.id)) + 1;
    const item = {
      ...data,
      id: nextId,
      code: data.code || `TRF-${new Date().getFullYear()}/${String(nextId).padStart(4, '0')}`,
      date: data.date || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      operator: sessionUser?.username || 'deezy',
      status: data.status || 'concluido',
    };
    accountTransfers = [item, ...accountTransfers];
    save('account_transfers', accountTransfers);
    logAuditAction({
      action: 'TRANSFERENCIA_CONTAS',
      module: 'Tesouraria',
      description: `Transferência de ${money(item.amount)} de ${item.fromAccountName} para ${item.toAccountName}`,
      targetId: item.code,
      user: sessionUser?.username || 'operador',
    });
    return item;
  });

export const useDeleteTransfer = () =>
  mutation(({ transferId }) => {
    accountTransfers = accountTransfers.filter((t) => t.id !== transferId);
    save('account_transfers', accountTransfers);
    return true;
  });

export const useCreateFinancialAccount = () =>
  mutation(({ data }) => {
    const sessionUser = session();
    const id = data.id || `acc-${Date.now()}`;
    const item = {
      ...data,
      id,
      initialBalance: Number(data.initialBalance || 0),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    financialAccounts = [...financialAccounts, item];
    save('financial_accounts', financialAccounts);
    logAuditAction({
      action: 'CRIAR_CONTA_FINANCEIRA',
      module: 'Tesouraria',
      description: `Criada conta ${item.name} (${item.type})`,
      targetId: item.id,
      user: sessionUser?.username || 'operador',
    });
    return item;
  });

export const useUpdateFinancialAccount = () =>
  mutation(({ accountId, data }) => {
    financialAccounts = financialAccounts.map((a) =>
      a.id === accountId ? { ...a, ...data } : a,
    );
    save('financial_accounts', financialAccounts);
    return financialAccounts.find((a) => a.id === accountId);
  });

export const useDeleteFinancialAccount = () =>
  mutation(({ accountId }) => {
    financialAccounts = financialAccounts.filter((a) => a.id !== accountId);
    save('financial_accounts', financialAccounts);
    return true;
  });

export const useUpdateCategoryBudgets = () =>
  mutation(({ data }) => {
    categoryBudgets = data;
    save('category_budgets', categoryBudgets);
    return categoryBudgets;
  });

export const useToggleExpenseReconciliation = () =>
  mutation(({ expenseId, reconciled }) => {
    expenses = expenses.map((e) =>
      e.id === expenseId
        ? {
            ...e,
            isReconciled: reconciled,
            reconciledAt: reconciled ? new Date().toISOString() : null,
          }
        : e,
    );
    save('expenses', expenses);
    return true;
  });

export const useTogglePaymentReconciliation = () =>
  mutation(({ paymentId, reconciled }) => {
    payments = payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            isReconciled: reconciled,
            reconciledAt: reconciled ? new Date().toISOString() : null,
          }
        : p,
    );
    save('payments', payments);
    return true;
  });

// Inventory Mutations
export const useCreateInventoryItem = () =>
  mutation(({ data }) => {
    const nextId = Math.max(0, ...inventory.map((i) => i.id)) + 1;
    const item = {
      ...data,
      id: nextId,
      code: data.code || `MAT-${String(nextId).padStart(3, '0')}`,
      quantity: Number(data.quantity || 0),
      minQuantity: Number(data.minQuantity || 5),
      unitCost: Number(data.unitCost || 0),
    };
    inventory = [item, ...inventory];
    save('inventory', inventory);
    return item;
  });

export const useUpdateInventoryItem = () =>
  mutation(({ itemId, data }) => {
    inventory = inventory.map((i) =>
      i.id === itemId
        ? {
            ...i,
            ...data,
            quantity: Number(data.quantity !== undefined ? data.quantity : i.quantity),
            minQuantity: Number(data.minQuantity !== undefined ? data.minQuantity : i.minQuantity),
            unitCost: Number(data.unitCost !== undefined ? data.unitCost : i.unitCost),
          }
        : i,
    );
    save('inventory', inventory);
    return inventory.find((i) => i.id === itemId);
  });

export const useAdjustInventoryStock = () =>
  mutation(({ itemId, delta, reason }) => {
    inventory = inventory.map((i) => {
      if (i.id === itemId) {
        const newQty = Math.max(0, Number(i.quantity) + Number(delta));
        return { ...i, quantity: newQty };
      }
      return i;
    });
    save('inventory', inventory);

    // If negative adjustment and reason provided, optionally log as expense if material purchased
    if (delta > 0 && reason) {
      const item = inventory.find((i) => i.id === itemId);
      if (item && item.unitCost) {
        const cost = Number(item.unitCost) * Number(delta);
        const sessionUser = session();
        expenses = [
          {
            id: Math.max(0, ...expenses.map((e) => e.id)) + 1,
            date: new Date().toISOString().slice(0, 10),
            amount: cost,
            reason: `Compra stock: ${delta}x ${item.name} (${reason})`,
            account: 'Caixa',
            operator: sessionUser?.username || 'deezy',
          },
          ...expenses,
        ];
        save('expenses', expenses);
      }
    }
    return inventory.find((i) => i.id === itemId);
  });

export const useDeleteInventoryItem = () =>
  mutation(({ itemId }) => {
    inventory = inventory.filter((i) => i.id !== itemId);
    save('inventory', inventory);
    return true;
  });

// Equipment Assignment Mutations
export const useAssignEquipment = () =>
  mutation(({ data }) => {
    const item = {
      ...data,
      id: Math.max(0, ...equipmentAssignments.map((e) => e.id)) + 1,
      status: 'installed',
      installedAt: data.installedAt || new Date().toISOString().slice(0, 10),
    };
    equipmentAssignments = [item, ...equipmentAssignments];
    save('equipment_assignments', equipmentAssignments);

    // Deduct 1 from inventory if inventoryItemId is provided
    if (data.inventoryItemId) {
      inventory = inventory.map((inv) =>
        inv.id === Number(data.inventoryItemId)
          ? { ...inv, quantity: Math.max(0, Number(inv.quantity) - 1) }
          : inv,
      );
      save('inventory', inventory);
    }

    // Also update client ONU / PDO if provided
    if (data.clientId) {
      clients = clients.map((c) => {
        if (c.id === Number(data.clientId)) {
          return {
            ...c,
            ...(data.serialNumber ? { onuNumber: data.serialNumber } : {}),
            ...(data.pdoNumber ? { pdoNumber: data.pdoNumber } : {}),
          };
        }
        return c;
      });
      save('clients', clients);
    }

    return item;
  });

export const useUpdateEquipmentStatus = () =>
  mutation(({ id, status, notes }) => {
    equipmentAssignments = equipmentAssignments.map((eq) =>
      eq.id === id ? { ...eq, status, ...(notes ? { notes } : {}) } : eq,
    );
    save('equipment_assignments', equipmentAssignments);
    return equipmentAssignments.find((eq) => eq.id === id);
  });

export const useRemoveEquipment = () =>
  mutation(({ id }) => {
    equipmentAssignments = equipmentAssignments.filter((eq) => eq.id !== id);
    save('equipment_assignments', equipmentAssignments);
    return true;
  });

// Service Orders Mutations
export const useCreateServiceOrder = () =>
  mutation(({ data }) => {
    const nextId = Math.max(0, ...serviceOrders.map((s) => s.id)) + 1;
    const code = `OS-${String(nextId).padStart(5, '0')}`;
    const sessionUser = session();

    const item = {
      ...data,
      id: nextId,
      code,
      status: data.status || 'pendente',
      priority: data.priority || 'normal',
      cableUsedMeters: Number(data.cableUsedMeters || 0),
      createdAt: new Date().toISOString(),
      completedAt: null,
      operator: sessionUser?.username || 'deezy',
    };

    serviceOrders = [item, ...serviceOrders];
    save('service_orders', serviceOrders);
    return item;
  });

export const useUpdateServiceOrder = () =>
  mutation(({ orderId, data }) => {
    serviceOrders = serviceOrders.map((so) => {
      if (so.id === orderId) {
        const updated = {
          ...so,
          ...data,
          cableUsedMeters: Number(data.cableUsedMeters !== undefined ? data.cableUsedMeters : so.cableUsedMeters),
        };

        if (data.status === 'concluida' && !so.completedAt) {
          updated.completedAt = new Date().toISOString();

          // If this was a cut or reconnection order, automatically synchronize client status
          if (so.type === 'corte') {
            clients = clients.map((c) => (c.id === so.clientId ? { ...c, status: 'suspended' } : c));
            save('clients', clients);
          } else if (so.type === 'religacao' || so.type === 'instalacao') {
            clients = clients.map((c) => (c.id === so.clientId ? { ...c, status: 'active' } : c));
            save('clients', clients);
          }
        }
        return updated;
      }
      return so;
    });

    save('service_orders', serviceOrders);
    return serviceOrders.find((so) => so.id === orderId);
  });

export const useDeleteServiceOrder = () =>
  mutation(({ orderId }) => {
    serviceOrders = serviceOrders.filter((so) => so.id !== orderId);
    save('service_orders', serviceOrders);
    return true;
  });

// Database Backup and Restore
export const exportDatabaseJson = () => {
  const fullBackup = {
    version: '2.5',
    exportedAt: new Date().toISOString(),
    clients,
    payments,
    contracts,
    settings,
    users,
    expenses,
    financialAccounts,
    accountTransfers,
    categoryBudgets,
    messages,
    inventory,
    equipmentAssignments,
    serviceOrders,
    cashClosures,
    invoices,
    auditLogs,
  };
  return JSON.stringify(fullBackup, null, 2);
};

export const importDatabaseJson = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.clients && Array.isArray(data.clients)) {
      clients = data.clients;
      save('clients', clients);
    }
    if (data.payments && Array.isArray(data.payments)) {
      payments = data.payments;
      save('payments', payments);
    }
    if (data.contracts && Array.isArray(data.contracts)) {
      contracts = data.contracts;
      save('contracts', contracts);
    }
    if (data.settings && typeof data.settings === 'object') {
      settings = data.settings;
      save('settings', settings);
    }
    if (data.users && Array.isArray(data.users)) {
      users = data.users;
      save('users', users);
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      expenses = data.expenses;
      save('expenses', expenses);
    }
    if (data.financialAccounts && Array.isArray(data.financialAccounts)) {
      financialAccounts = data.financialAccounts;
      save('financial_accounts', financialAccounts);
    }
    if (data.accountTransfers && Array.isArray(data.accountTransfers)) {
      accountTransfers = data.accountTransfers;
      save('account_transfers', accountTransfers);
    }
    if (data.categoryBudgets && Array.isArray(data.categoryBudgets)) {
      categoryBudgets = data.categoryBudgets;
      save('category_budgets', categoryBudgets);
    }
    if (data.messages && Array.isArray(data.messages)) {
      messages = data.messages;
      save('messages', messages);
    }
    if (data.inventory && Array.isArray(data.inventory)) {
      inventory = data.inventory;
      save('inventory', inventory);
    }
    if (data.equipmentAssignments && Array.isArray(data.equipmentAssignments)) {
      equipmentAssignments = data.equipmentAssignments;
      save('equipment_assignments', equipmentAssignments);
    }
    if (data.serviceOrders && Array.isArray(data.serviceOrders)) {
      serviceOrders = data.serviceOrders;
      save('service_orders', serviceOrders);
    }
    if (data.cashClosures && Array.isArray(data.cashClosures)) {
      cashClosures = data.cashClosures;
      save('cash_closures', cashClosures);
    }
    if (data.invoices && Array.isArray(data.invoices)) {
      invoices = data.invoices;
      save('invoices', invoices);
    }
    if (data.auditLogs && Array.isArray(data.auditLogs)) {
      auditLogs = data.auditLogs;
      save('audit_logs', auditLogs);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Ficheiro JSON inválido' };
  }
};

export const resetDatabaseToDefaults = () => {
  clients = seedClients;
  payments = seedPayments;
  contracts = seedContracts;
  settings = seedSettings;
  users = seedUsers;
  expenses = seedExpenses;
  financialAccounts = seedFinancialAccounts;
  accountTransfers = seedAccountTransfers;
  categoryBudgets = seedCategoryBudgets;
  messages = seedMessages;
  inventory = seedInventory;
  equipmentAssignments = seedEquipmentAssignments;
  serviceOrders = seedServiceOrders;

  save('clients', clients);
  save('payments', payments);
  save('contracts', contracts);
  save('settings', settings);
  save('users', users);
  save('expenses', expenses);
  save('financial_accounts', financialAccounts);
  save('account_transfers', accountTransfers);
  save('category_budgets', categoryBudgets);
  save('messages', messages);
  save('inventory', inventory);
  save('equipment_assignments', equipmentAssignments);
  save('service_orders', serviceOrders);
  return true;
};

export const authenticate = (username: string, password: string) => {
  const found = users.find(
    (u) => u.username === username.trim().toLowerCase() && u.password === password && u.active !== false,
  );
  if (found) {
    window.localStorage.setItem(
      'osdel-session',
      JSON.stringify({
        id: found.id,
        username: found.username,
        name: found.name,
        role: found.role,
        photoUrl: found.photoUrl,
      }),
    );
    window.dispatchEvent(new Event('osdel-auth-changed'));
  }
  return found;
};

export const signOut = () => {
  window.localStorage.removeItem('osdel-session');
  window.dispatchEvent(new Event('osdel-auth-changed'));
};

export const session = () => {
  try {
    return JSON.parse(localStorage.getItem('osdel-session') || 'null');
  } catch {
    return null;
  }
};

export const money = (value: unknown) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace('AOA', 'Kz');

export const kz = money;
