import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Printer, ArrowLeft, X, Check, FileText } from 'lucide-react';
import { useListExpenses, useListCashClosures, useListServiceOrders, useListClients, useGetSettings } from '@/lib/local-api';
import { getMonthlyClosures, type MonthlyClosure } from '@/lib/monthly-closures';
import { kz, date, dateTime } from '@/components/shared-ui';

export function PrintPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const tipo = searchParams.get('tipo') || 'guia-saida';
  const idParam = searchParams.get('id');

  const { data: settings } = useGetSettings();
  const expensesQuery = useListExpenses();
  const closuresQuery = useListCashClosures();
  const serviceOrdersQuery = useListServiceOrders();
  const clientsQuery = useListClients();

  const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

  const expenses = (expensesQuery.data as any[]) || [];
  const cashClosures = (closuresQuery.data as any[]) || [];
  const serviceOrders = (serviceOrdersQuery.data?.items as any[]) || [];
  const clients = (clientsQuery.data?.items as any[]) || [];
  const monthlyClosures = getMonthlyClosures();

  // Find target item
  const selectedExpense = idParam
    ? expenses.find((e) => String(e.id) === String(idParam))
    : expenses[0];

  const selectedCashClosure = idParam
    ? cashClosures.find((c) => String(c.id) === String(idParam))
    : cashClosures[0];

  const selectedMonthlyClosure = idParam
    ? monthlyClosures.find((m) => String(m.id) === String(idParam) || m.code === idParam)
    : monthlyClosures[0];

  const selectedServiceOrder = idParam
    ? serviceOrders.find((s) => String(s.id) === String(idParam))
    : serviceOrders[0];

  // Auto trigger print when ready
  useEffect(() => {
    if (hasAutoPrinted) return;
    const timer = setTimeout(() => {
      try {
        window.focus();
        window.print();
        setHasAutoPrinted(true);
      } catch (err) {
        console.warn('Erro na chamada automática de impressão:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hasAutoPrinted, selectedExpense, selectedCashClosure, selectedMonthlyClosure]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* Top Floating Control Bar - Hidden on print */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-300 bg-white/95 px-6 py-3 shadow-md backdrop-blur-md print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation('/');
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Documento Pronto para Impressão / PDF
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Printer size={15} />
            <span>Imprimir Agora (Ctrl + P)</span>
          </button>
          <button
            onClick={() => window.close()}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            title="Fechar aba"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* Main Printable Document Canvas */}
      <main className="mx-auto max-w-[800px] p-4 sm:p-8 print:max-w-none print:p-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl print:rounded-none print:border-none print:p-0 print:shadow-none">
          {/* TIPO: GUIA DE SAÍDA / VOUCHER */}
          {tipo === 'guia-saida' && selectedExpense && (
            <ExpenseVoucherDocument
              expense={selectedExpense}
              settings={settings}
            />
          )}

          {/* TIPO: FECHO MENSAL CONSOLIDADO */}
          {tipo === 'fecho-mensal' && selectedMonthlyClosure && (
            <MonthlyClosureDocument
              closure={selectedMonthlyClosure}
              settings={settings}
            />
          )}

          {/* TIPO: FECHO DIÁRIO */}
          {tipo === 'fecho-diario' && selectedCashClosure && (
            <DailyClosureDocument
              closure={selectedCashClosure}
              settings={settings}
            />
          )}

          {/* TIPO: ORDEM DE SERVIÇO */}
          {tipo === 'ordem-servico' && selectedServiceOrder && (
            <ServiceOrderDocument
              order={selectedServiceOrder}
              client={clients.find((c) => c.id === selectedServiceOrder.clientId)}
              settings={settings}
            />
          )}

          {/* FALLBACK: ITEM NÃO ENCONTRADO */}
          {!selectedExpense && !selectedMonthlyClosure && !selectedCashClosure && !selectedServiceOrder && (
            <div className="p-12 text-center">
              <FileText size={36} className="mx-auto text-slate-400 mb-3" />
              <h2 className="text-lg font-bold text-slate-800">Documento não encontrado</h2>
              <p className="text-xs text-slate-500 mt-1">
                O identificador solicitado não existe ou ainda não foi sincronizado.
              </p>
              <button
                onClick={() => setLocation('/')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
              >
                Voltar ao Painel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// 1. COMPONENTE: GUIA OFICIAL DE SAÍDA DE CAIXA (VOUCHER)
// ---------------------------------------------------------------------------------------
function ExpenseVoucherDocument({ expense, settings }: { expense: any; settings?: any }) {
  const company = settings?.companyName || 'OSDEL TECNOLOGIA LDA';
  const phone = settings?.companyPhone || '+244 923 000 000';
  const address = settings?.companyAddress || 'Luanda, Angola';

  return (
    <div id="printable-voucher" className="space-y-6 text-xs text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-black tracking-tight text-slate-900">{company}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">
            NIF: 5417089214 · {address} · Tel: {phone}
          </p>
          <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            TV por Cabo Comunitária & Internet Banda Larga Fibra Óptica
          </span>
        </div>
        <div className="text-right">
          <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-black text-slate-900 border border-slate-300">
            GUIA-EXP/{String(expense.id).padStart(5, '0')}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            Data: <strong>{date(expense.date)}</strong>
          </div>
        </div>
      </div>

      <div className="text-center py-1">
        <h2 className="text-base font-black uppercase tracking-widest text-slate-900">
          GUIA DE SAÍDA DE CAIXA / COMPROVATIVO DE LIQUIDAÇÃO
        </h2>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-4 bg-slate-50/50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Conta de Saída:</span>
          <b className="text-xs text-slate-900">{expense.account || 'Caixa Geral'}</b>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Forma de Pagamento:</span>
          <b className="text-xs text-slate-900">{expense.paymentMethod || 'Numerário'}</b>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Beneficiário / Fornecedor:</span>
          <b className="text-xs text-slate-900">
            {expense.supplier || 'Particular / Equipa Interna'}
            {expense.supplierNif && (
              <span className="ml-1.5 font-mono text-[11px] font-normal text-slate-600">
                (NIF: {expense.supplierNif})
              </span>
            )}
          </b>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Motivo / Descrição da Despesa:</span>
          <div className="mt-1 rounded-md bg-white p-3 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
            {expense.reason}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Categoria Contabilística:</span>
          <span className="text-xs font-semibold text-slate-800 uppercase">{expense.category}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Documento Suporte:</span>
          <span className="font-mono text-xs font-semibold text-slate-800">{expense.documentNumber || '—'}</span>
        </div>
      </div>

      {/* Amount Box */}
      <div className="rounded-xl border-2 border-slate-900 bg-slate-900 p-5 text-white text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
          VALOR TOTAL LIQUIDADO
        </span>
        <div className="mt-1 text-3xl font-black tracking-tight">{kz(expense.amount)}</div>
        {Number(expense.taxWithheld || 0) > 0 && (
          <p className="mt-1 text-xs text-amber-300">
            (Inclui retenção na fonte 6.5%: {kz(expense.taxWithheld)})
          </p>
        )}
      </div>

      {/* Audit & Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-10 text-center">
        <div className="space-y-1">
          <div className="border-t border-slate-400 pt-2" />
          <b className="block text-xs text-slate-900">O Operador / Tesoureiro</b>
          <span className="text-[11px] text-slate-500">@{expense.operator || 'deezy'}</span>
        </div>
        <div className="space-y-1">
          <div className="border-t border-slate-400 pt-2" />
          <b className="block text-xs text-slate-900">O Beneficiário / Fornecedor</b>
          <span className="text-[11px] text-slate-500">Assinatura / Carimbo</span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex justify-between">
        <span>Documento processado por computador · Sistema de Gestão OSDEL</span>
        <span>Impresso em: {dateTime(new Date().toISOString())}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// 2. COMPONENTE: TERMO OFICIAL DE ENCERRAMENTO MENSAL
// ---------------------------------------------------------------------------------------
function MonthlyClosureDocument({ closure, settings }: { closure: MonthlyClosure; settings?: any }) {
  const company = settings?.companyName || 'OSDEL TECNOLOGIA LDA';

  return (
    <div className="space-y-6 text-xs text-slate-900 font-sans">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">{company}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">
            NIF: 5417089214 · Luanda, Angola · Departamento Financeiro & Contabilístico
          </p>
        </div>
        <div className="text-right">
          <div className="rounded bg-slate-100 px-3 py-1 font-mono text-xs font-black border border-slate-300">
            {closure.auditCertificate?.certificateNumber || closure.code}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">Exercício: <strong>{closure.monthName}</strong></div>
        </div>
      </div>

      <div className="text-center py-1">
        <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
          TERMO OFICIAL DE ENCERRAMENTO CONTABILÍSTICO MENSAL
        </h2>
        <p className="text-[11px] text-slate-500">
          Fecho consolidado e certificado nos termos das normas financeiras de Angola
        </p>
      </div>

      {/* Demonstrativo Resumido */}
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px] uppercase">
              <th className="p-2.5">Rubrica Orçamental / Contabilística</th>
              <th className="p-2.5 text-right">Montante (AOA)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr className="bg-emerald-50/50">
              <td className="p-2.5 font-bold text-emerald-950">(+) RECEITA BRUTA OPERACIONAL</td>
              <td className="p-2.5 text-right font-mono font-bold text-emerald-800">
                +{kz(closure.financials.revenueCollected || closure.financials.invoicedTotal)}
              </td>
            </tr>
            <tr className="bg-rose-50/50">
              <td className="p-2.5 font-bold text-rose-950">(-) CUSTOS OPERACIONAIS (OPEX)</td>
              <td className="p-2.5 text-right font-mono font-bold text-rose-800">
                -{kz(closure.financials.operatingExpenses)}
              </td>
            </tr>
            <tr className="bg-amber-50/50">
              <td className="p-2.5 font-bold text-amber-950">(-) FOLHA SALARIAL LÍQUIDA</td>
              <td className="p-2.5 text-right font-mono font-bold text-amber-900">
                -{kz(closure.financials.payrollNetPaid)}
              </td>
            </tr>
            <tr className="bg-slate-900 text-white font-bold">
              <td className="p-3 text-sm font-black">(=) RESULTADO LÍQUIDO DO MÊS</td>
              <td className="p-3 text-right font-mono text-sm font-black text-emerald-400">
                {kz(closure.financials.netResult)} ({closure.financials.profitMargin.toFixed(1)}%)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-3 gap-3 border border-slate-300 rounded-lg p-3 bg-slate-50 text-[11px]">
        <div>
          <span className="text-slate-500 block">Assinantes no Fecho:</span>
          <b className="font-mono text-xs">{closure.clientMetrics.activeClientsEnd} Activos</b>
        </div>
        <div>
          <span className="text-slate-500 block">Eficiência de Cobrança:</span>
          <b className="font-mono text-xs">{closure.financials.collectionRate.toFixed(1)}%</b>
        </div>
        <div>
          <span className="text-slate-500 block">Ordens Resolvidas:</span>
          <b className="font-mono text-xs">{closure.technicalMetrics.serviceOrdersResolved} Intervenções</b>
        </div>
      </div>

      {/* Notes */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <b className="block text-slate-800 text-[11px] uppercase font-bold">Parecer da Auditoria:</b>
        <p className="text-slate-600 mt-1">
          {closure.validationNotes || 'Fecho mensal conferido e homologado pela Direcção Geral e Contabilidade.'}
        </p>
      </div>

      {/* 3 Signatures */}
      <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <div className="h-10 border-b border-dashed border-slate-400" />
          <b className="mt-1 block text-slate-900">Albert (deezy)</b>
          <span className="text-[10px] text-slate-500">Director Geral</span>
        </div>
        <div>
          <div className="h-10 border-b border-dashed border-slate-400" />
          <b className="mt-1 block text-slate-900">Dr. Manuel Domingos</b>
          <span className="text-[10px] text-slate-500">Contabilista Certificado</span>
        </div>
        <div>
          <div className="h-10 border-b border-dashed border-slate-400" />
          <b className="mt-1 block text-slate-900">Maria Teresa dos Santos</b>
          <span className="text-[10px] text-slate-500">Responsável de Caixa</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// 3. COMPONENTE: FECHO DE CAIXA E TURNO DIÁRIO
// ---------------------------------------------------------------------------------------
function DailyClosureDocument({ closure, settings }: { closure: any; settings?: any }) {
  const company = settings?.companyName || 'OSDEL TECNOLOGIA LDA';

  return (
    <div className="space-y-6 text-xs text-slate-900 font-sans">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">{company}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">Folha Diária de Conferência e Fecho de Caixa</p>
        </div>
        <div className="text-right">
          <div className="rounded bg-slate-100 px-3 py-1 font-mono text-xs font-black border border-slate-300">
            {closure.closureNumber || `FC-${String(closure.id).padStart(5, '0')}`}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">Data: <strong>{date(closure.closureDate || closure.createdAt)}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-slate-50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Operador Responsável:</span>
          <b className="text-xs">@{closure.operator || 'deezy'}</b>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Turno:</span>
          <b className="text-xs uppercase">{closure.shift || 'Integral'}</b>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Fundo de Abertura:</span>
          <span className="font-mono font-bold">{kz(closure.openingBalance || 0)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Saldo em Dinheiro Contado:</span>
          <span className="font-mono font-bold">{kz(closure.countedBalance || closure.closingBalance || 0)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span>(+) Entradas do Turno:</span>
          <span className="font-mono font-bold text-emerald-700">+{kz(closure.totalIncome || 0)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>(-) Saídas / Despesas do Turno:</span>
          <span className="font-mono font-bold text-rose-700">-{kz(closure.totalExpenses || 0)}</span>
        </div>
        <div className="flex justify-between text-xs pt-2 border-t font-bold">
          <span>Saldo Teórico Calculado:</span>
          <span className="font-mono">{kz(closure.closingBalance || 0)}</span>
        </div>
        {Number(closure.difference || 0) !== 0 && (
          <div className="flex justify-between text-xs pt-1 font-bold text-rose-600">
            <span>Diferença / Quebra de Caixa:</span>
            <span className="font-mono">{kz(closure.difference)}</span>
          </div>
        )}
      </div>

      {closure.notes && (
        <div className="p-3 bg-slate-50 border rounded-lg text-xs">
          <b className="block text-[10px] uppercase font-bold text-slate-500">Observações:</b>
          <p className="text-slate-700 mt-1">{closure.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
        <div>
          <div className="border-t border-slate-400 pt-2" />
          <b className="block">Assinatura do Operador</b>
          <span className="text-[10px] text-slate-500">@{closure.operator}</span>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-2" />
          <b className="block">Homologação da Direcção</b>
          <span className="text-[10px] text-slate-500">
            {closure.validatedBy ? `Validado por @${closure.validatedBy}` : 'Pendente de validação'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------
// 4. COMPONENTE: ORDEM DE SERVIÇO TÉCNICA
// ---------------------------------------------------------------------------------------
function ServiceOrderDocument({ order, client, settings }: { order: any; client?: any; settings?: any }) {
  const company = settings?.companyName || 'OSDEL TECNOLOGIA LDA';

  return (
    <div className="space-y-6 text-xs text-slate-900 font-sans">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">{company}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">Guia de Intervenção Técnica no Cliente</p>
        </div>
        <div className="text-right">
          <div className="rounded bg-slate-100 px-3 py-1 font-mono text-xs font-black border border-slate-300">
            {order.orderNumber || `OS-${String(order.id).padStart(5, '0')}`}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">Data: <strong>{date(order.scheduledDate || order.createdAt)}</strong></div>
        </div>
      </div>

      <div className="border p-4 rounded-lg bg-slate-50 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Cliente:</span>
          <b className="text-slate-900">{client?.fullName || '—'}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Telefone:</span>
          <b className="text-slate-900">{client?.phone || '—'}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Morada / Bairro:</span>
          <span className="text-slate-900">{client?.address || '—'} ({client?.neighborhood || '—'})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tipo de Intervenção:</span>
          <b className="uppercase text-slate-900">{order.type}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Técnico / Piquete:</span>
          <span className="font-semibold text-slate-900">{order.technician || 'Piquete Central'}</span>
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-500 block">Descrição do Problema / Pedido:</span>
        <div className="mt-1 rounded-md bg-white p-3 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
          {order.description || 'Sem descrição registada.'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
        <div>
          <div className="border-t border-slate-400 pt-2" />
          <b className="block">O Técnico Responsável</b>
          <span className="text-[10px] text-slate-500">Assinatura</span>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-2" />
          <b className="block">O Cliente (Conformidade)</b>
          <span className="text-[10px] text-slate-500">Assinatura</span>
        </div>
      </div>
    </div>
  );
}
