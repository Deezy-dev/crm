import { useState } from 'react';
import {
  Server,
  Monitor,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  Database,
  KeyRound,
  FileText,
  Play,
  Download,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export function PythonAnywhereApiPage() {
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:5000');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    ok: boolean;
    data?: any;
    error?: string;
  } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
    toast.success('Comando copiado!');
  };

  const testApiConnection = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setCheckResult({ ok: true, data });
        toast.success('API conectada e operacional!');
      } else {
        setCheckResult({
          ok: false,
          error: `O servidor respondeu com status ${res.status}: ${res.statusText}`,
        });
        toast.error('Erro ao conectar com a API.');
      }
    } catch (err: any) {
      setCheckResult({
        ok: false,
        error:
          'Não foi possível estabelecer conexão. Verifique se a API está em execução no PythonAnywhere ou se há bloqueio de CORS/rede.',
      });
      toast.error('Falha de conexão.');
    } finally {
      setIsChecking(false);
    }
  };

  const endpoints = [
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Autenticação de usuário com geração de JWT Access e Refresh Token' },
    { method: 'POST', path: '/api/v1/auth/register', desc: 'Registro de novos operadores ou administradores' },
    { method: 'POST', path: '/api/v1/auth/refresh', desc: 'Renovação do Access Token via Refresh Token' },
    { method: 'GET',  path: '/api/v1/auth/me', desc: 'Dados e permissões do usuário autenticado' },
    { method: 'GET',  path: '/api/v1/dashboard/summary', desc: 'Métricas consolidadas (Clientes, Inadimplência, Faturamento Kz)' },
    { method: 'GET',  path: '/api/v1/clients', desc: 'Listagem de clientes com busca, filtros de status e paginação' },
    { method: 'POST', path: '/api/v1/clients', desc: 'Cadastro de novo cliente (TV a Cabo / Internet Fibra / Combo)' },
    { method: 'PUT',  path: '/api/v1/clients/<id>', desc: 'Atualização cadastral e alteração de sinal de cliente' },
    { method: 'DELETE', path: '/api/v1/clients/<id>', desc: 'Exclusão de cliente do sistema' },
    { method: 'GET',  path: '/api/v1/invoices', desc: 'Listagem de faturas e mensalidades emitidas' },
    { method: 'POST', path: '/api/v1/invoices/<id>/pay', desc: 'Liquidação de fatura via Multicaixa ou transferência' },
    { method: 'GET',  path: '/api/v1/budgets', desc: 'Listagem de orçamentos de instalação de rede' },
    { method: 'POST', path: '/api/v1/budgets', desc: 'Criação de novos orçamentos de serviços' },
    { method: 'GET',  path: '/api/v1/users', desc: 'Gestão de usuários da equipa' },
  ];

  return (
    <div className="space-y-7">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            <span>Integrações</span>
            <span aria-hidden="true">/</span>
            <span className="text-[hsl(var(--foreground))] font-bold">PythonAnywhere & Desktop</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Arquitetura API REST & Cliente Desktop Windows
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 max-w-2xl">
            Módulo backend em <b>Flask + SQLite + JWT</b> para deploy no <b>PythonAnywhere (Plano Gratuito)</b>{' '}
            e aplicativo executável nativo Windows em <b>CustomTkinter + PyInstaller</b>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            Compatível com PythonAnywhere Free
          </span>
        </div>
      </div>

      {/* Cartões Informativos das Duas Partes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Backend API */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Server size={22} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[hsl(var(--foreground))]">
                Backend API REST (Flask + SQLite)
              </h2>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Pasta no projeto: <code className="font-mono text-blue-600">/backend_api</code>
              </span>
            </div>
          </div>

          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            API estruturada sem Docker, Redis ou Celery para operar de forma 100% nativa no plano gratuito do
            PythonAnywhere com banco de dados SQLite persistente e autenticação segura JWT.
          </p>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3 text-xs space-y-1.5 font-mono">
            <div>✓ <b>Framework:</b> Flask 3.0+ & Flask-Cors</div>
            <div>✓ <b>Banco de Dados:</b> SQLite (gestaox.db)</div>
            <div>✓ <b>Segurança:</b> Flask-JWT-Extended (Access + Refresh)</div>
            <div>✓ <b>WSGI:</b> wsgi_pythonanywhere.py pronto para uso</div>
          </div>

          {/* Testador de URL */}
          <div className="pt-2 space-y-2">
            <label className="block text-xs font-bold text-[hsl(var(--foreground))]">
              Testar Conexão com sua API do PythonAnywhere:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://seu_usuario.pythonanywhere.com"
                className="h-9 flex-1 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-xs font-mono outline-none focus:border-[hsl(var(--primary))]"
              />
              <button
                type="button"
                onClick={testApiConnection}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] hover:brightness-110 disabled:opacity-50 transition"
              >
                {isChecking ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>

            {checkResult && (
              <div
                className={`rounded-xl p-3 text-xs border ${
                  checkResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {checkResult.ok ? (
                  <div>
                    <b>✓ Conexão bem-sucedida!</b> Resposta:{' '}
                    <pre className="mt-1 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(checkResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <b>✗ Falha na conexão:</b> {checkResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cliente Desktop Windows */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Monitor size={22} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[hsl(var(--foreground))]">
                Cliente Desktop Windows (.exe)
              </h2>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                Pasta no projeto: <code className="font-mono text-purple-600">/desktop_client</code>
              </span>
            </div>
          </div>

          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            Aplicativo executável Windows para operadores e administradores com interface gráfica moderna em{' '}
            <b>CustomTkinter</b>, cache local SQLite para resiliência offline e compilação com <b>PyInstaller</b>.
          </p>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3 text-xs space-y-1.5 font-mono">
            <div>✓ <b>Interface:</b> CustomTkinter (Tema Dark Moderno)</div>
            <div>✓ <b>Comunicação:</b> Requests HTTP com JWT Bearer</div>
            <div>✓ <b>Resiliência:</b> Cache Local SQLite (local_cache.db)</div>
            <div>✓ <b>Build:</b> pyinstaller --onefile --windowed main.py</div>
          </div>

          {/* Comando para Compilar o .exe */}
          <div className="pt-2 space-y-1.5">
            <label className="block text-xs font-bold text-[hsl(var(--foreground))]">
              Comando para Gerar o Executável Windows (.exe):
            </label>
            <div className="relative rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-xs flex items-center justify-between">
              <span className="truncate pr-4">
                pyinstaller --onefile --windowed --name "GestaoX_Desktop" --collect-all customtkinter main.py
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'pyinstaller --onefile --windowed --name "GestaoX_Desktop" --collect-all customtkinter main.py',
                    'pyinstaller'
                  )
                }
                className="shrink-0 text-slate-400 hover:text-white"
              >
                {copiedCmd === 'pyinstaller' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] block">
              Também disponível como script executável com 1 clique: <code className="font-mono">build_exe.bat</code>
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Endpoints da API */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="font-serif text-base font-bold text-[hsl(var(--foreground))]">
            Catálogo de Endpoints da API REST (JSON)
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Endpoints prontos para consumo pelo aplicativo desktop e integrações externas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[hsl(var(--muted-foreground))] font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Método</th>
                <th className="py-2.5 px-4">Endpoint</th>
                <th className="py-2.5 px-4">Descrição da Operação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-[hsl(var(--secondary)/.25)] transition">
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : ep.method === 'PUT'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-[hsl(var(--foreground))]">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-4 text-[hsl(var(--muted-foreground))]">
                    {ep.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guias e Documentação Rápida */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xs space-y-3">
        <h3 className="font-serif text-base font-bold text-[hsl(var(--foreground))]">
          Arquivos e Documentos Adicionados ao Projeto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-1">
            <span className="font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <FileText size={14} className="text-blue-600" />
              backend_api/README_DEPLOY_PYTHONANYWHERE.md
            </span>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Passo a passo completo com telas, configuração do virtualenv e WSGI para o plano gratuito.
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-1">
            <span className="font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-600" />
              backend_api/API_ENDPOINTS_DOCS.md
            </span>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Documentação detalhada com exemplos completos de requisições e respostas JSON para cada endpoint.
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-1">
            <span className="font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <FileText size={14} className="text-purple-600" />
              desktop_client/README_DESKTOP_BUILD.md
            </span>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Instruções de como compilar e distribuir o executável Windows (.exe) standalone.
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-1">
            <span className="font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <Terminal size={14} className="text-amber-600" />
              desktop_client/build_exe.bat
            </span>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Script executável em lote para compilação com 1 clique no Windows usando PyInstaller.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
