/**
 * OSDEL TECNOLOGIA - MÓDULO DE FECHOS MENSAIS CONSOLIDADOS
 * Gestão, Auditoria e Histórico Completo de Encerramentos Mensais de Contas
 * TV a Cabo Comunitária & Internet Fibra Óptica em Angola
 */

import { pushNotification } from './notifications';

export interface MonthlyRevenueBreakdown {
  fiberInternet: { amount: number; count: number; description: string };
  communityTv: { amount: number; count: number; description: string };
  comboTvInternet: { amount: number; count: number; description: string };
  installations: { amount: number; count: number; description: string };
  reactivations: { amount: number; count: number; description: string };
  equipmentSales: { amount: number; count: number; description: string };
  penaltiesAndFees: { amount: number; count: number; description: string };
}

export interface MonthlyPaymentMethodsBreakdown {
  multicaixaExpress: { amount: number; count: number };
  bankTransferBai: { amount: number; count: number };
  bankTransferBfa: { amount: number; count: number };
  tpaMulticaixa: { amount: number; count: number };
  cashOffice: { amount: number; count: number };
  bankDeposit: { amount: number; count: number };
}

export interface MonthlyExpensesBreakdown {
  upstreamBandwidth: { amount: number; notes: string };
  fleetAndFuel: { amount: number; notes: string };
  networkMaterials: { amount: number; notes: string };
  rentAndUtilities: { amount: number; notes: string };
  commsAndSoftware: { amount: number; notes: string };
  officeAndMisc: { amount: number; notes: string };
}

export interface MonthlyClientMetrics {
  activeClientsStart: number;
  newActivations: number;
  churnCancellations: number;
  suspendedNonPayment: number;
  activeClientsEnd: number;
  churnRate: number; // %
  arpu: number; // Receita média por cliente em Kz
  collectionEfficiency: number; // % cobrança sobre facturação emitida
}

export interface MonthlyTechnicalMetrics {
  serviceOrdersTotal: number;
  serviceOrdersResolved: number;
  slaAdherenceRate: number; // %
  mttrHours: number; // Tempo médio de reparação em horas
  fiberBreakagesRepaired: number;
  customerSatisfactionScore: number; // 0-100%
}

export interface MonthlyDebtMetrics {
  advancesIssuedThisMonth: number;
  advancesRecoveredThisMonth: number;
  outstandingStaffDebtEndOfMonth: number;
  employeesInDebtCount: number;
}

export interface MonthlyBankReconciliation {
  baiBalance: number;
  bfaBalance: number;
  cashInSafe: number;
  totalTreasuryBalance: number;
  reconciliationDifference: number;
  notes: string;
}

export interface MonthlyClosure {
  id: string;
  code: string; // Ex: 'FM-2026-09'
  year: number;
  month: number; // 1-12
  monthName: string; // Ex: 'Setembro 2026'
  periodStart: string;
  periodEnd: string;
  closedAt: string;
  closedBy: string;
  status: 'homologado' | 'auditado' | 'fechado' | 'em_consolidacao';
  validatedBy?: string;
  validatedAt?: string;
  validationNotes?: string;
  
  // Resumo Financeiro Consolidado
  financials: {
    invoicedTotal: number;
    revenueCollected: number;
    collectionRate: number; // %
    operatingExpenses: number;
    payrollGross: number;
    payrollLoanDeductions: number;
    payrollNetPaid: number;
    totalCosts: number; // operatingExpenses + payrollNetPaid
    netResult: number; // revenueCollected - totalCosts
    profitMargin: number; // %
    previousMonthRevenue: number;
    revenueGrowthRate: number; // % MoM
  };

  // Detalhamentos Analíticos
  revenueBreakdown: MonthlyRevenueBreakdown;
  paymentMethodsBreakdown: MonthlyPaymentMethodsBreakdown;
  expensesBreakdown: MonthlyExpensesBreakdown;
  clientMetrics: MonthlyClientMetrics;
  technicalMetrics: MonthlyTechnicalMetrics;
  debtMetrics: MonthlyDebtMetrics;
  bankReconciliation: MonthlyBankReconciliation;

  // Certificação Institucional
  auditCertificate: {
    companyName: string;
    nif: string;
    headquarters: string;
    auditedBy: string;
    directorApproval: string;
    accountingCertification: string;
    certificateNumber: string;
  };

  internalNotes?: string;
}

const STORAGE_KEY = 'osdel_monthly_closures';

