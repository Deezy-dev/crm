import { useState } from 'react';
import {
  Smartphone,
  Users,
  Tv,
  CheckCircle2,
  FileCode,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  Scissors,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'wouter';
import { getStoredMissions } from '@/lib/team-missions';
import { getStoredPromises, getStoredTickets } from '@/lib/client-portal';

export function MobileHub() {
  const missions = getStoredMissions();
  const promises = getStoredPromises();
  const tickets = getStoredTickets();

  const totalTasks = missions.reduce((sum, m) => sum + m.tasks.length, 0);
  const completedTasks = missions.reduce(
    (sum, m) => sum + m.tasks.filter((t) => t.status !== 'pendente').length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Ecossistema Móvel Android & iOS</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-[2.5rem]">
            Centro de Aplicativos Móveis (APKs)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">
            Dois aplicativos móveis nativos e sincronizados: um para os clientes (TV e Internet) e outro para a equipa técnica de campo da OSDEL.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/apk-guia"
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110"
          >
            <FileCode size={15} /> Guia Completo de Build APK
          </Link>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="surface rounded-2xl border border-[hsl(var(--border))] p-5 shadow-sm bg-gradient-to-r from-blue-50/60 to-emerald-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Zap size={20} />
          </div>
          <div>
            <b className="text-sm font-extrabold text-slate-900 block">
              Sincronização em Tempo Real Activa
            </b>
            <span className="text-xs text-slate-600">
              {completedTasks} de {totalTasks} tarefas de campo concluídas · {promises.length} acordos submetidos · {tickets.length} avarias reportadas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Motor Local & Nuvem Conectado
          </span>
        </div>
      </div>

      {/* Two Mobile Apps Showcase Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* APP 1: CLIENTE */}
        <div className="surface rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-md">
                  <Tv size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    APK Cliente Final
                  </span>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    OSDEL Cliente
                  </h2>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                TV Cabo & Internet
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O aplicativo que fica no telemóvel dos clientes residenciais da OSDEL. Permite consultar contrato, ver aviso de pagamento com entidade/referência Multicaixa Express, pedir acordos de pagamento para evitar corte, e reportar avarias com fotos.
            </p>

            <div className="space-y-2 text-xs">
              <b className="text-[11px] font-bold text-slate-700 uppercase block">Recursos Principais:</b>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Aviso de Pagamento</b>: Referência MCX e data limite visível.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Acordo de Não-Corte</b>: Pedido de prazo adicional aprovado no operador.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Relatar Avaria</b>: TV sem sinal, cabo caído, luz LOS vermelha.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Diagnóstico de Linha</b>: Medição de potência óptica em dBm e ping.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ID: com.osdel.cliente</span>
            <Link
              href="/app-cliente"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-blue-700 shadow-sm transition"
            >
              <Smartphone size={14} /> Abrir App do Cliente <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* APP 2: EQUIPA & CAMPO */}
        <div className="surface rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white shadow-md">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    APK Piquete & Operações
                  </span>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    OSDEL Equipa & Campo
                  </h2>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Técnicos & Operadores
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O aplicativo dos técnicos de campo (Mestre Job, Júlio, Enock, etc.). Acesso restrito por função: técnicos vêem apenas a sua agenda de hoje, tarefas de corte por rua e a sua folha de salário individual; operadores gerem missões e aprovam acordos.
            </p>

            <div className="space-y-2 text-xs">
              <b className="text-[11px] font-bold text-slate-700 uppercase block">Recursos Principais:</b>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Agenda do Técnico</b>: Intervenções e rotinas diárias com checklist.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Piquete por Rua</b>: Marcação de cortes e religações em tempo real.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Meu Salário Privado</b>: Consulta de remuneração líquida e subsídios.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><b>Aprovação de Acordos</b>: Validação de promessas de pagamento.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ID: com.osdel.equipa</span>
            <Link
              href="/app-equipa"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold hover:bg-black shadow-sm transition"
            >
              <Smartphone size={14} /> Abrir App da Equipa <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* APK Conversion & Build Callout */}
      <div className="surface rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="text-purple-600" size={18} />
              <b className="text-base text-slate-900">Como converter estes aplicativos em arquivos APK (.apk)?</b>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Consulte as instruções detalhadas de empacotamento com <b>Capacitor</b> e configuração da variável de API (quando decidir o local de hospedagem final do sistema).
            </p>
          </div>

          <Link
            href="/apk-guia"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-sm"
          >
            Ver Guia de Compilação APK <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
