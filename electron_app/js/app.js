/**
 * GESTÃO X · APLICAÇÃO DESKTOP ELECTRON (LOGIC & UI CONTROLLER)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // ESTADO GLOBAL DA APLICAÇÃO
  // =========================================================================
  let currentView = 'dashboard';
  let cachedClients = [];
  let cachedBudgets = [];
  let cachedInvoices = [];

  // =========================================================================
  // FORMATAÇÃO E UTILITÁRIOS
  // =========================================================================
  function formatKz(val) {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Kz`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // CONTROLES DE JANELA (ELECTRON IPC)
  // =========================================================================
  if (window.electronAPI) {
    document.getElementById('btn-win-min')?.addEventListener('click', () => window.electronAPI.minimize());
    document.getElementById('btn-win-max')?.addEventListener('click', () => window.electronAPI.maximize());
    document.getElementById('btn-win-close')?.addEventListener('click', () => window.electronAPI.close());
  }

  // =========================================================================
  // GERENCIAMENTO DE MODAIS
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close-modal');
      closeModal(targetId);
    });
  });

  // Fecha modal ao clicar fora do card
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // =========================================================================
  // MONITORAMENTO DE CONEXÃO & SAÚDE DA API
  // =========================================================================
  async function checkApiHealth() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    const latencyText = document.getElementById('api-latency-text');

    const result = await window.api.checkHealth();
    if (result.online) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'API Online';
      latencyText.textContent = `${result.latency} ms`;
    } else {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'API Desconectada';
      latencyText.textContent = '-- ms';
    }
  }

  document.getElementById('api-status-pill')?.addEventListener('click', async () => {
    showToast('Verificando conexão com a API...', 'info');
    await checkApiHealth();
    const result = await window.api.checkHealth();
    if (result.online) {
      showToast(`Conectado ao servidor (${result.latency}ms)`, 'success');
    } else {
      showToast('Servidor offline. Verifique a URL em Configurações.', 'error');
    }
  });

  setInterval(checkApiHealth, 30000); // Checagem a cada 30 segundos

  // =========================================================================
  // AUTENTICAÇÃO E SESSÃO
  // =========================================================================
  function updateUserInfoUI() {
    const user = window.api.getCurrentUser();
    if (!user) return;

    const name = user.full_name || user.username;
    const role = user.role || 'operador';
    const initial = name.charAt(0).toUpperCase();

    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');

    if (avatarEl) avatarEl.textContent = initial;
    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role;

    // Configurações tab
    const sFullname = document.getElementById('settings-user-fullname');
    const sUsername = document.getElementById('settings-user-username');
    const sEmail = document.getElementById('settings-user-email');
    const sRole = document.getElementById('settings-user-role');

    if (sFullname) sFullname.textContent = name;
    if (sUsername) sUsername.textContent = user.username;
    if (sEmail) sEmail.textContent = user.email || 'Não informado';
    if (sRole) sRole.textContent = role;
  }

  function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    updateUserInfoUI();
    checkApiHealth();
    navigateTo('dashboard');
  }

  function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    const urlInput = document.getElementById('login-api-url');
    if (urlInput) urlInput.value = window.api.baseUrl;
  }

  // Submissão do Formulário de Login
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('btn-login-submit');

    errorEl.style.display = 'none';
    errorEl.textContent = '';

    const apiUrl = document.getElementById('login-api-url').value.trim();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (apiUrl) window.api.setBaseUrl(apiUrl);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Autenticando...';

    try {
      const res = await window.api.login(username, password);
      if (res.success) {
        showToast('Login realizado com sucesso!', 'success');
        showApp();
      } else {
        throw new Error(res.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Erro ao realizar login.';
      errorEl.style.display = 'block';
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar no Sistema';
    }
  });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja encerrar a sessão?')) {
      window.api.logout();
      showLogin();
      showToast('Sessão encerrada.', 'info');
    }
  });

  window.addEventListener('auth:expired', () => {
    showLogin();
    showToast('A sua sessão expirou. Faça login novamente.', 'warning');
  });

  // =========================================================================
  // NAVEGAÇÃO ENTRE TELAS
  // =========================================================================
  const viewTitles = {
    dashboard: { title: 'Visão Geral', sub: 'Resumo operacional e métricas em tempo real' },
    clients: { title: 'Gestão de Clientes', sub: 'Base completa de assinantes de TV e Internet Fibra' },
    budgets: { title: 'Orçamentos & Propostas', sub: 'Orçamentos técnicos para novas adesões e extensões' },
    invoices: { title: 'Faturas & Cobrança', sub: 'Controle de mensalidades, faturas emitidas e pagamentos' },
    settings: { title: 'Configurações', sub: 'Servidor API, sessão e parâmetros da aplicação desktop' }
  };

  function navigateTo(viewName) {
    currentView = viewName;

    // Atualiza classes do menu
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Atualiza painéis
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    // Atualiza Top Bar
    const meta = viewTitles[viewName] || { title: 'Gestão X', sub: '' };
    document.getElementById('top-title').textContent = meta.title;
    document.getElementById('top-subtitle').textContent = meta.sub;

    // Dispara carregamento de dados da tela
    if (viewName === 'dashboard') loadDashboard();
    else if (viewName === 'clients') loadClients();
    else if (viewName === 'budgets') loadBudgets();
    else if (viewName === 'invoices') loadInvoices();
    else if (viewName === 'settings') loadSettings();
  }

  document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) navigateTo(view);
    });
  });

  // Botão "Atualizar" na barra superior
  document.getElementById('btn-refresh-data')?.addEventListener('click', () => {
    showToast('Atualizando dados...', 'info');
    navigateTo(currentView);
  });

  // Atalhos de "Novo Cliente"
  document.getElementById('btn-top-new-client')?.addEventListener('click', () => openClientModal());
  document.getElementById('btn-client-new')?.addEventListener('click', () => openClientModal());
  document.getElementById('btn-dash-view-all-clients')?.addEventListener('click', () => navigateTo('clients'));

  // =========================================================================
  // CARREGADOR: DASHBOARD
  // =========================================================================
  async function loadDashboard() {
    try {
      const res = await window.api.getDashboard();
      if (!res.success) return;

      const m = res.metrics;
      document.getElementById('dash-total-clients').textContent = m.clients.total;
      document.getElementById('dash-clients-breakdown').textContent = 
        `TV: ${m.clients.tv} · Fibra: ${m.clients.fibra} · Combo: ${m.clients.combo}`;

      document.getElementById('dash-active-clients').textContent = m.clients.active;
      document.getElementById('dash-late-clients').textContent = m.clients.late;
      document.getElementById('dash-suspended-subtext').textContent = `Suspensos: ${m.clients.suspended}`;

      document.getElementById('dash-revenue').textContent = formatKz(m.financial.revenue_total_kz);
      document.getElementById('dash-pending-revenue').textContent = `A receber: ${formatKz(m.financial.pending_total_kz)}`;

      // Renderiza últimos clientes
      const tbody = document.getElementById('dash-recent-clients-tbody');
      tbody.innerHTML = '';

      if (!res.recent_clients || res.recent_clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-subtle);">Nenhum cliente cadastrado ainda.</td></tr>';
        return;
      }

      res.recent_clients.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(c.code)}</strong></td>
          <td>${escapeHtml(c.full_name)}</td>
          <td>${escapeHtml(c.phone)}</td>
          <td>${escapeHtml(c.neighborhood || 'Luanda')}</td>
          <td><span class="badge badge-${c.service_type}">${c.service_type.toUpperCase()}</span></td>
          <td><span class="badge badge-${c.status}">${c.status}</span></td>
        `;
        tbody.appendChild(tr);
      });

      if (res._isOfflineCache) {
        showToast('Exibindo dados do cache local (Offline)', 'warning');
      }
    } catch (err) {
      showToast(`Erro ao carregar Dashboard: ${err.message}`, 'error');
    }
  }

  // =========================================================================
  // CARREGADOR: CLIENTES
  // =========================================================================
  async function loadClients() {
    const search = document.getElementById('clients-search')?.value.trim();
    const status = document.getElementById('clients-filter-status')?.value;
    const serviceType = document.getElementById('clients-filter-service')?.value;

    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Carregando clientes...</td></tr>';

    try {
      const res = await window.api.getClients({ search, status, service_type: serviceType, per_page: 100 });
      if (!res.success) throw new Error(res.message);

      cachedClients = res.items || [];
      tbody.innerHTML = '';

      if (cachedClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Nenhum cliente encontrado.</td></tr>';
        return;
      }

      cachedClients.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(c.code)}</strong></td>
          <td>
            <div style="font-weight: 600;">${escapeHtml(c.full_name)}</div>
            <div style="font-size: 11px; color: var(--text-subtle);">${escapeHtml(c.house_code ? `Casa: ${c.house_code}` : '')}</div>
          </td>
          <td>${escapeHtml(c.phone)}</td>
          <td>${escapeHtml(c.neighborhood || c.city || 'Luanda')}</td>
          <td><span class="badge badge-${c.service_type}">${c.service_type.toUpperCase()}</span></td>
          <td><strong>${formatKz(c.monthly_fee)}</strong></td>
          <td><span class="badge badge-${c.status}">${c.status}</span></td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-icon" title="Editar Cliente" onclick="window.editClient(${c.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn-icon delete" title="Excluir Cliente" onclick="window.deleteClient(${c.id}, '${escapeHtml(c.full_name)}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">${err.message}</td></tr>`;
      showToast(err.message, 'error');
    }
  }

  // Filtros em Clientes
  document.getElementById('clients-search')?.addEventListener('input', debounce(loadClients, 400));
  document.getElementById('clients-filter-status')?.addEventListener('change', loadClients);
  document.getElementById('clients-filter-service')?.addEventListener('change', loadClients);

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Modal Novo / Edição de Cliente
  function openClientModal(client = null) {
    const form = document.getElementById('form-client');
    form.reset();

    const titleEl = document.getElementById('modal-client-title');
    const idInput = document.getElementById('client-id');

    if (client) {
      titleEl.textContent = `Editar Cliente · ${client.code}`;
      idInput.value = client.id;
      document.getElementById('client-full-name').value = client.full_name || '';
      document.getElementById('client-phone').value = client.phone || '';
      document.getElementById('client-alt-phone').value = client.alternate_phone || '';
      document.getElementById('client-email').value = client.email || '';
      document.getElementById('client-neighborhood').value = client.neighborhood || '';
      document.getElementById('client-city').value = client.city || 'Luanda';
      document.getElementById('client-service-type').value = client.service_type || 'combo';
      document.getElementById('client-monthly-fee').value = client.monthly_fee || 5000;
      document.getElementById('client-status').value = client.status || 'active';
      document.getElementById('client-doc').value = client.document_number || '';
      document.getElementById('client-house-code').value = client.house_code || '';
      document.getElementById('client-pdo').value = client.pdo_number || '';
      document.getElementById('client-notes').value = client.notes || '';
    } else {
      titleEl.textContent = 'Cadastrar Novo Cliente';
      idInput.value = '';
    }

    openModal('modal-client');
  }

  // Salvar Cliente (POST ou PUT)
  document.getElementById('form-client')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-client');
    const clientId = document.getElementById('client-id').value;

    const payload = {
      full_name: document.getElementById('client-full-name').value.trim(),
      phone: document.getElementById('client-phone').value.trim(),
      alternate_phone: document.getElementById('client-alt-phone').value.trim(),
      email: document.getElementById('client-email').value.trim(),
      neighborhood: document.getElementById('client-neighborhood').value.trim(),
      city: document.getElementById('client-city').value.trim(),
      service_type: document.getElementById('client-service-type').value,
      monthly_fee: parseFloat(document.getElementById('client-monthly-fee').value) || 0,
      status: document.getElementById('client-status').value,
      document_number: document.getElementById('client-doc').value.trim(),
      house_code: document.getElementById('client-house-code').value.trim(),
      pdo_number: document.getElementById('client-pdo').value.trim(),
      notes: document.getElementById('client-notes').value.trim()
    };

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      if (clientId) {
        const res = await window.api.updateClient(clientId, payload);
        if (res.success) showToast('Cliente atualizado com sucesso!', 'success');
      } else {
        const res = await window.api.createClient(payload);
        if (res.success) showToast('Cliente cadastrado com sucesso!', 'success');
      }
      closeModal('modal-client');
      loadClients();
    } catch (err) {
      showToast(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar Cliente';
    }
  });

  window.editClient = function(id) {
    const found = cachedClients.find(c => c.id === id);
    if (found) openClientModal(found);
  };

  window.deleteClient = async function(id, name) {
    if (confirm(`Confirma a exclusão do cliente "${name}"? Todas as faturas e dados associados serão removidos.`)) {
      try {
        const res = await window.api.deleteClient(id);
        if (res.success) {
          showToast(`Cliente "${name}" excluído!`, 'success');
          loadClients();
        }
      } catch (err) {
        showToast(`Erro ao excluir: ${err.message}`, 'error');
      }
    }
  };

  // =========================================================================
  // CARREGADOR: ORÇAMENTOS
  // =========================================================================
  async function loadBudgets() {
    const status = document.getElementById('budgets-filter-status')?.value;
    const tbody = document.getElementById('budgets-tbody');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Carregando orçamentos...</td></tr>';

    try {
      const res = await window.api.getBudgets({ status });
      if (!res.success) throw new Error(res.message);

      cachedBudgets = res.items || [];
      tbody.innerHTML = '';

      if (cachedBudgets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Nenhum orçamento cadastrado.</td></tr>';
        return;
      }

      cachedBudgets.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(b.number)}</strong></td>
          <td>${escapeHtml(b.client_name)}</td>
          <td><span class="badge badge-${b.service_type}">${b.service_type.toUpperCase()}</span></td>
          <td><div style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(b.description)}</div></td>
          <td><strong>${formatKz(b.final_amount)}</strong></td>
          <td>${b.validity_days} dias</td>
          <td><span class="badge badge-${b.status}">${b.status}</span></td>
          <td style="text-align: right;">
            ${b.status === 'pendente' ? `
              <button class="btn btn-sm btn-primary" onclick="window.updateBudgetStatus(${b.id}, 'aprovado')">Aprovar</button>
            ` : '-'}
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">${err.message}</td></tr>`;
      showToast(err.message, 'error');
    }
  }

  document.getElementById('budgets-filter-status')?.addEventListener('change', loadBudgets);
  document.getElementById('btn-budget-new')?.addEventListener('click', () => openModal('modal-budget'));

  document.getElementById('form-budget')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      client_name: document.getElementById('budget-client-name').value.trim(),
      service_type: document.getElementById('budget-service-type').value,
      validity_days: parseInt(document.getElementById('budget-validity').value) || 15,
      total_amount: parseFloat(document.getElementById('budget-total-amount').value) || 0,
      discount: parseFloat(document.getElementById('budget-discount').value) || 0,
      description: document.getElementById('budget-desc').value.trim()
    };

    try {
      const res = await window.api.createBudget(payload);
      if (res.success) {
        showToast('Orçamento emitido com sucesso!', 'success');
        closeModal('modal-budget');
        document.getElementById('form-budget').reset();
        loadBudgets();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  window.updateBudgetStatus = async function(id, status) {
    try {
      const res = await window.api.updateBudgetStatus(id, status);
      if (res.success) {
        showToast(`Orçamento marcado como ${status}!`, 'success');
        loadBudgets();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // =========================================================================
  // CARREGADOR: FATURAS & COBRANÇA
  // =========================================================================
  async function loadInvoices() {
    const status = document.getElementById('invoices-filter-status')?.value;
    const tbody = document.getElementById('invoices-tbody');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Carregando faturas...</td></tr>';

    try {
      const res = await window.api.getInvoices({ status });
      if (!res.success) throw new Error(res.message);

      cachedInvoices = res.items || [];
      tbody.innerHTML = '';

      if (cachedInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-subtle);">Nenhuma fatura encontrada.</td></tr>';
        return;
      }

      cachedInvoices.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(inv.number)}</strong></td>
          <td>${escapeHtml(inv.client_name)}</td>
          <td>${formatKz(inv.amount)}</td>
          <td style="color: ${inv.penalty > 0 ? 'var(--warning)' : 'inherit'}">${formatKz(inv.penalty)}</td>
          <td><strong>${formatKz(inv.total)}</strong></td>
          <td>${inv.due_date || '--'}</td>
          <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
          <td style="text-align: right;">
            ${inv.status === 'pendente' || inv.status === 'vencida' ? `
              <button class="btn btn-sm btn-primary" onclick="window.openPaymentModal(${inv.id}, '${escapeHtml(inv.number)}', '${escapeHtml(inv.client_name)}', ${inv.total})">
                Receber
              </button>
            ` : `
              <span style="font-size: 11px; color: var(--success); font-weight: 600;">✓ Paga</span>
            `}
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">${err.message}</td></tr>`;
      showToast(err.message, 'error');
    }
  }

  document.getElementById('invoices-filter-status')?.addEventListener('change', loadInvoices);

  // Modal Emitir Fatura
  document.getElementById('btn-invoice-new')?.addEventListener('click', async () => {
    // Popula select de clientes
    const select = document.getElementById('invoice-client-select');
    select.innerHTML = '<option value="">Selecione um cliente...</option>';

    if (cachedClients.length === 0) {
      const res = await window.api.getClients({ per_page: 200 });
      if (res.success) cachedClients = res.items || [];
    }

    cachedClients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.code} - ${c.full_name} (${formatKz(c.monthly_fee)})`;
      opt.setAttribute('data-fee', c.monthly_fee);
      select.appendChild(opt);
    });

    // Data de vencimento padrão: 10 do mês seguinte
    const nextMonth = new Date();
    nextMonth.setDate(10);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('invoice-due-date').value = nextMonth.toISOString().split('T')[0];

    openModal('modal-invoice');
  });

  // Atualiza valor padrão ao selecionar cliente na fatura
  document.getElementById('invoice-client-select')?.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    const fee = selected?.getAttribute('data-fee');
    if (fee) document.getElementById('invoice-amount').value = fee;
  });

  document.getElementById('form-invoice')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const select = document.getElementById('invoice-client-select');
    const clientId = select.value;
    const clientName = select.options[select.selectedIndex]?.text.split(' - ')[1]?.split(' (')[0] || '';

    const payload = {
      client_id: parseInt(clientId),
      client_name: clientName,
      amount: parseFloat(document.getElementById('invoice-amount').value) || 0,
      penalty: parseFloat(document.getElementById('invoice-penalty').value) || 0,
      due_date: document.getElementById('invoice-due-date').value,
      status: document.getElementById('invoice-status').value
    };

    try {
      const res = await window.api.createInvoice(payload);
      if (res.success) {
        showToast('Fatura emitida com sucesso!', 'success');
        closeModal('modal-invoice');
        loadInvoices();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Modal Registrar Pagamento
  window.openPaymentModal = function(id, number, clientName, total) {
    document.getElementById('pay-invoice-id').value = id;
    document.getElementById('pay-invoice-desc').textContent = 
      `Fatura: ${number} · Cliente: ${clientName} · Total: ${formatKz(total)}`;
    openModal('modal-payment');
  };

  document.getElementById('form-payment')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pay-invoice-id').value;
    const method = document.getElementById('pay-method').value;
    const ref = document.getElementById('pay-ref').value.trim();

    try {
      const res = await window.api.payInvoice(id, { payment_method: method, reference_code: ref });
      if (res.success) {
        showToast('Pagamento registrado com sucesso!', 'success');
        closeModal('modal-payment');
        loadInvoices();
        if (currentView === 'dashboard') loadDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // =========================================================================
  // CARREGADOR: CONFIGURAÇÕES
  // =========================================================================
  function loadSettings() {
    const input = document.getElementById('settings-api-url');
    if (input) input.value = window.api.baseUrl;
    updateUserInfoUI();
  }

  document.getElementById('btn-save-api-url')?.addEventListener('click', () => {
    const url = document.getElementById('settings-api-url').value.trim();
    if (!url) return;
    window.api.setBaseUrl(url);
    showToast('URL da API salva com sucesso!', 'success');
    checkApiHealth();
  });

  document.getElementById('btn-test-connection')?.addEventListener('click', async () => {
    showToast('Testando conexão com a API...', 'info');
    const res = await window.api.checkHealth();
    if (res.online) {
      showToast(`Conexão OK! Latência: ${res.latency}ms`, 'success');
    } else {
      showToast(`Falha na conexão: ${res.error || 'Servidor inacessível'}`, 'error');
    }
  });

  document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) localStorage.removeItem(key);
    });
    showToast('Cache local offline limpo com sucesso!', 'info');
  });

  // =========================================================================
  // INICIALIZAÇÃO
  // =========================================================================
  if (window.api.isAuthenticated()) {
    showApp();
  } else {
    showLogin();
  }
});