export const SEED_MONTHLY_CLOSURES: MonthlyClosure[] = [
  {
    id: 'mc-2026-09',
    code: 'FM-2026-09',
    year: 2026,
    month: 9,
    monthName: 'Setembro 2026',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    closedAt: '2026-09-18T19:40:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'em_consolidacao',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-09-18T20:00:00Z',
    validationNotes: 'Fecho mensal preliminar consolidado até 18 de Setembro. Retenções salariais de empréstimos em conformidade com a tesouraria.',
    financials: {
      invoicedTotal: 2950000,
      revenueCollected: 2684000,
      collectionRate: 90.98,
      operatingExpenses: 780000,
      payrollGross: 1250000,
      payrollLoanDeductions: 85000,
      payrollNetPaid: 1165000,
      totalCosts: 1945000,
      netResult: 739000,
      profitMargin: 27.53,
      previousMonthRevenue: 2540000,
      revenueGrowthRate: 5.67,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1420000, count: 142, description: 'Planos Residencial Fibra 10M, 20M e Comercial 50M' },
      communityTv: { amount: 680000, count: 170, description: 'TV Comunitária Pacotes Básico e Familiar' },
      comboTvInternet: { amount: 340000, count: 34, description: 'Planos Combinados TV + Fibra Óptica' },
      installations: { amount: 120000, count: 8, description: 'Taxas de instalação em novos bairros de Luanda' },
      reactivations: { amount: 44000, count: 22, description: 'Reativação de assinaturas após pagamento em atraso' },
      equipmentSales: { amount: 65000, count: 5, description: 'Venda de routers ONT Wi-Fi Dual Band e cabos de patch' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Juros e multas por atraso de liquidação' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1350000, count: 215 },
      bankTransferBai: { amount: 620000, count: 68 },
      bankTransferBfa: { amount: 380000, count: 42 },
      tpaMulticaixa: { amount: 194000, count: 28 },
      cashOffice: { amount: 115000, count: 24 },
      bankDeposit: { amount: 25000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Link de Trânsito IP 1 Gbps Angola Cables & fibra de transporte' },
      fleetAndFuel: { amount: 145000, notes: 'Gasóleo para carrinha de piquete e gasolina de 3 motorizadas técnicas' },
      networkMaterials: { amount: 160000, notes: '1 Bobina drop 1000m, 4 caixas CTO 16 portas e conectores SC/APC' },
      rentAndUtilities: { amount: 95000, notes: 'Renda do centro de dados e escritório, energia ENDE e água EPAL' },
      commsAndSoftware: { amount: 35000, notes: 'Gateway de SMS para avisos de faturas e licenças de monitorização' },
      officeAndMisc: { amount: 25000, notes: 'Material de escritório e alimentação do piquete noturno de emergência' },
    },
    clientMetrics: {
      activeClientsStart: 334,
      newActivations: 16,
      churnCancellations: 4,
      suspendedNonPayment: 12,
      activeClientsEnd: 346,
      churnRate: 1.19,
      arpu: 7757,
      collectionEfficiency: 90.98,
    },
    technicalMetrics: {
      serviceOrdersTotal: 48,
      serviceOrdersResolved: 46,
      slaAdherenceRate: 95.83,
      mttrHours: 2.8,
      fiberBreakagesRepaired: 7,
      customerSatisfactionScore: 94,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 85000,
      advancesRecoveredThisMonth: 60000,
      outstandingStaffDebtEndOfMonth: 60000,
      employeesInDebtCount: 2,
    },
    bankReconciliation: {
      baiBalance: 1240000,
      bfaBalance: 780000,
      cashInSafe: 115000,
      totalTreasuryBalance: 2135000,
      reconciliationDifference: 0,
      notes: 'Saldos bancários conferidos via extractos electrónicos BAI Direto e BFA Net.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Certificação Contabilística com parecer limpo sem reservas.',
      certificateNumber: 'CERT-OSDEL-2026-09-4102',
    },
    internalNotes: 'Excelente índice de liquidação por Multicaixa Express (50.3% do volume total). Aprovado reforço de bobinas de fibra para expansão no próximo mês.',
  },
  {
    id: 'mc-2026-08',
    code: 'FM-2026-08',
    year: 2026,
    month: 8,
    monthName: 'Agosto 2026',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    closedAt: '2026-08-31T20:30:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-09-01T09:15:00Z',
    validationNotes: 'Fecho de contas mensal homologado e carimbado sem divergências de tesouraria.',
    financials: {
      invoicedTotal: 2780000,
      revenueCollected: 2540000,
      collectionRate: 91.37,
      operatingExpenses: 745000,
      payrollGross: 1250000,
      payrollLoanDeductions: 50000,
      payrollNetPaid: 1200000,
      totalCosts: 1945000,
      netResult: 595000,
      profitMargin: 23.43,
      previousMonthRevenue: 2420000,
      revenueGrowthRate: 4.96,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1330000, count: 133, description: 'Planos Fibra Residencial e PME' },
      communityTv: { amount: 670000, count: 168, description: 'TV a Cabo Coaxial Comunitária' },
      comboTvInternet: { amount: 310000, count: 31, description: 'Pacotes Combo Fibra + TV' },
      installations: { amount: 105000, count: 7, description: 'Taxas de ativação e passagem de cabos' },
      reactivations: { amount: 48000, count: 24, description: 'Reativações de clientes' },
      equipmentSales: { amount: 62000, count: 4, description: 'Venda de ONTs Huawei/ZTE e cabos HDMI' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Encargos por atraso de pagamento' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1260000, count: 202 },
      bankTransferBai: { amount: 590000, count: 65 },
      bankTransferBfa: { amount: 370000, count: 41 },
      tpaMulticaixa: { amount: 180000, count: 26 },
      cashOffice: { amount: 110000, count: 22 },
      bankDeposit: { amount: 30000, count: 4 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Trânsito IP Angola Cables' },
      fleetAndFuel: { amount: 140000, notes: 'Combustível e revisão mecânica de motas' },
      networkMaterials: { amount: 145000, notes: 'Emendas mecânicas, álcool isopropílico e splitters PLC' },
      rentAndUtilities: { amount: 95000, notes: 'Renda, água e eletricidade comercial' },
      commsAndSoftware: { amount: 25000, notes: 'Comunicações e telefones de piquete' },
      officeAndMisc: { amount: 20000, notes: 'Consumíveis e material de escritório' },
    },
    clientMetrics: {
      activeClientsStart: 321,
      newActivations: 18,
      churnCancellations: 5,
      suspendedNonPayment: 14,
      activeClientsEnd: 334,
      churnRate: 1.55,
      arpu: 7604,
      collectionEfficiency: 91.37,
    },
    technicalMetrics: {
      serviceOrdersTotal: 52,
      serviceOrdersResolved: 51,
      slaAdherenceRate: 98.07,
      mttrHours: 2.5,
      fiberBreakagesRepaired: 9,
      customerSatisfactionScore: 95,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 50000,
      advancesRecoveredThisMonth: 50000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 1180000,
      bfaBalance: 720000,
      cashInSafe: 110000,
      totalTreasuryBalance: 2010000,
      reconciliationDifference: 0,
      notes: 'Conciliação fechada com extratos dos bancos e livro de caixa físico.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Certificado de Encerramento Mensal Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-08-3920',
    },
    internalNotes: 'Mês com excelente desempenho técnico durante o período de maior procura de entretenimento familiar.',
  },
  {
    id: 'mc-2026-07',
    code: 'FM-2026-07',
    year: 2026,
    month: 7,
    monthName: 'Julho 2026',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    closedAt: '2026-07-31T20:00:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-08-01T10:00:00Z',
    validationNotes: 'Fecho aprovado pelo conselho e carimbado oficialmente.',
    financials: {
      invoicedTotal: 2650000,
      revenueCollected: 2420000,
      collectionRate: 91.32,
      operatingExpenses: 720000,
      payrollGross: 1220000,
      payrollLoanDeductions: 40000,
      payrollNetPaid: 1180000,
      totalCosts: 1900000,
      netResult: 520000,
      profitMargin: 21.49,
      previousMonthRevenue: 2310000,
      revenueGrowthRate: 4.76,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1260000, count: 126, description: 'Planos Fibra' },
      communityTv: { amount: 650000, count: 162, description: 'TV Comunitária' },
      comboTvInternet: { amount: 290000, count: 29, description: 'Combos' },
      installations: { amount: 90000, count: 6, description: 'Taxas de instalação' },
      reactivations: { amount: 52000, count: 26, description: 'Reativações' },
      equipmentSales: { amount: 63000, count: 4, description: 'Roteadores e conversores' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Multas de atraso' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1180000, count: 190 },
      bankTransferBai: { amount: 570000, count: 62 },
      bankTransferBfa: { amount: 360000, count: 39 },
      tpaMulticaixa: { amount: 175000, count: 24 },
      cashOffice: { amount: 105000, count: 20 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 135000, notes: 'Frota operacional' },
      networkMaterials: { amount: 135000, notes: 'Fibra e conectores' },
      rentAndUtilities: { amount: 90000, notes: 'Custos fixos de instalações' },
      commsAndSoftware: { amount: 22000, notes: 'Sistemas e licenças' },
      officeAndMisc: { amount: 18000, notes: 'Gerais de escritório' },
    },
    clientMetrics: {
      activeClientsStart: 309,
      newActivations: 16,
      churnCancellations: 4,
      suspendedNonPayment: 15,
      activeClientsEnd: 321,
      churnRate: 1.29,
      arpu: 7538,
      collectionEfficiency: 91.32,
    },
    technicalMetrics: {
      serviceOrdersTotal: 49,
      serviceOrdersResolved: 48,
      slaAdherenceRate: 97.95,
      mttrHours: 2.6,
      fiberBreakagesRepaired: 8,
      customerSatisfactionScore: 93,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 40000,
      advancesRecoveredThisMonth: 40000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 1120000,
      bfaBalance: 690000,
      cashInSafe: 105000,
      totalTreasuryBalance: 1915000,
      reconciliationDifference: 0,
      notes: 'Reconciliação validada com as contas bancárias sem pendentes.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Homologação Oficial de Encerramento Contabilístico.',
      certificateNumber: 'CERT-OSDEL-2026-07-3801',
    },
    internalNotes: 'Consolidação das novas CTOs no bairro Golf e aumento das vendas de planos combo.',
  },
  {
    id: 'mc-2026-06',
    code: 'FM-2026-06',
    year: 2026,
    month: 6,
    monthName: 'Junho 2026',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    closedAt: '2026-06-30T21:00:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-07-01T08:30:00Z',
    validationNotes: 'Fecho semestral com relatório auditado e certificado emitido.',
    financials: {
      invoicedTotal: 2520000,
      revenueCollected: 2310000,
      collectionRate: 91.66,
      operatingExpenses: 695000,
      payrollGross: 1220000,
      payrollLoanDeductions: 35000,
      payrollNetPaid: 1185000,
      totalCosts: 1880000,
      netResult: 430000,
      profitMargin: 18.61,
      previousMonthRevenue: 2240000,
      revenueGrowthRate: 3.12,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1190000, count: 119, description: 'Planos Fibra Residencial' },
      communityTv: { amount: 630000, count: 158, description: 'TV Comunitária' },
      comboTvInternet: { amount: 280000, count: 28, description: 'Pacotes TV + Fibra' },
      installations: { amount: 90000, count: 6, description: 'Ativações de novos clientes' },
      reactivations: { amount: 46000, count: 23, description: 'Taxas de reativação' },
      equipmentSales: { amount: 59000, count: 4, description: 'Equipamentos vendidos' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Mora e penalidades' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1110000, count: 182 },
      bankTransferBai: { amount: 550000, count: 59 },
      bankTransferBfa: { amount: 350000, count: 37 },
      tpaMulticaixa: { amount: 170000, count: 23 },
      cashOffice: { amount: 100000, count: 19 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 125000, notes: 'Combustível de equipas técnicas' },
      networkMaterials: { amount: 125000, notes: 'Caixas CTO e splitters' },
      rentAndUtilities: { amount: 88000, notes: 'Custos prediais' },
      commsAndSoftware: { amount: 20000, notes: 'Comunicações internas' },
      officeAndMisc: { amount: 17000, notes: 'Diversos' },
    },
    clientMetrics: {
      activeClientsStart: 297,
      newActivations: 15,
      churnCancellations: 3,
      suspendedNonPayment: 13,
      activeClientsEnd: 309,
      churnRate: 1.01,
      arpu: 7475,
      collectionEfficiency: 91.66,
    },
    technicalMetrics: {
      serviceOrdersTotal: 44,
      serviceOrdersResolved: 43,
      slaAdherenceRate: 97.72,
      mttrHours: 2.7,
      fiberBreakagesRepaired: 6,
      customerSatisfactionScore: 92,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 35000,
      advancesRecoveredThisMonth: 35000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 1050000,
      bfaBalance: 650000,
      cashInSafe: 100000,
      totalTreasuryBalance: 1800000,
      reconciliationDifference: 0,
      notes: 'Reconciliação semestral aprovada com sucesso.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Termo de Fecho Semestral Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-06-3688',
    },
    internalNotes: 'Primeiro semestre encerrado com crescimento de 24% na base total de assinantes de internet fibra.',
  },
  {
    id: 'mc-2026-05',
    code: 'FM-2026-05',
    year: 2026,
    month: 5,
    monthName: 'Maio 2026',
    periodStart: '2026-05-01',
    periodEnd: '2026-05-31',
    closedAt: '2026-05-31T20:15:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-06-01T09:00:00Z',
    validationNotes: 'Fecho mensal verificado e validado.',
    financials: {
      invoicedTotal: 2450000,
      revenueCollected: 2240000,
      collectionRate: 91.42,
      operatingExpenses: 680000,
      payrollGross: 1200000,
      payrollLoanDeductions: 30000,
      payrollNetPaid: 1170000,
      totalCosts: 1850000,
      netResult: 390000,
      profitMargin: 17.41,
      previousMonthRevenue: 2180000,
      revenueGrowthRate: 2.75,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1140000, count: 114, description: 'Planos Fibra Residencial' },
      communityTv: { amount: 620000, count: 155, description: 'TV Comunitária' },
      comboTvInternet: { amount: 260000, count: 26, description: 'Pacotes TV + Fibra' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 42000, count: 21, description: 'Reativações' },
      equipmentSales: { amount: 58000, count: 4, description: 'Acessórios e ONTs' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Penalizações' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1070000, count: 175 },
      bankTransferBai: { amount: 530000, count: 57 },
      bankTransferBfa: { amount: 340000, count: 35 },
      tpaMulticaixa: { amount: 165000, count: 22 },
      cashOffice: { amount: 105000, count: 20 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 120000, notes: 'Combustível' },
      networkMaterials: { amount: 120000, notes: 'Cabos e fusões' },
      rentAndUtilities: { amount: 85000, notes: 'Rendas e água/luz' },
      commsAndSoftware: { amount: 20000, notes: 'Software' },
      officeAndMisc: { amount: 15000, notes: 'Escritório' },
    },
    clientMetrics: {
      activeClientsStart: 286,
      newActivations: 14,
      churnCancellations: 3,
      suspendedNonPayment: 12,
      activeClientsEnd: 297,
      churnRate: 1.05,
      arpu: 7542,
      collectionEfficiency: 91.42,
    },
    technicalMetrics: {
      serviceOrdersTotal: 41,
      serviceOrdersResolved: 40,
      slaAdherenceRate: 97.56,
      mttrHours: 2.8,
      fiberBreakagesRepaired: 5,
      customerSatisfactionScore: 91,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 30000,
      advancesRecoveredThisMonth: 30000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 980000,
      bfaBalance: 610000,
      cashInSafe: 105000,
      totalTreasuryBalance: 1695000,
      reconciliationDifference: 0,
      notes: 'Valores em conformidade com as folhas de caixa.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Termo de Fecho Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-05-3512',
    },
    internalNotes: 'Manutenção preventiva executada nos armários de distribuição do sector 3.',
  },
  {
    id: 'mc-2026-04',
    code: 'FM-2026-04',
    year: 2026,
    month: 4,
    monthName: 'Abril 2026',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    closedAt: '2026-04-30T20:45:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-05-02T08:45:00Z',
    validationNotes: 'Fecho mensal validado após conciliação com extrato bancário de Abril.',
    financials: {
      invoicedTotal: 2380000,
      revenueCollected: 2180000,
      collectionRate: 91.59,
      operatingExpenses: 665000,
      payrollGross: 1200000,
      payrollLoanDeductions: 25000,
      payrollNetPaid: 1175000,
      totalCosts: 1840000,
      netResult: 340000,
      profitMargin: 15.59,
      previousMonthRevenue: 2110000,
      revenueGrowthRate: 3.32,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1090000, count: 109, description: 'Planos Fibra' },
      communityTv: { amount: 610000, count: 152, description: 'TV Comunitária' },
      comboTvInternet: { amount: 250000, count: 25, description: 'Combos' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 50000, count: 25, description: 'Reativações' },
      equipmentSales: { amount: 60000, count: 4, description: 'Vendas de equipamento' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Juros e penalidades' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 1040000, count: 168 },
      bankTransferBai: { amount: 510000, count: 54 },
      bankTransferBfa: { amount: 330000, count: 34 },
      tpaMulticaixa: { amount: 160000, count: 21 },
      cashOffice: { amount: 110000, count: 22 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 115000, notes: 'Combustível piquete' },
      networkMaterials: { amount: 115000, notes: 'Materiais de instalação' },
      rentAndUtilities: { amount: 82000, notes: 'Renda e serviços básicos' },
      commsAndSoftware: { amount: 18000, notes: 'Software e SMS' },
      officeAndMisc: { amount: 15000, notes: 'Despesas diversas' },
    },
    clientMetrics: {
      activeClientsStart: 275,
      newActivations: 14,
      churnCancellations: 3,
      suspendedNonPayment: 14,
      activeClientsEnd: 286,
      churnRate: 1.09,
      arpu: 7622,
      collectionEfficiency: 91.59,
    },
    technicalMetrics: {
      serviceOrdersTotal: 39,
      serviceOrdersResolved: 38,
      slaAdherenceRate: 97.43,
      mttrHours: 2.9,
      fiberBreakagesRepaired: 4,
      customerSatisfactionScore: 90,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 25000,
      advancesRecoveredThisMonth: 25000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 920000,
      bfaBalance: 570000,
      cashInSafe: 110000,
      totalTreasuryBalance: 1600000,
      reconciliationDifference: 0,
      notes: 'Saldos bancários conciliados.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Termo de Fecho Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-04-3390',
    },
    internalNotes: 'Estabilidade operacional mantida durante chuvas sazonais.',
  },
  {
    id: 'mc-2026-03',
    code: 'FM-2026-03',
    year: 2026,
    month: 3,
    monthName: 'Março 2026',
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    closedAt: '2026-03-31T20:00:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-04-01T09:30:00Z',
    validationNotes: 'Fecho do 1º Trimestre de 2026 homologado com balancete consolidado.',
    financials: {
      invoicedTotal: 2310000,
      revenueCollected: 2110000,
      collectionRate: 91.34,
      operatingExpenses: 650000,
      payrollGross: 1180000,
      payrollLoanDeductions: 20000,
      payrollNetPaid: 1160000,
      totalCosts: 1810000,
      netResult: 300000,
      profitMargin: 14.21,
      previousMonthRevenue: 2040000,
      revenueGrowthRate: 3.43,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 1040000, count: 104, description: 'Planos Fibra' },
      communityTv: { amount: 600000, count: 150, description: 'TV Comunitária' },
      comboTvInternet: { amount: 240000, count: 24, description: 'Combos' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 48000, count: 24, description: 'Reativações' },
      equipmentSales: { amount: 62000, count: 4, description: 'Equipamentos' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Multas de mora' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 990000, count: 160 },
      bankTransferBai: { amount: 500000, count: 52 },
      bankTransferBfa: { amount: 325000, count: 33 },
      tpaMulticaixa: { amount: 155000, count: 20 },
      cashOffice: { amount: 110000, count: 22 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 110000, notes: 'Combustível' },
      networkMaterials: { amount: 110000, notes: 'Materiais' },
      rentAndUtilities: { amount: 80000, notes: 'Custos prediais' },
      commsAndSoftware: { amount: 16000, notes: 'Comunicações' },
      officeAndMisc: { amount: 14000, notes: 'Diversos' },
    },
    clientMetrics: {
      activeClientsStart: 264,
      newActivations: 13,
      churnCancellations: 2,
      suspendedNonPayment: 13,
      activeClientsEnd: 275,
      churnRate: 0.76,
      arpu: 7672,
      collectionEfficiency: 91.34,
    },
    technicalMetrics: {
      serviceOrdersTotal: 38,
      serviceOrdersResolved: 37,
      slaAdherenceRate: 97.36,
      mttrHours: 2.8,
      fiberBreakagesRepaired: 4,
      customerSatisfactionScore: 91,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 20000,
      advancesRecoveredThisMonth: 20000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 860000,
      bfaBalance: 530000,
      cashInSafe: 110000,
      totalTreasuryBalance: 1500000,
      reconciliationDifference: 0,
      notes: 'Fecho do 1º Trimestre concluído.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Certificado de Auditoria do 1º Trimestre.',
      certificateNumber: 'CERT-OSDEL-2026-03-3198',
    },
    internalNotes: '1º Trimestre concluído com cumprimento de 104% das metas de receita da empresa.',
  },
  {
    id: 'mc-2026-02',
    code: 'FM-2026-02',
    year: 2026,
    month: 2,
    monthName: 'Fevereiro 2026',
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    closedAt: '2026-02-28T20:30:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-03-01T09:00:00Z',
    validationNotes: 'Fecho do mês de Fevereiro conferido e homologado.',
    financials: {
      invoicedTotal: 2230000,
      revenueCollected: 2040000,
      collectionRate: 91.48,
      operatingExpenses: 640000,
      payrollGross: 1180000,
      payrollLoanDeductions: 15000,
      payrollNetPaid: 1165000,
      totalCosts: 1805000,
      netResult: 235000,
      profitMargin: 11.52,
      previousMonthRevenue: 1980000,
      revenueGrowthRate: 3.03,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 990000, count: 99, description: 'Planos Fibra' },
      communityTv: { amount: 590000, count: 147, description: 'TV Comunitária' },
      comboTvInternet: { amount: 230000, count: 23, description: 'Combos' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 48000, count: 24, description: 'Reativações' },
      equipmentSales: { amount: 62000, count: 4, description: 'Equipamentos' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Multas' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 960000, count: 155 },
      bankTransferBai: { amount: 480000, count: 50 },
      bankTransferBfa: { amount: 315000, count: 32 },
      tpaMulticaixa: { amount: 150000, count: 19 },
      cashOffice: { amount: 105000, count: 21 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 108000, notes: 'Combustível' },
      networkMaterials: { amount: 105000, notes: 'Materiais de rede' },
      rentAndUtilities: { amount: 78000, notes: 'Rendas' },
      commsAndSoftware: { amount: 15000, notes: 'Software' },
      officeAndMisc: { amount: 14000, notes: 'Diversos' },
    },
    clientMetrics: {
      activeClientsStart: 254,
      newActivations: 12,
      churnCancellations: 2,
      suspendedNonPayment: 11,
      activeClientsEnd: 264,
      churnRate: 0.79,
      arpu: 7727,
      collectionEfficiency: 91.48,
    },
    technicalMetrics: {
      serviceOrdersTotal: 35,
      serviceOrdersResolved: 34,
      slaAdherenceRate: 97.14,
      mttrHours: 2.7,
      fiberBreakagesRepaired: 3,
      customerSatisfactionScore: 92,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 15000,
      advancesRecoveredThisMonth: 15000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 810000,
      bfaBalance: 500000,
      cashInSafe: 105000,
      totalTreasuryBalance: 1415000,
      reconciliationDifference: 0,
      notes: 'Conferência bancária concluída com sucesso.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Termo de Fecho Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-02-3011',
    },
    internalNotes: 'Mês mais curto de 28 dias cumprido com eficiência e alta pontualidade de pagamentos.',
  },
  {
    id: 'mc-2026-01',
    code: 'FM-2026-01',
    year: 2026,
    month: 1,
    monthName: 'Janeiro 2026',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    closedAt: '2026-01-31T20:00:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-02-01T10:00:00Z',
    validationNotes: 'Abertura e fecho do exercício fiscal de 2026 em conformidade com o plano contabilístico.',
    financials: {
      invoicedTotal: 2160000,
      revenueCollected: 1980000,
      collectionRate: 91.66,
      operatingExpenses: 630000,
      payrollGross: 1150000,
      payrollLoanDeductions: 10000,
      payrollNetPaid: 1140000,
      totalCosts: 1770000,
      netResult: 210000,
      profitMargin: 10.61,
      previousMonthRevenue: 1920000,
      revenueGrowthRate: 3.12,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 950000, count: 95, description: 'Planos Fibra' },
      communityTv: { amount: 580000, count: 145, description: 'TV Comunitária' },
      comboTvInternet: { amount: 220000, count: 22, description: 'Combos' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 48000, count: 24, description: 'Reativações' },
      equipmentSales: { amount: 62000, count: 4, description: 'Equipamentos' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Multas' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 920000, count: 148 },
      bankTransferBai: { amount: 470000, count: 48 },
      bankTransferBfa: { amount: 310000, count: 31 },
      tpaMulticaixa: { amount: 145000, count: 18 },
      cashOffice: { amount: 105000, count: 21 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 105000, notes: 'Combustível' },
      networkMaterials: { amount: 100000, notes: 'Materiais' },
      rentAndUtilities: { amount: 76000, notes: 'Rendas' },
      commsAndSoftware: { amount: 15000, notes: 'Comunicações' },
      officeAndMisc: { amount: 14000, notes: 'Diversos' },
    },
    clientMetrics: {
      activeClientsStart: 244,
      newActivations: 12,
      churnCancellations: 2,
      suspendedNonPayment: 10,
      activeClientsEnd: 254,
      churnRate: 0.82,
      arpu: 7795,
      collectionEfficiency: 91.66,
    },
    technicalMetrics: {
      serviceOrdersTotal: 34,
      serviceOrdersResolved: 33,
      slaAdherenceRate: 97.05,
      mttrHours: 2.8,
      fiberBreakagesRepaired: 3,
      customerSatisfactionScore: 92,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 10000,
      advancesRecoveredThisMonth: 10000,
      outstandingStaffDebtEndOfMonth: 35000,
      employeesInDebtCount: 1,
    },
    bankReconciliation: {
      baiBalance: 780000,
      bfaBalance: 480000,
      cashInSafe: 105000,
      totalTreasuryBalance: 1365000,
      reconciliationDifference: 0,
      notes: 'Fecho inicial de 2026 conciliado.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Termo de Fecho Homologado.',
      certificateNumber: 'CERT-OSDEL-2026-01-2854',
    },
    internalNotes: 'Início do plano de modernização para expansão de CTOs com splitters 1:16.',
  },
  {
    id: 'mc-2025-12',
    code: 'FM-2025-12',
    year: 2025,
    month: 12,
    monthName: 'Dezembro 2025',
    periodStart: '2025-12-01',
    periodEnd: '2025-12-31',
    closedAt: '2025-12-31T21:30:00Z',
    closedBy: 'Albert (deezy) - Administrador Geral',
    status: 'homologado',
    validatedBy: 'Albert (deezy) - Direcção Geral',
    validatedAt: '2026-01-05T11:00:00Z',
    validationNotes: 'Fecho anual e encerramento oficial do exercício contabilístico de 2025.',
    financials: {
      invoicedTotal: 2100000,
      revenueCollected: 1920000,
      collectionRate: 91.42,
      operatingExpenses: 650000,
      payrollGross: 1150000,
      payrollLoanDeductions: 0,
      payrollNetPaid: 1150000,
      totalCosts: 1800000,
      netResult: 120000,
      profitMargin: 6.25,
      previousMonthRevenue: 1850000,
      revenueGrowthRate: 3.78,
    },
    revenueBreakdown: {
      fiberInternet: { amount: 910000, count: 91, description: 'Planos Fibra' },
      communityTv: { amount: 570000, count: 142, description: 'TV Comunitária' },
      comboTvInternet: { amount: 210000, count: 21, description: 'Combos' },
      installations: { amount: 105000, count: 7, description: 'Instalações' },
      reactivations: { amount: 50000, count: 25, description: 'Reativações' },
      equipmentSales: { amount: 60000, count: 4, description: 'Equipamentos' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Multas' },
    },
    paymentMethodsBreakdown: {
      multicaixaExpress: { amount: 890000, count: 142 },
      bankTransferBai: { amount: 460000, count: 47 },
      bankTransferBfa: { amount: 300000, count: 30 },
      tpaMulticaixa: { amount: 140000, count: 17 },
      cashOffice: { amount: 100000, count: 20 },
      bankDeposit: { amount: 30000, count: 3 },
    },
    expensesBreakdown: {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 110000, notes: 'Combustível de fim de ano' },
      networkMaterials: { amount: 105000, notes: 'Materiais' },
      rentAndUtilities: { amount: 75000, notes: 'Rendas' },
      commsAndSoftware: { amount: 15000, notes: 'Software' },
      officeAndMisc: { amount: 25000, notes: 'Gratificações de Natal e fim de ano' },
    },
    clientMetrics: {
      activeClientsStart: 236,
      newActivations: 10,
      churnCancellations: 2,
      suspendedNonPayment: 8,
      activeClientsEnd: 244,
      churnRate: 0.85,
      arpu: 7868,
      collectionEfficiency: 91.42,
    },
    technicalMetrics: {
      serviceOrdersTotal: 32,
      serviceOrdersResolved: 32,
      slaAdherenceRate: 100,
      mttrHours: 2.5,
      fiberBreakagesRepaired: 2,
      customerSatisfactionScore: 94,
    },
    debtMetrics: {
      advancesIssuedThisMonth: 0,
      advancesRecoveredThisMonth: 0,
      outstandingStaffDebtEndOfMonth: 0,
      employeesInDebtCount: 0,
    },
    bankReconciliation: {
      baiBalance: 750000,
      bfaBalance: 460000,
      cashInSafe: 100000,
      totalTreasuryBalance: 1310000,
      reconciliationDifference: 0,
      notes: 'Fecho do exercício 2025 arquivado.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: 'Albert (deezy) - Direcção Geral',
      accountingCertification: 'Certificação do Relatório e Contas de 2025.',
      certificateNumber: 'CERT-OSDEL-2025-12-2599',
    },
    internalNotes: 'Exercício fiscal de 2025 totalmente liquidado e homologado.',
  },
];

export function getMonthlyClosures(): MonthlyClosure[] {
  if (typeof window === 'undefined') return SEED_MONTHLY_CLOSURES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MONTHLY_CLOSURES));
      return SEED_MONTHLY_CLOSURES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MONTHLY_CLOSURES));
      return SEED_MONTHLY_CLOSURES;
    }
    return parsed;
  } catch {
    return SEED_MONTHLY_CLOSURES;
  }
}

