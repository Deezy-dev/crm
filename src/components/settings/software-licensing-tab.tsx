import { Link } from 'wouter';
import { ShieldCheck, KeyRound, Building2, CheckCircle2, ExternalLink, Calendar, Server } from 'lucide-react';
import { useTenants } from '@/hooks/use-tenants';

export function SoftwareLicensingTab() {
  const { activeTenant } = useTenants();

  return (
    <div className="space-y-6">
      <div className="surface rounded-2xl p-6 border border-[hsl(var(--border))]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-white font-serif text-xl font-bold">
              GX
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[hsl(var(--foreground))]">
                Gestão X Enterprise · Licença de Software
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Licença autorizada para operação comercial e técnica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={13} />
              Licença Activa & Válida
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] p-4">
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] block">
              Entidade Titular da Licença
            </span>
            <div className="mt-1 font-bold text-sm text-[hsl(var(--foreground))]">
              {activeTenant?.name || 'OSDEL TECNOLOGIA LDA'}
            </div>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 block">
              NIF: {activeTenant?.nif || '5600857127'}
            </span>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] p-4">
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] block">
              Chave de Activação
            </span>
            <div className="mt-1 font-mono font-bold text-xs text-[hsl(var(--foreground))]">
              GX-OSDEL-560085-2026-ENT
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Autenticação Local Certificada
            </span>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] p-4">
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] block">
              Modalidades Habilitadas
            </span>
            <div className="mt-1 font-bold text-xs text-[hsl(var(--foreground))]">
              TV a Cabo Comunitária + Internet Fibra
            </div>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 block">
              Clientes Ilimitados · Modo Offline PWA
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-[hsl(var(--border))] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            <p>
              O software Gestão X funciona com armazenamento offline local no navegador e
              sincronização automática.
            </p>
          </div>

          <Link
            href="/gestao-x-licencas"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <ShieldCheck size={15} />
            <span>Abrir Gestão Comercial de Licenças</span>
            <ExternalLink size={12} className="opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}
