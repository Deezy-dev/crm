import { useState, useEffect, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  AlertCircle,
  Banknote,
  Bell,
  Check,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  FileText,
  MessageSquare,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Send,
  Wifi,
  Tv,
  Layers,
  X,
  Zap,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useServiceMode } from '@/lib/service-mode';
import { MigrateToFiberModal } from '@/components/migrate-to-fiber-modal';
import { ClientCredentialsModal } from '@/components/client-credentials-modal';
import {
  getListClientsQueryKey,
  getListMessagesQueryKey,
  getListPaymentsQueryKey,
  getGetDashboardQueryKey,
  useCreateClient,
  useCreateContract,
  useCreateMessage,
  useCreatePayment,
  useGetReports,
  useGetSettings,
  useListClients,
  useListMessages,
  useListPayments,
  useUpdateClient,
  type Client,
} from '@/lib/local-api';
import {
  ClientListPreview,
  ContractPreview,
  InvoicePreview,
  ReportPreview,
} from '@/pages/operations';

type AnyRecord = Record<string, any>;

const kz = (value: unknown) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace('AOA', 'Kz');

const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—';

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'OS';

const serviceLabel = (service?: string) =>
  service === 'combo' ? 'TV + Internet' : service === 'internet' ? 'Internet Fibra' : 'TV a Cabo';