export function saveMonthlyClosures(closures: MonthlyClosure[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(closures));
    window.dispatchEvent(new CustomEvent('osdel-monthly-closures-updated', { detail: { closures } }));
  } catch (err) {
    console.error('Erro ao guardar fechos mensais:', err);
  }
}

export function getMonthlyClosureById(id: string): MonthlyClosure | undefined {
  const closures = getMonthlyClosures();
  return closures.find((c) => c.id === id || c.code === id);
}

export function validateMonthlyClosure(
  closureId: string,
  adminName: string,
  notes?: string,
): MonthlyClosure | null {
  const current = getMonthlyClosures();
  let updatedClosure: MonthlyClosure | null = null;

  const updated = current.map((c) => {
    if (c.id === closureId || c.code === closureId) {
      updatedClosure = {
        ...c,
        status: 'homologado',
        validatedBy: adminName,
        validatedAt: new Date().toISOString(),
        validationNotes: notes || c.validationNotes || 'Homologado oficialmente pela gerência.',
      };
      return updatedClosure;
    }
    return c;
  });

  if (updatedClosure) {
    saveMonthlyClosures(updated);
    pushNotification({
      title: `Fecho Mensal Homologado: ${(updatedClosure as MonthlyClosure).code}`,
      message: `O termo de fecho mensal de ${(updatedClosure as MonthlyClosure).monthName} foi homologado por ${adminName}.`,
      type: 'financeiro',
      priority: 'alta',
      targetRole: 'admin',
      link: '/contabilidade',
    });
  }

  return updatedClosure;
}

export function generateMonthlyClosure(data: {
  year: number;
  month: number;
  adminName: string;
  notes?: string;
}): MonthlyClosure {
  const current = getMonthlyClosures();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mName = `${monthNames[data.month - 1]} ${data.year}`;
  const code = `FM-${data.year}-${String(data.month).padStart(2, '0')}`;
  const id = `mc-${data.year}-${String(data.month).padStart(2, '0')}`;

  // Se já existir, actualiza; senão, cria novo
  const existing = current.find((c) => c.id === id || c.code === code);

  const newClosure: MonthlyClosure = {
    id,
    code,
    year: data.year,
    month: data.month,
    monthName: mName,
    periodStart: `${data.year}-${String(data.month).padStart(2, '0')}-01`,
    periodEnd: `${data.year}-${String(data.month).padStart(2, '0')}-${new Date(data.year, data.month, 0).getDate()}`,
    closedAt: new Date().toISOString(),
    closedBy: data.adminName,
    status: 'em_consolidacao',
    validationNotes: data.notes || 'Fecho mensal consolidado pelo sistema.',
    financials: existing?.financials || {
      invoicedTotal: 2980000,
      revenueCollected: 2710000,
      collectionRate: 90.94,
      operatingExpenses: 790000,
      payrollGross: 1250000,
      payrollLoanDeductions: 85000,
      payrollNetPaid: 1165000,
      totalCosts: 1955000,
      netResult: 755000,
      profitMargin: 27.86,
      previousMonthRevenue: 2684000,
      revenueGrowthRate: 0.97,
    },
    revenueBreakdown: existing?.revenueBreakdown || {
      fiberInternet: { amount: 1440000, count: 144, description: 'Planos Residencial Fibra e Comercial' },
      communityTv: { amount: 690000, count: 172, description: 'TV Comunitária Coaxial' },
      comboTvInternet: { amount: 350000, count: 35, description: 'Planos Combinados' },
      installations: { amount: 120000, count: 8, description: 'Novas Ativações' },
      reactivations: { amount: 45000, count: 22, description: 'Reativações' },
      equipmentSales: { amount: 50000, count: 4, description: 'Equipamento' },
      penaltiesAndFees: { amount: 15000, count: 15, description: 'Juros de Mora' },
    },
    paymentMethodsBreakdown: existing?.paymentMethodsBreakdown || {
      multicaixaExpress: { amount: 1380000, count: 220 },
      bankTransferBai: { amount: 630000, count: 70 },
      bankTransferBfa: { amount: 380000, count: 42 },
      tpaMulticaixa: { amount: 195000, count: 28 },
      cashOffice: { amount: 100000, count: 20 },
      bankDeposit: { amount: 25000, count: 3 },
    },
    expensesBreakdown: existing?.expensesBreakdown || {
      upstreamBandwidth: { amount: 320000, notes: 'Angola Cables' },
      fleetAndFuel: { amount: 150000, notes: 'Combustível e manutenção' },
      networkMaterials: { amount: 160000, notes: 'Bobinas de fibra e conectores' },
      rentAndUtilities: { amount: 95000, notes: 'Custos prediais' },
      commsAndSoftware: { amount: 40000, notes: 'Comunicações e sistemas' },
      officeAndMisc: { amount: 25000, notes: 'Consumíveis' },
    },
    clientMetrics: existing?.clientMetrics || {
      activeClientsStart: 346,
      newActivations: 15,
      churnCancellations: 3,
      suspendedNonPayment: 10,
      activeClientsEnd: 358,
      churnRate: 0.84,
      arpu: 7570,
      collectionEfficiency: 90.94,
    },
    technicalMetrics: existing?.technicalMetrics || {
      serviceOrdersTotal: 45,
      serviceOrdersResolved: 44,
      slaAdherenceRate: 97.77,
      mttrHours: 2.6,
      fiberBreakagesRepaired: 5,
      customerSatisfactionScore: 95,
    },
    debtMetrics: existing?.debtMetrics || {
      advancesIssuedThisMonth: 85000,
      advancesRecoveredThisMonth: 85000,
      outstandingStaffDebtEndOfMonth: 50000,
      employeesInDebtCount: 2,
    },
    bankReconciliation: existing?.bankReconciliation || {
      baiBalance: 1250000,
      bfaBalance: 790000,
      cashInSafe: 100000,
      totalTreasuryBalance: 2140000,
      reconciliationDifference: 0,
      notes: 'Conferido com base nas entradas bancárias.',
    },
    auditCertificate: {
      companyName: 'OSDEL TECNOLOGIA, LDA.',
      nif: '5417289102',
      headquarters: 'Luanda, Angola - Sector de Telecomunicações',
      auditedBy: 'Dr. Manuel Domingos (Contabilista Certificado OCPC nº 4128)',
      directorApproval: `${data.adminName} - Direcção Geral`,
      accountingCertification: 'Certificação Contabilística Oficial.',
      certificateNumber: `CERT-OSDEL-${data.year}-${String(data.month).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    internalNotes: data.notes || 'Consolidação gerada e arquivada.',
  };

  const filtered = current.filter((c) => c.id !== id && c.code !== code);
  const updated = [newClosure, ...filtered];
  saveMonthlyClosures(updated);

  pushNotification({
    title: `Novo Fecho Mensal Gerado: ${code}`,
    message: `Consolidação mensal de ${mName} registada por ${data.adminName}.`,
    type: 'financeiro',
    priority: 'alta',
    targetRole: 'admin',
    link: '/contabilidade',
  });

  return newClosure;
}

export function exportMonthlyClosuresCsv(): string {
  const closures = getMonthlyClosures();
  const headers = [
    'Código',
    'Mês/Ano',
    'Estado',
    'Facturado (Kz)',
    'Cobrado/Receita (Kz)',
    'Taxa Cobrança (%)',
    'Despesas Operacionais (Kz)',
    'Folha Líquida (Kz)',
    'Custos Totais (Kz)',
    'Resultado Líquido (Kz)',
    'Margem Líquida (%)',
    'Clientes Activos',
    'Novas Ativações',
    'Cancelamentos',
    'Homologado Por',
    'Data Homologação',
  ];

  const rows = closures.map((c) => [
    c.code,
    c.monthName,
    c.status.toUpperCase(),
    c.financials.invoicedTotal,
    c.financials.revenueCollected,
    `${c.financials.collectionRate.toFixed(2)}%`,
    c.financials.operatingExpenses,
    c.financials.payrollNetPaid,
    c.financials.totalCosts,
    c.financials.netResult,
    `${c.financials.profitMargin.toFixed(2)}%`,
    c.clientMetrics.activeClientsEnd,
    c.clientMetrics.newActivations,
    c.clientMetrics.churnCancellations,
    `"${c.validatedBy || c.closedBy}"`,
    c.validatedAt ? new Date(c.validatedAt).toLocaleDateString('pt-AO') : '—',
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}