function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'quiet' | 'outline' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110',
    quiet: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))]',
    outline:
      'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    danger: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:brightness-110',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-bold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-[hsl(var(--foreground))]">{label}</span>
      {children}
      {hint && <small className="block text-[11px] text-[hsl(var(--muted-foreground))]">{hint}</small>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.15)] ${
        props.className || ''
      }`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-sm outline-none focus:border-[hsl(var(--primary))] ${
        props.className || ''
      }`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] ${
        props.className || ''
      }`}
    />
  );
}

function StatusBadge({ value }: { value?: string }) {
  const label: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    late: 'Em atraso (Corte)',
    suspended: 'Suspenso (>3m)',
    paid: 'Pago',
    pending: 'Pendente',
  };
  const tone =
    value === 'active' || value === 'paid'
      ? 'bg-[#dceee5] text-[#237052]'
      : value === 'late' || value === 'pending'
        ? 'bg-[#f7e9c9] text-[#946c22]'
        : value === 'suspended' || value === 'inactive'
          ? 'bg-[#f8e1da] text-[#a24e3a]'
          : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label[value || ''] || value || '—'}
    </span>
  );
}

function Modal({
  title,
  eyebrow = 'Operação',
  children,
  onClose,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#142f35]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-auto rounded-t-2xl bg-[hsl(var(--card))] shadow-2xl sm:rounded-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/.96)] px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-1 font-serif text-2xl">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
          >
            <X size={19} />
          </button>
        </header>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-[2.6rem]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">{detail}</p>
      </div>
      {action}
    </div>
  );
}

/* =========================================================================
   1. CLIENTS PAGE: Tabs for TV / Fibra / Combo, search by houseCode & BI,
      and print client list modal.
   ========================================================================= */

const emptyClient = {
  fullName: '',
  phone: '',
  alternatePhone: '',
  email: '',
  address: '',
  neighborhood: '',
  documentNumber: '',
  houseCode: '',
  pdoNumber: '',
  onuNumber: '',
  serviceType: 'tv',
  planId: 'fibra-10',
  notes: '',
};

export function ClientsPage() {
  const { mode, meta, selectMode } = useServiceMode();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState(() => meta.filterValue);
  const [statusFilter, setStatusFilter] = useState(() => new URLSearchParams(window.location.search).get('status') || '');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Client>();
  const [printModal, setPrintModal] = useState(false);
  const [migratingClient, setMigratingClient] = useState<Client | null>(null);
  const [credentialsClient, setCredentialsClient] = useState<Client | null>(null);
  const [createdContractPreview, setCreatedContractPreview] = useState<{ client: AnyRecord; contract: AnyRecord } | null>(null);

  // Sync serviceFilter whenever user switches mode in top switcher
  useEffect(() => {
    setServiceFilter(meta.filterValue);
  }, [meta.filterValue]);

  const settingsQuery = useGetSettings();
  const q = useListClients({
    search,
    serviceType: mode && mode !== 'ambos' ? meta.filterValue : (serviceFilter || undefined),
    serviceMode: mode || undefined,
    status: statusFilter || undefined,
  });
  const items = q.data?.items || [];
  const settings = settingsQuery.data || {};

  return (
    <div>
      <PageHeader
        eyebrow={`Base operacional · Modo ${meta.shortName}`}
        title="Clientes"
        detail={`Gestão completa de assinantes ${
          mode === 'fibra'
            ? 'de Internet Fibra Óptica'
            : mode === 'tv'
            ? 'de TV a Cabo Comunitária'
            : 'de TV por Cabo & Internet Fibra'
        } com pesquisa por Código, Casa, BI ou Telefone.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPrintModal(true)}>
              <Printer size={15} /> Imprimir lista (PDF)
            </Button>
            <Button
              onClick={() => {
                setEdit(undefined);
                setModal(true);
              }}
            >
              <Plus size={16} /> Novo cliente
            </Button>
          </div>
        }
      />

      {/* Banner de Modalidade Activa */}
      {mode && mode !== 'ambos' && (
        <div
          data-testid="banner-active-service-mode"
          className={`mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 border transition ${
            mode === 'fibra'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200'
              : 'bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                mode === 'fibra'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-amber-600 text-white shadow-sm'
              }`}
            >
              {mode === 'fibra' ? <Wifi size={18} /> : <Tv size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  Modo Activo: {meta.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/60 dark:bg-black/40">
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                Exibindo exclusivamente clientes e serviços de {meta.shortName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold shrink-0 self-end sm:self-auto">
            <button
              onClick={() => selectMode('ambos')}
              className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800 border border-current/20 hover:bg-white dark:hover:bg-slate-700 transition"
            >
              Ver Ambos os Serviços
            </button>
            <Link
              href="/selecionar-servico"
              className="px-3 py-1.5 rounded-lg bg-current/10 hover:bg-current/15 transition underline"
            >
              Trocar Modalidade
            </Link>
          </div>
        </div>
      )}

      {/* Tabs por serviço / estado */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-[hsl(var(--border))] pb-3">
        {mode === 'fibra' ? (
          [
            { id: '', label: 'Todos os clientes Fibra' },
            { id: 'active', label: 'Fibra Activos (Online)' },
            { id: 'late', label: 'Fibra em Atraso (LOS/Corte)' },
            { id: 'suspended', label: 'Fibra Suspensos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
            >
              {tab.label}
            </button>
          ))
        ) : mode === 'tv' ? (
          [
            { id: '', label: 'Todos os clientes TV a Cabo' },
            { id: 'active', label: 'TV Activos (Sinal Ligado)' },
            { id: 'late', label: 'TV em Atraso (Pendente Corte)' },
            { id: 'suspended', label: 'TV Suspensos (Desligados)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
            >
              {tab.label}
            </button>
          ))
        ) : (
          [
            { id: '', label: 'Todos os clientes' },
            { id: 'tv', label: 'TV a Cabo (4.000 Kz)' },
            { id: 'internet', label: 'Internet Fibra' },
            { id: 'combo', label: 'TV + Internet (Combo)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setServiceFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                serviceFilter === tab.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
            >
              {tab.label}
            </button>
          ))
        )}
      </div>

      {/* Barra de pesquisa e filtros de estado */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" size={17} />
          <Input
            placeholder={
              mode === 'fibra'
                ? 'Pesquisar cliente fibra por nome, código, PDO, ONU, BI ou telefone...'
                : mode === 'tv'
                ? 'Pesquisar cliente TV por nome, código, casa, BI ou telefone...'
                : 'Pesquisar por nome, código, casa, BI ou telefone...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="late">Em atraso (Corte)</option>
          <option value="suspended">Suspensos (&gt;3 meses)</option>
          <option value="inactive">Inactivos</option>
          <option value="request">Com pedido pendente</option>
        </Select>
      </div>

      {items.length === 0 ? (
        <div className="surface rounded-xl p-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum cliente encontrado com os critérios actuais.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearch('');
              setServiceFilter('');
              setStatusFilter('');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-xl">
          <div className="mobile-scroll overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  <th className="px-5 py-4">Cliente</th>
                  <th>Casa / BI</th>
                  <th>Serviço</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th className="px-5 text-right">Acções</th>
                </tr>
              </thead>
              <tbody>
                {items.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="border-b border-[hsl(var(--border)/.7)] last:border-0 hover:bg-[hsl(var(--secondary)/.35)]"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/clientes/${client.id}`} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--secondary))] text-xs font-black text-[hsl(var(--primary))]">
                          {initials(client.fullName)}
                        </span>
                        <span>
                          <b className="block text-sm">{client.fullName}</b>
                          <small className="mono text-[10px] text-[hsl(var(--muted-foreground))]">
                            {client.code}
                          </small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="mono text-xs font-bold text-[#0b4a8a]">
                        {client.houseCode || '—'}
                      </span>
                      <small className="block text-[10px] text-[hsl(var(--muted-foreground))]">
                        BI: {client.documentNumber || '—'}
                      </small>
                    </td>
                    <td>
                      <span className="text-xs font-semibold">{serviceLabel(client.serviceType)}</span>
                      {client.serviceType === 'tv' && (
                        <small className="block text-[10px] text-[#237052] font-bold">4.000 Kz/mês</small>
                      )}
                    </td>
                    <td>
                      <span className="text-xs">{client.phone}</span>
                      <small className="block text-[11px] text-[hsl(var(--muted-foreground))]">
                        {client.neighborhood || client.address}
                      </small>
                    </td>
                    <td>
                      <StatusBadge value={client.status} />
                    </td>
                    <td className="px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {client.serviceType !== 'internet' && (
                          <button
                            onClick={() => setMigratingClient(client)}
                            title="Migrar para Internet Fibra Óptica e Gerar Novo Contrato"
                            className="flex items-center gap-1 rounded-lg bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-500/20 transition dark:text-purple-300"
                          >
                            <Zap size={13} />
                            <span>Migrar Fibra</span>
                          </button>
                        )}
                        <button
                          onClick={() => setCredentialsClient(client)}
                          title="Gerar / Ver Credenciais de Acesso ao APK Cliente (PIN e Contrato)"
                          className="flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-500/20 transition dark:text-blue-300"
                        >
                          <Smartphone size={13} />
                          <span className="hidden xl:inline">Acesso APK</span>
                        </button>
                        <Link
                          href={`/clientes/${client.id}`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]"
                        >
                          Ver ficha
                        </Link>
                        <button
                          onClick={() => {
                            setEdit(client);
                            setModal(true);
                          }}
                          title="Editar dados cadastrais"
                          className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                        >
                          <FilePenLine size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Migrar para Fibra Óptica & Gerar Contrato */}
      {migratingClient && (
        <MigrateToFiberModal
          client={migratingClient}
          onClose={() => setMigratingClient(null)}
          onSuccess={(newContract) => {
            const updatedClient = {
              ...migratingClient,
              serviceType: 'internet',
            };
            setMigratingClient(null);
            setCreatedContractPreview({
              client: updatedClient,
              contract: newContract,
            });
          }}
        />
      )}

      {/* Modal Credenciais APK Cliente */}
      {credentialsClient && (
        <ClientCredentialsModal
          client={credentialsClient}
          onClose={() => setCredentialsClient(null)}
        />
      )}

      {/* Modal Criar / Editar Cliente */}
      {modal && (
        <ClientModal
          client={edit}
          defaultServiceType={mode === 'fibra' ? 'internet' : 'tv'}
          settings={settings}
          close={() => setModal(false)}
          onCreated={(res) => {
            setModal(false);
            setCreatedContractPreview(res);
          }}
        />
      )}

      {/* Preview Contrato gerado automaticamente */}
      {createdContractPreview && (
        <ContractPreview
          client={createdContractPreview.client}
          contract={createdContractPreview.contract}
          settings={settings}
          close={() => setCreatedContractPreview(null)}
        />
      )}

      {/* Modal Imprimir Lista de Clientes */}
      {printModal && (
        <ClientListPreview
          clients={items}
          title={
            serviceFilter === 'tv'
              ? 'Clientes TV a Cabo'
              : serviceFilter === 'internet'
                ? 'Clientes Internet Fibra'
                : serviceFilter === 'combo'
                  ? 'Clientes TV + Internet'
                  : 'Todos os Clientes'
          }
          settings={settings}
          close={() => setPrintModal(false)}
        />
      )}
    </div>
  );
}

function ClientModal({
  client,
  defaultServiceType = 'tv',
  settings,
  close,
  onCreated,
}: {
  client?: Client;
  defaultServiceType?: string;
  settings: AnyRecord;
  close: () => void;
  onCreated: (res: { client: AnyRecord; contract: AnyRecord }) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(
    client
      ? { ...emptyClient, ...client }
      : { ...emptyClient, serviceType: defaultServiceType },
  );
  const create = useCreateClient();
  const update = useUpdateClient();

  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) return;
    const data = {
      ...form,
      email: form.email || null,
      alternatePhone: form.alternatePhone || null,
      neighborhood: form.neighborhood || null,
      documentNumber: form.documentNumber || null,
      houseCode: form.houseCode || null,
      pdoNumber: form.pdoNumber || null,
      onuNumber: form.onuNumber || null,
      notes: form.notes || null,
    };

    if (client) {
      update.mutate(
        { clientId: client.id, data },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getListClientsQueryKey() });
            qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
            close();
          },
        },
      );
    } else {
      create.mutate(
        { data },
        {
          onSuccess: (res: any) => {
            qc.invalidateQueries({ queryKey: getListClientsQueryKey() });
            qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
            onCreated(res);
          },
        },
      );
    }
  };

  const internetPlans: any[] = settings.internetPlans || [
    { id: 'fibra-10', name: 'Fibra 10', speed: '10 Mbps/s', price: 6500 },
    { id: 'fibra-22', name: 'Fibra 22', speed: '22 Mbps/s', price: 8500 },
    { id: 'fibra-50', name: 'Fibra 50', speed: '50 Mbps/s', price: 12000 },
  ];

  return (
    <Modal
      title={client ? 'Editar cliente' : 'Registar novo cliente'}
      eyebrow="Base de clientes OSDEL"
      onClose={close}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo *">
            <Input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              required
              placeholder="Ex.: António Domingos Pedro"
            />
          </Field>
          <Field label="Telefone principal *">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              required
              placeholder="+244 923 000 000"
            />
          </Field>
          <Field label="Telefone alternativo">
            <Input
              value={form.alternatePhone || ''}
              onChange={(e) => set('alternatePhone', e.target.value)}
              placeholder="+244 992 000 000"
            />
          </Field>
          <Field label="N.º de Bilhete de Identidade (BI) *">
            <Input
              value={form.documentNumber || ''}
              onChange={(e) => set('documentNumber', e.target.value)}
              required
              placeholder="Ex.: 004829104LA041"
            />
          </Field>
          <Field label="Código da Casa / Residência *">
            <Input
              value={form.houseCode || ''}
              onChange={(e) => set('houseCode', e.target.value)}
              required
              placeholder="Ex.: Casa 45B ou Bloco B"
            />
          </Field>
          <Field label="Bairro">
            <Input
              value={form.neighborhood || ''}
              onChange={(e) => set('neighborhood', e.target.value)}
              placeholder="Golf I, Palanca, etc."
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Morada completa *">
              <Input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                required
                placeholder="Rua, número de porta e ponto de referência"
              />
            </Field>
          </div>

          <Field label="Tipo de serviço">
            <Select value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)}>
              <option value="tv">TV a Cabo Comunitária (4.000 Kz/mês)</option>
              <option value="internet">Internet Fibra Óptica</option>
              <option value="combo">Combo (TV a Cabo + Internet Fibra)</option>
            </Select>
          </Field>

          {form.serviceType !== 'tv' ? (
            <Field label="Plano de Internet Fibra">
              <Select value={form.planId} onChange={(e) => set('planId', e.target.value)}>
                {internetPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.speed}) — {kz(p.price)}/mês
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div className="rounded-lg bg-[#edf6f1] p-3 text-xs text-[#237052]">
              <b className="block font-black">Regra comercial TV a Cabo:</b>
              Mensalidade fixa de 4.000 Kz com vencimento do dia 1 ao dia 5. Multa de 1.000 Kz após o dia 5.
            </div>
          )}

          <Field label="PDO / Caixa de derivação">
            <Input
              value={form.pdoNumber || ''}
              onChange={(e) => set('pdoNumber', e.target.value)}
              placeholder="Ex.: PDO-04"
            />
          </Field>
          <Field label="N.º Equipamento ONU">
            <Input
              value={form.onuNumber || ''}
              onChange={(e) => set('onuNumber', e.target.value)}
              placeholder="Ex.: ONU-OSD-1234"
            />
          </Field>
        </div>

        <Field label="Notas internas (ex: Pedido de não corte, instruções técnicas)">
          <Textarea
            rows={2}
            value={form.notes || ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Informações relevantes sobre este cliente..."
          />
        </Field>

        <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4">
          <Button variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? 'A registar…' : <><Check size={15} /> Guardar & Gerar Contrato</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================================
   2. PAYMENTS PAGE: Search client by name, house code, BI or phone,
      automatic 1.000 Kz penalty calculation after 5th, and invoice print.
   ========================================================================= */

export function PaymentsPage() {
  const { mode, meta } = useServiceMode();
  const clients = useListClients({ serviceMode: mode || undefined });
  const paymentsQuery = useListPayments({ serviceMode: mode || undefined });
  const settingsQuery = useGetSettings();
  const qc = useQueryClient();
  const createPayment = useCreatePayment();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ payment: AnyRecord; client: AnyRecord } | null>(null);

  // Search in modal
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(() => (mode === 'fibra' ? '6500' : '4000'));
  const [penaltyAmount, setPenaltyAmount] = useState('0');
  const [method, setMethod] = useState('multicaixa');
  const [reference, setReference] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const allClients = clients.data?.items || [];
  const settings = settingsQuery.data || {};
  const rows = (paymentsQuery.data?.items || []).filter((p: any) => {
    if (!search) return true;
    const c = allClients.find((item: any) => item.id === p.clientId);
    const text = `${c?.fullName || ''} ${c?.houseCode || ''} ${c?.documentNumber || ''} ${c?.phone || ''} ${p.reference || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Client search within modal
  const searchResults = clientSearch.trim()
    ? allClients.filter((c: any) => {
        const text = `${c.fullName} ${c.houseCode || ''} ${c.documentNumber || ''} ${c.phone || ''} ${c.code || ''}`.toLowerCase();
        return text.includes(clientSearch.toLowerCase().trim());
      })
    : [];

  const selectedClient = allClients.find((c: any) => c.id === selectedClientId);

  const selectClient = (c: any) => {
    setSelectedClientId(c.id);
    setClientSearch('');

    // Default amount
    let base = Number(settings.tvMonthlyPrice || 4000);
    if (c.serviceType === 'internet') {
      base = 6500;
    } else if (c.serviceType === 'combo') {
      base = 10500;
    }
    setPaymentAmount(String(base));

    // Penalty check: after day 5, apply 1000 Kz
    const currentDay = new Date().getDate();
    const dueDay = Number(settings.paymentDueDay || 5);
    if (currentDay > dueDay) {
      setPenaltyAmount(String(settings.latePenalty || 1000));
    } else {
      setPenaltyAmount('0');
    }
  };

  const handleCreatePayment = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    createPayment.mutate(
      {
        data: {
          clientId: selectedClientId,
          amount: Number(paymentAmount),
          penalty: Number(penaltyAmount),
          paymentMonth,
          method,
          reference: reference || `REC-${Date.now().toString().slice(-5)}`,
        },
      },
      {
        onSuccess: (newPayment: any) => {
          qc.invalidateQueries({ queryKey: getListPaymentsQueryKey({ serviceMode: mode || undefined }) });
          qc.invalidateQueries({ queryKey: getListClientsQueryKey({ serviceMode: mode || undefined }) });
          qc.invalidateQueries({ queryKey: getGetDashboardQueryKey(mode || '') });
          setModal(false);

          // Open invoice preview immediately
          const c = allClients.find((item: any) => item.id === selectedClientId);
          if (c) {
            setSelectedInvoice({ payment: newPayment, client: c });
          }

          // Reset
          setSelectedClientId(null);
          setClientSearch('');
          setReference('');
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow={`Tesouraria & Caixa · Modo ${meta.shortName}`}
        title={`Pagamentos (${meta.shortName})`}
        detail={`Registo de mensalidades ${
          mode === 'fibra'
            ? 'de Internet Fibra Óptica'
            : mode === 'tv'
            ? 'de TV a Cabo Comunitária (4.000 Kz)'
            : 'de TV por Cabo & Internet Fibra'
        } com busca rápida por Nome, Casa, BI ou Telefone e aplicação automática de multa após dia 5.`}
        action={
          <Button
            onClick={() => {
              setSelectedClientId(null);
              setClientSearch('');
              setPaymentAmount(mode === 'fibra' ? '6500' : '4000');
              setModal(true);
            }}
          >
            <Plus size={16} /> Registar pagamento
          </Button>
        }
      />

      <div className="mb-5 relative max-w-xl">
        <Search className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" size={17} />
        <Input
          placeholder="Pesquisar recibo por cliente, casa, BI ou referência..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {rows.length === 0 ? (
        <div className="surface rounded-xl p-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum pagamento registado nesta pesquisa.</p>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-xl">
          <div className="mobile-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  <th className="px-5 py-4">Documento / Cliente</th>
                  <th>Casa / BI</th>
                  <th>Mês</th>
                  <th>Método</th>
                  <th>Data</th>
                  <th>Multa</th>
                  <th className="px-5 text-right">Total</th>
                  <th className="px-5 text-center">Factura</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p: any) => {
                  const c = allClients.find((item: any) => item.id === p.clientId);
                  const total = Number(p.amount) + Number(p.penalty || 0);
                  return (
                    <tr key={p.id} className="border-b border-[hsl(var(--border)/.7)] last:border-0 hover:bg-[hsl(var(--secondary)/.35)]">
                      <td className="px-5 py-4">
                        <b className="text-sm">{c?.fullName || 'Cliente não encontrado'}</b>
                        <small className="block mono text-[10px] text-[hsl(var(--muted-foreground))]">
                          Ref: {p.reference || `FT-${String(p.id).padStart(5, '0')}`}
                        </small>
                      </td>
                      <td>
                        <span className="mono text-xs font-bold">{c?.houseCode || '—'}</span>
                        <small className="block text-[10px] text-[hsl(var(--muted-foreground))]">
                          {c?.documentNumber || '—'}
                        </small>
                      </td>
                      <td className="text-xs font-mono font-semibold">{p.paymentMonth}</td>
                      <td className="text-xs capitalize">{p.method}</td>
                      <td className="text-xs text-[hsl(var(--muted-foreground))]">{date(p.paidAt)}</td>
                      <td>
                        {p.penalty > 0 ? (
                          <span className="rounded bg-[#f7e9c9] px-2 py-0.5 text-[10px] font-bold text-[#946c22]">
                            +{kz(p.penalty)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#237052]">Sem multa</span>
                        )}
                      </td>
                      <td className="px-5 text-right font-black text-[#0b4a8a]">{kz(total)}</td>
                      <td className="px-5 text-center">
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            if (c) setSelectedInvoice({ payment: p, client: c });
                          }}
                        >
                          <Printer size={13} /> Ver / Imprimir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registar Pagamento */}
      {modal && (
        <Modal
          title="Registar pagamento de cliente"
          eyebrow="Tesouraria OSDEL"
          onClose={() => setModal(false)}
        >
          <form onSubmit={handleCreatePayment} className="space-y-5">
            {/* Campo de pesquisa de cliente */}
            <div>
              <span className="text-xs font-bold text-[hsl(var(--foreground))]">
                Pesquisar cliente (Nome, Código da Casa, BI ou Telefone) *
              </span>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" size={16} />
                <Input
                  autoFocus
                  placeholder="Escreva o nome, casa (ex: Casa 45B), BI ou telefone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Lista de resultados em tempo real */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectClient(c)}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[hsl(var(--secondary))]"
                    >
                      <div>
                        <b className="text-xs">{c.fullName}</b>
                        <span className="ml-2 rounded bg-[hsl(var(--secondary))] px-1.5 py-0.5 text-[10px] font-mono">
                          Casa: {c.houseCode || '—'}
                        </span>
                        <div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                          BI: {c.documentNumber || '—'} · Tel: {c.phone}
                        </div>
                      </div>
                      <StatusBadge value={c.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cartão do cliente seleccionado */}
            {selectedClient ? (
              <div className="rounded-xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--secondary)/.4)] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                      Cliente Seleccionado
                    </span>
                    <h3 className="text-base font-black">{selectedClient.fullName}</h3>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      Código: {selectedClient.code} · Casa: <b>{selectedClient.houseCode || '—'}</b> · BI: {selectedClient.documentNumber || '—'}
                    </p>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      Serviço: <b>{serviceLabel(selectedClient.serviceType)}</b> · Telefone: {selectedClient.phone}
                    </p>
                  </div>
                  <StatusBadge value={selectedClient.status} />
                </div>

                {/* Avisos de política de cobrança */}
                {selectedClient.status === 'suspended' && (
                  <div className="mt-3 rounded-lg bg-[#f8e1da] p-3 text-xs text-[#a24e3a]">
                    <b>Atenção:</b> Este cliente está suspenso (&gt;3 meses sem pagar).
                    A taxa de renovação contratual segundo o regulamento é de 10.000 Kz.
                  </div>
                )}
                {new Date().getDate() > Number(settings.paymentDueDay || 5) && (
                  <div className="mt-3 rounded-lg bg-[#f7e9c9] p-3 text-xs text-[#946c22]">
                    <b>Multa automática:</b> Hoje é dia {new Date().getDate()}. Como passou do dia 5,
                    foi aplicada a multa de 1.000 Kz por atraso.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
                Pesquise e clique no cliente na lista acima para preencher os dados de cobrança.
              </div>
            )}

            {/* Valores e método */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valor da mensalidade (Kz) *">
                <Input
                  type="number"
                  min="0"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </Field>
              <Field label="Multa por atraso (Kz)">
                <Input
                  type="number"
                  min="0"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                />
              </Field>
              <Field label="Mês de referência">
                <Input
                  type="month"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                />
              </Field>
              <Field label="Forma de pagamento">
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="multicaixa">Multicaixa</option>
                  <option value="transferência">Transferência Bancária</option>
                  <option value="numerário">Numerário / Dinheiro</option>
                  <option value="express">Multicaixa Express</option>
                </Select>
              </Field>
            </div>

            <Field label="N.º de comprovativo / Referência">
              <Input
                placeholder="Ex.: MCX-84920 ou Ref. BFA"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </Field>

            {/* Totalizador */}
            <div className="flex items-center justify-between rounded-xl bg-[#f0f5fa] p-4 text-[#0b4a8a]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Total a Cobrar</span>
                <p className="text-xs opacity-75">Mensalidade + Multa aplicável</p>
              </div>
              <div className="text-2xl font-black">
                {kz(Number(paymentAmount || 0) + Number(penaltyAmount || 0))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4">
              <Button variant="outline" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!selectedClientId || createPayment.isPending}>
                {createPayment.isPending ? 'A confirmar…' : <><Check size={15} /> Confirmar & Imprimir Recibo</>}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Visualizador / Impressor de Factura */}
      {selectedInvoice && (
        <InvoicePreview
          payment={selectedInvoice.payment}
          client={selectedInvoice.client}
          settings={settings}
          close={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   3. REPORTS PAGE: Filter by Daily, Weekly, Monthly, Annual, or Custom;
      columns: data, pagamentos, valor, saidas com o motivo, resto, total, operador;
      printable PDF official report.
   ========================================================================= */

export function ReportsPage() {
  const { mode, meta } = useServiceMode();
  const now = new Date();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [customEnd, setCustomEnd] = useState(() => now.toISOString().slice(0, 10));
  const [printModal, setPrintModal] = useState(false);

  const settingsQuery = useGetSettings();
  const settings = settingsQuery.data || {};

  // Compute dates based on period
  let startDate = '';
  let endDate = now.toISOString().slice(0, 10);
  let periodTitle = '';

  if (period === 'day') {
    startDate = now.toISOString().slice(0, 10);
    periodTitle = `Diário — ${new Intl.DateTimeFormat('pt-AO', { dateStyle: 'full' }).format(now)}`;
  } else if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().slice(0, 10);
    periodTitle = 'Semanal — Últimos 7 dias';
  } else if (period === 'month') {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    periodTitle = `Mensal — ${new Intl.DateTimeFormat('pt-AO', { month: 'long', year: 'numeric' }).format(now)}`;
  } else if (period === 'year') {
    startDate = `${now.getFullYear()}-01-01`;
    periodTitle = `Anual — Ano lectivo ${now.getFullYear()}`;
  } else {
    startDate = customStart;
    endDate = customEnd;
    periodTitle = `Personalizado — De ${date(customStart)} até ${date(customEnd)}`;
  }

  const reportsQuery = useGetReports({
    reportType: period,
    startDate,
    endDate,
    serviceMode: mode || undefined,
  });

  const reportData = reportsQuery.data || { summary: {}, rows: [] };
  const s = reportData.summary || {};
  const rows: AnyRecord[] = reportData.rows || [];

  return (
    <div>
      <PageHeader
        eyebrow={`Controlo financeiro · Modo ${meta.shortName}`}
        title={`Relatórios (${meta.shortName})`}
        detail={`Emissão de relatórios financeiros de ${meta.name} com entradas, saídas justificadas, resto, total acumulado e operador.`}
        action={
          <Button variant="outline" onClick={() => setPrintModal(true)}>
            <Printer size={15} /> Imprimir Relatório Oficial (PDF)
          </Button>
        }
      />

      {/* Selectores de período */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[hsl(var(--border))] pb-4">
        {[
          { id: 'day', label: 'Diário (Hoje)' },
          { id: 'week', label: 'Semanal (7 dias)' },
          { id: 'month', label: 'Mensal (Este Mês)' },
          { id: 'year', label: 'Anual (Este Ano)' },
          { id: 'custom', label: 'Personalizado' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              period === p.id
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
            }`}
          >
            {p.label}
          </button>
        ))}

        {period === 'custom' && (
          <div className="flex items-center gap-2 pl-2">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 w-36 text-xs"
            />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">até</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 w-36 text-xs"
            />
          </div>
        )}
      </div>

      {/* Resumo financeiro */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface rounded-xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Entradas (Valor)
          </span>
          <b className="mt-2 block text-2xl text-[#0b4a8a]">{kz(s.receita_total)}</b>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Total arrecadado</span>
        </div>
        <div className="surface rounded-xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a24e3a]">
            Saídas com o motivo
          </span>
          <b className="mt-2 block text-2xl text-[#a24e3a]">{kz(s.saidas)}</b>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Despesas operacionais</span>
        </div>
        <div className="surface rounded-xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#237052]">
            Resto (Saldo Líquido)
          </span>
          <b className="mt-2 block text-2xl text-[#237052]">{kz(s.resto)}</b>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Entradas menos saídas</span>
        </div>
        <div className="surface rounded-xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            N.º de Pagamentos
          </span>
          <b className="mt-2 block text-2xl">{s.pagamentos || 0}</b>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Recibos emitidos no período</span>
        </div>
      </div>

      {/* Tabela do relatório */}
      <section className="surface mt-6 overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5">
          <div>
            <p className="eyebrow">Movimentos detalhados</p>
            <h2 className="mt-1 text-lg font-extrabold">{periodTitle}</h2>
          </div>
          <Button variant="outline" onClick={() => setPrintModal(true)}>
            <Printer size={15} /> Imprimir / PDF
          </Button>
        </div>

        {rows.length ? (
          <div className="mobile-scroll overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  <th className="px-5 py-4">Data</th>
                  <th className="text-center">Pagamentos</th>
                  <th className="text-right">Valor</th>
                  <th className="px-5">Saídas com o motivo</th>
                  <th className="text-right">Resto</th>
                  <th className="px-5 text-right">Total</th>
                  <th className="text-center">Operador</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-[hsl(var(--border)/.7)] last:border-0 hover:bg-[hsl(var(--secondary)/.35)]"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#0b4a8a]">
                      {date(r.data)}
                    </td>
                    <td className="text-center text-sm font-semibold">{r.pagamentos}</td>
                    <td className="text-right font-bold text-[#237052]">{kz(r.valor)}</td>
                    <td className="px-5 text-xs text-[hsl(var(--foreground))]">
                      {r.motivo || '—'}
                    </td>
                    <td className="text-right font-bold text-sm">{kz(r.resto)}</td>
                    <td className="px-5 text-right font-black text-[#0b4a8a] text-sm">
                      {kz(r.total)}
                    </td>
                    <td className="text-center font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {r.operador || 'deezy'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Sem movimentos registados para o intervalo seleccionado.
          </p>
        )}
      </section>

      {/* Modal Impressão Oficial */}
      {printModal && (
        <ReportPreview
          report={reportData}
          periodTitle={periodTitle}
          settings={settings}
          close={() => setPrintModal(false)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   4. MESSAGES & ALERTS PAGE:
      - Send manual message for all client categories (Activos, Em atraso,
        Suspensos, TV, Fibra, Todos).
      - Automated reminder for 1st-5th day of month.
      - WhatsApp direct link integration.
   ========================================================================= */

export function MessagesPage() {
  const { mode, meta } = useServiceMode();
  const clientsQuery = useListClients({ serviceMode: mode || undefined });
  const messagesQuery = useListMessages({ serviceMode: mode || undefined });
  const settingsQuery = useGetSettings();
  const create = useCreateMessage();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState('clientes em atraso');
  const [channel, setChannel] = useState('SMS');
  const [messageText, setMessageText] = useState('');
  const [autoReminderSuccess, setAutoReminderSuccess] = useState(false);

  const allClients = clientsQuery.data?.items || [];
  const settings = settingsQuery.data || {};
  const messagesList = messagesQuery.data || [];

  // Filter recipients based on chosen category
  const targetRecipients = allClients.filter((c: any) => {
    if (category === 'clientes em atraso') return c.status === 'late';
    if (category === 'clientes activos') return c.status === 'active';
    if (category === 'clientes suspensos') return c.status === 'suspended';
    if (category === 'clientes tv') return c.serviceType === 'tv';
    if (category === 'clientes fibra') return c.serviceType === 'internet' || c.serviceType === 'combo';
    return true; // todos os clientes
  });

  const templates = [
    {
      title: 'Alerta Dias 1 a 5 (Vencimento)',
      text: 'OSDEL TECNOLOGIA: Estimado cliente, lembramos que a sua mensalidade vence no dia 5 deste mês. Efectue o pagamento atempadamente para garantir o seu sinal e evitar multa de 1.000 Kz.',
    },
    {
      title: 'Aviso de Corte de Sinal (Em atraso)',
      text: 'OSDEL TECNOLOGIA: Estimado cliente, o seu sinal de TV/Internet encontra-se em atraso. Efectue a liquidação com taxa de 1.000 Kz para evitar a interrupção do serviço.',
    },
    {
      title: 'Aviso de Suspensão (3 Meses)',
      text: 'OSDEL TECNOLOGIA: Informamos que o seu contrato atingiu 3 meses sem liquidação e foi suspenso. Para religação, dirija-se ao nosso posto para renovação contratual (taxa: 10.000 Kz).',
    },
    {
      title: 'Confirmação de Pagamento',
      text: 'OSDEL TECNOLOGIA: O seu pagamento foi confirmado com sucesso. Obrigado por confiar nos nossos serviços!',
    },
  ];

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    create.mutate(
      {
        data: {
          audience: category,
          channel,
          message: messageText,
          recipientCount: targetRecipients.length,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListMessagesQueryKey() });
          setModal(false);
          setMessageText('');
        },
      },
    );
  };

  // Disparo automático dias 1 a 5
  const triggerAutoReminder = () => {
    const unpaidClients = allClients.filter((c: any) => c.status !== 'active');
    create.mutate(
      {
        data: {
          audience: 'todos os clientes com pagamento pendente',
          channel: 'SMS Automático (Dias 1 a 5)',
          message:
            'OSDEL TECNOLOGIA: Alerta automático de cobrança mensal. Mensalidade de TV a 4.000 Kz com vencimento dia 5. Regularize o seu sinal.',
          recipientCount: unpaidClients.length,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListMessagesQueryKey() });
          setAutoReminderSuccess(true);
          setTimeout(() => setAutoReminderSuccess(false), 5000);
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Comunicação & Cobrança"
        title="Mensagens & Alertas"
        detail="Envio de mensagens manuais para todas as categorias de clientes (Activos, Em atraso, Suspensos) e disparo de lembretes automáticos de 1 a 5 de cada mês."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={triggerAutoReminder}>
              <Bell size={15} /> Disparar Alerta Automático (Dias 1 a 5)
            </Button>
            <Button
              onClick={() => {
                setMessageText(templates[0].text);
                setModal(true);
              }}
            >
              <Send size={15} /> Nova Mensagem Manual
            </Button>
          </div>
        }
      />

      {autoReminderSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#dceee5] p-4 text-sm font-bold text-[#237052]">
          <Check size={18} />
          Alerta automático de pagamento (Dias 1 a 5) disparado com sucesso para todos os clientes da carteira!
        </div>
      )}

      {/* Disparo rápido por categoria */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            id: 'clientes em atraso',
            label: 'Clientes em Atraso (Corte)',
            count: allClients.filter((c) => c.status === 'late').length,
            tone: 'border-[#f7e9c9] bg-[#fffdfa]',
            textTone: 'text-[#946c22]',
          },
          {
            id: 'clientes activos',
            label: 'Clientes Activos',
            count: allClients.filter((c) => c.status === 'active').length,
            tone: 'border-[#dceee5] bg-[#fafdfb]',
            textTone: 'text-[#237052]',
          },
          {
            id: 'clientes suspensos',
            label: 'Clientes Suspensos (>3 Meses)',
            count: allClients.filter((c) => c.status === 'suspended').length,
            tone: 'border-[#f8e1da] bg-[#fdfaf9]',
            textTone: 'text-[#a24e3a]',
          },
          {
            id: 'clientes tv',
            label: 'Clientes TV a Cabo',
            count: allClients.filter((c) => c.serviceType === 'tv').length,
            tone: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
            textTone: 'text-[hsl(var(--foreground))]',
          },
          {
            id: 'clientes fibra',
            label: 'Clientes Internet Fibra',
            count: allClients.filter((c) => c.serviceType === 'internet' || c.serviceType === 'combo').length,
            tone: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
            textTone: 'text-[hsl(var(--foreground))]',
          },
          {
            id: 'todos os clientes',
            label: 'Todos os Clientes',
            count: allClients.length,
            tone: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
            textTone: 'text-[hsl(var(--foreground))]',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCategory(item.id);
              if (item.id === 'clientes em atraso') setMessageText(templates[1].text);
              else if (item.id === 'clientes suspensos') setMessageText(templates[2].text);
              else setMessageText(templates[0].text);
              setModal(true);
            }}
            className={`flex items-center justify-between rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}
          >
            <div>
              <span className={`text-xs font-black ${item.textTone}`}>{item.label}</span>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {item.count} cliente(s) elegível(is)
              </p>
            </div>
            <Send size={16} className={item.textTone} />
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        {/* Histórico de comunicações */}
        <section className="surface rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Registo de envios</p>
              <h2 className="mt-1 text-lg font-extrabold">Mensagens preparadas e enviadas</h2>
            </div>
            <MessageSquare size={19} className="text-[hsl(var(--primary))]" />
          </div>

          {messagesList.length ? (
            <div className="mt-5 space-y-3">
              {messagesList.map((m: any) => (
                <div key={m.id} className="rounded-xl border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[11px] font-bold uppercase">
                      {m.audience}
                    </span>
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
                      {m.channel} · {date(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--foreground))]">
                    {m.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                    <span>Estado: <b>Enviada</b></span>
                    <span>Operador: <b>{m.operator || 'deezy'}</b></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Ainda não foram enviadas mensagens através do sistema.
            </p>
          )}
        </section>

        {/* Contacto Directo WhatsApp por cliente */}
        <section className="surface rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Contacto directo</p>
              <h2 className="mt-1 text-lg font-extrabold">Clientes a avisar via WhatsApp</h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Clique no botão WhatsApp para abrir conversa directa no WhatsApp com a mensagem pronta:
          </p>

          <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {allClients.slice(0, 10).map((c: any) => {
              const cleanPhone = c.phone.replace(/[^0-9]/g, '');
              const waText = encodeURIComponent(
                `Olá estimado(a) ${c.fullName}, saudações da OSDEL TECNOLOGIA. Informamos que a sua mensalidade de ${serviceLabel(
                  c.serviceType,
                )} relativa à sua residência (${c.houseCode || c.address}) aguarda regularização. Muito obrigado!`,
              );
              const waUrl = `https://wa.me/${cleanPhone.startsWith('244') ? cleanPhone : '244' + cleanPhone}?text=${waText}`;

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <b className="truncate block font-bold">{c.fullName}</b>
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      Casa: {c.houseCode || '—'} · {c.phone}
                    </span>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white shadow hover:opacity-90"
                  >
                    WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modal Redacção Manual de Mensagem */}
      {modal && (
        <Modal
          title="Nova mensagem para clientes"
          eyebrow="Comunicação em massa OSDEL"
          onClose={() => setModal(false)}
        >
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria de destinatários *">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="clientes em atraso">Clientes em Atraso (Corte)</option>
                  <option value="clientes activos">Clientes Activos</option>
                  <option value="clientes suspensos">Clientes Suspensos (&gt;3 Meses)</option>
                  <option value="clientes tv">Clientes TV a Cabo</option>
                  <option value="clientes fibra">Clientes Internet Fibra</option>
                  <option value="todos os clientes">Todos os Clientes</option>
                </Select>
              </Field>
              <Field label="Canal de envio">
                <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <option value="SMS">SMS (Gateway Unitel / Africell)</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Comunicado">Comunicado Geral</option>
                </Select>
              </Field>
            </div>

            <div className="rounded-lg bg-[hsl(var(--secondary)/.6)] p-3 text-xs">
              Destinatários seleccionados: <b>{targetRecipients.length} cliente(s)</b> na categoria{' '}
              <b>{category}</b>.
            </div>

            {/* Modelos rápidos */}
            <div>
              <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                Modelos prontos:
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {templates.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(t.text)}
                    className="rounded bg-[hsl(var(--secondary))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))] hover:text-white"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Texto da mensagem *">
              <Textarea
                required
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escreva aqui o comunicado para os clientes..."
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-4">
              <Button variant="outline" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending || !messageText.trim()}>
                <Send size={15} /> {create.isPending ? 'A enviar…' : 'Enviar Mensagem'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
