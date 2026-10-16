"""
GESTÃO X · CLIENTE DESKTOP WINDOWS: INTERNET FIBRA ÓPTICA (STANDALONE)
Executável leve, rápido e especializado para provedores de Internet (ISP) e fibra.
Compilação: pyinstaller --onefile --windowed --name "GestaoX_Fibra" --collect-all customtkinter main_fibra.py
"""
import tkinter as tk
from tkinter import messagebox, ttk
import customtkinter as ctk
from config import DesktopConfig
from api_client import APIClient

ctk.set_appearance_mode(DesktopConfig.THEME_APPEARANCE)
ctk.set_default_color_theme("green")

def kz_format(value):
    try:
        val = float(value or 0)
        return f"{val:,.0f} Kz".replace(",", ".")
    except Exception:
        return "0 Kz"

class GestaoXFibraApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Gestão X · Internet Fibra Óptica (ISP) v1.0.0")
        self.geometry("1180x700")
        self.minsize(980, 600)
        
        self.api = APIClient()
        self.current_screen = None
        self.fibra_clients = []
        
        if self.api.auth.is_authenticated():
            self.show_main_layout()
        else:
            self.show_login_screen()

    def clear_root(self):
        for widget in self.winfo_children():
            widget.destroy()

    # =========================================================================
    # TELA DE LOGIN (INTERNET FIBRA)
    # =========================================================================
    def show_login_screen(self):
        self.clear_root()
        
        login_frame = ctk.CTkFrame(self, corner_radius=18, width=440, height=520)
        login_frame.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
        title_badge = ctk.CTkLabel(
            login_frame,
            text="🌐 FIBRA",
            font=ctk.CTkFont(size=22, weight="bold"),
            width=90,
            height=54,
            corner_radius=12,
            fg_color="#064e3b",
            text_color="#34d399"
        )
        title_badge.pack(pady=(35, 10))
        
        app_title = ctk.CTkLabel(
            login_frame,
            text="Gestão X · Internet Fibra",
            font=ctk.CTkFont(size=20, weight="bold")
        )
        app_title.pack(pady=(0, 2))
        
        app_sub = ctk.CTkLabel(
            login_frame,
            text="Operações de Provedor de Internet (ISP)",
            font=ctk.CTkFont(size=12),
            text_color="gray"
        )
        app_sub.pack(pady=(0, 20))
        
        self.username_entry = ctk.CTkEntry(
            login_frame, placeholder_text="Usuário (ex: admin)", width=320, height=38
        )
        self.username_entry.insert(0, "admin")
        self.username_entry.pack(pady=6)
        
        self.password_entry = ctk.CTkEntry(
            login_frame, placeholder_text="Palavra-passe", show="*", width=320, height=38
        )
        self.password_entry.insert(0, "admin123")
        self.password_entry.pack(pady=6)
        
        url_label = ctk.CTkLabel(login_frame, text="URL da API (PythonAnywhere):", font=ctk.CTkFont(size=11), text_color="gray")
        url_label.pack(anchor="w", padx=62, pady=(6, 0))
        
        self.api_url_entry = ctk.CTkEntry(
            login_frame, placeholder_text="URL da API", width=320, height=32, font=ctk.CTkFont(size=11)
        )
        self.api_url_entry.insert(0, self.api.base_url)
        self.api_url_entry.pack(pady=(2, 10))
        
        self.login_status_lbl = ctk.CTkLabel(login_frame, text="", text_color="#ef4444", font=ctk.CTkFont(size=11))
        self.login_status_lbl.pack(pady=(0, 6))
        
        btn_login = ctk.CTkButton(
            login_frame,
            text="Entrar no Módulo Fibra",
            command=self.handle_login,
            width=320,
            height=40,
            font=ctk.CTkFont(size=13, weight="bold"),
            fg_color="#059669",
            hover_color="#047857"
        )
        btn_login.pack(pady=(4, 8))
        
        btn_test = ctk.CTkButton(
            login_frame,
            text="Testar Conexão",
            command=self.handle_test_conn,
            width=320,
            height=30,
            font=ctk.CTkFont(size=11),
            fg_color="transparent",
            border_width=1,
            text_color="#94a3b8"
        )
        btn_test.pack(pady=(0, 20))

    def handle_test_conn(self):
        new_url = self.api_url_entry.get().strip()
        self.api.set_base_url(new_url)
        is_ok = self.api.check_health()
        if is_ok:
            messagebox.showinfo("Conexão OK", f"API respondendo em:\n{self.api.base_url}")
        else:
            messagebox.showwarning("Aviso", f"Não foi possível conectar em:\n{self.api.base_url}")

    def handle_login(self):
        user = self.username_entry.get().strip()
        pwd = self.password_entry.get()
        new_url = self.api_url_entry.get().strip()
        
        if not user or not pwd:
            self.login_status_lbl.configure(text="Preencha o usuário e a palavra-passe.")
            return
            
        self.api.set_base_url(new_url)
        self.login_status_lbl.configure(text="Autenticando...", text_color="#34d399")
        self.update_idletasks()
        
        success, msg = self.api.login(user, pwd)
        if success:
            self.show_main_layout()
        else:
            self.login_status_lbl.configure(text=msg, text_color="#ef4444")

    # =========================================================================
    # LAYOUT PRINCIPAL (INTERNET FIBRA)
    # =========================================================================
    def show_main_layout(self):
        self.clear_root()
        
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Sidebar
        self.sidebar_frame = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, rowspan=2, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(7, weight=1)
        
        logo_label = ctk.CTkLabel(
            self.sidebar_frame, text="🌐 Gestão X · Fibra", font=ctk.CTkFont(size=17, weight="bold")
        )
        logo_label.grid(row=0, column=0, padx=16, pady=(18, 2), sticky="w")
        
        brand_sub = ctk.CTkLabel(
            self.sidebar_frame, text="Provedor de Internet Fibra", font=ctk.CTkFont(size=10, weight="bold"), text_color="#34d399"
        )
        brand_sub.grid(row=1, column=0, padx=16, pady=(0, 16), sticky="w")
        
        self.btn_nav_dash = ctk.CTkButton(
            self.sidebar_frame, text="📊 Resumo Fibra", anchor="w",
            command=self.nav_to_dashboard, height=36
        )
        self.btn_nav_dash.grid(row=2, column=0, padx=12, pady=4, sticky="ew")
        
        self.btn_nav_clients = ctk.CTkButton(
            self.sidebar_frame, text="👥 Assinantes Fibra", anchor="w",
            command=self.nav_to_clients, height=36
        )
        self.btn_nav_clients.grid(row=3, column=0, padx=12, pady=4, sticky="ew")

        self.btn_nav_invoices = ctk.CTkButton(
            self.sidebar_frame, text="💳 Mensalidades & Bloqueio", anchor="w",
            command=self.nav_to_invoices, height=36
        )
        self.btn_nav_invoices.grid(row=4, column=0, padx=12, pady=4, sticky="ew")

        btn_logout = ctk.CTkButton(
            self.sidebar_frame, text="🚪 Sair da Conta", anchor="w",
            command=self.handle_logout, fg_color="transparent", text_color="#f87171",
            hover_color="#450a0a", height=32
        )
        btn_logout.grid(row=8, column=0, padx=12, pady=16, sticky="ew")
        
        # Topbar
        self.topbar_frame = ctk.CTkFrame(self, height=50, corner_radius=0)
        self.topbar_frame.grid(row=0, column=1, sticky="ew")
        self.topbar_frame.grid_columnconfigure(1, weight=1)
        
        self.topbar_title = ctk.CTkLabel(
            self.topbar_frame, text="Operações de Internet Fibra Óptica", font=ctk.CTkFont(size=15, weight="bold")
        )
        self.topbar_title.grid(row=0, column=0, padx=18, pady=10, sticky="w")
        
        self.conn_pill = ctk.CTkLabel(
            self.topbar_frame, text="● Conectado", font=ctk.CTkFont(size=11, weight="bold"), text_color="#34d399"
        )
        self.conn_pill.grid(row=0, column=2, padx=10, pady=10)
        
        user_info = ctk.CTkLabel(
            self.topbar_frame, text=f"👤 {self.api.auth.get_user_name()}", font=ctk.CTkFont(size=11, weight="bold")
        )
        user_info.grid(row=0, column=3, padx=(6, 18), pady=10)
        
        # Content
        self.content_frame = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.content_frame.grid(row=1, column=1, sticky="nsew", padx=16, pady=16)
        
        self.nav_to_dashboard()

    def handle_logout(self):
        if messagebox.askyesno("Confirmar", "Deseja terminar a sessão?"):
            self.api.auth.clear_session()
            self.show_login_screen()

    # =========================================================================
    # DASHBOARD ESPECÍFICO DE FIBRA
    # =========================================================================
    def nav_to_dashboard(self):
        self.topbar_title.configure(text="Resumo Operacional · Internet Fibra (ISP)")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        dash_data, is_online = self.api.get_dashboard(service="fibra")
        self.conn_pill.configure(
            text="● Online" if is_online else "● Modo Offline (Cache)",
            text_color="#34d399" if is_online else "#facc15"
        )
        
        metrics = dash_data.get('metrics', {})
        clients_m = metrics.get('clients', {})
        fin_m = metrics.get('financial', {})
        
        cards = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        cards.pack(fill="x", pady=(0, 16))
        cards.grid_columnconfigure((0, 1, 2, 3), weight=1)
        
        def card(col, title, val, sub, color="#34d399"):
            c = ctk.CTkFrame(cards, corner_radius=10, height=100)
            c.grid(row=0, column=col, padx=5, pady=4, sticky="ew")
            ctk.CTkLabel(c, text=title, font=ctk.CTkFont(size=10), text_color="gray").pack(anchor="w", padx=12, pady=(10, 2))
            ctk.CTkLabel(c, text=str(val), font=ctk.CTkFont(size=20, weight="bold"), text_color=color).pack(anchor="w", padx=12)
            ctk.CTkLabel(c, text=sub, font=ctk.CTkFont(size=10), text_color="gray").pack(anchor="w", padx=12, pady=(2, 8))

        card(0, "ASSINANTES FIBRA ATIVOS", clients_m.get('active', 0), f"{clients_m.get('total', 0)} total de Fibra", "#34d399")
        card(1, "BLOQUEADOS / ATRASO", clients_m.get('late', 0), "Aguardando pagamento", "#f87171")
        card(2, "RECEITA FIBRA RECEBIDA", kz_format(fin_m.get('revenue_total_kz', 0)), f"{fin_m.get('invoices_paid_count', 0)} faturas pagas", "#38bdf8")
        card(3, "FIBRA A RECEBER", kz_format(fin_m.get('pending_total_kz', 0)), "Mensalidades em aberto", "#fbbf24")

        # Seção Informativa de Fibra
        info_card = ctk.CTkFrame(self.content_frame)
        info_card.pack(fill="both", expand=True)
        
        ctk.CTkLabel(info_card, text="Módulo Especializado: Provedor de Internet Fibra (ISP)", font=ctk.CTkFont(size=14, weight="bold")).pack(anchor="w", padx=16, pady=(14, 4))
        desc = (
            "Este executável foi otimizado exclusivamente para Provedores de Fibra Óptica:\n"
            "• Gestão técnica de Caixas PDO, Divisores Ópticos e Portas de Atendimento\n"
            "• Controle de números de série de ONU/ONT e equipamentos instalados\n"
            "• Faturamento de planos de internet fibra de alta velocidade (Ex: 10.000 Kz - 25.000 Kz)\n"
            "• Bloqueio lógico imediato por falta de pagamento"
        )
        ctk.CTkLabel(info_card, text=desc, justify="left", font=ctk.CTkFont(size=12), text_color="#cbd5e1").pack(anchor="w", padx=16, pady=4)
        
        btn_refresh = ctk.CTkButton(info_card, text="🔄 Atualizar Indicadores", command=self.nav_to_dashboard, width=160, fg_color="#059669")
        btn_refresh.pack(anchor="w", padx=16, pady=16)

    # =========================================================================
    # LISTA DE ASSINANTES DE FIBRA
    # =========================================================================
    def nav_to_clients(self):
        self.topbar_title.configure(text="Assinantes de Internet Fibra")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        bar = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        bar.pack(fill="x", pady=(0, 10))
        
        self.search_entry = ctk.CTkEntry(bar, placeholder_text="Pesquisar por nome, PDO ou ONU...", width=320, height=34)
        self.search_entry.pack(side="left", padx=(0, 8))
        
        btn_search = ctk.CTkButton(bar, text="🔍 Buscar", command=self.refresh_fibra_clients, width=80, height=34, fg_color="#059669")
        btn_search.pack(side="left", padx=(0, 8))
        
        btn_new = ctk.CTkButton(
            bar, text="➕ Novo Assinante Fibra", command=self.open_new_fibra_client,
            fg_color="#059669", hover_color="#047857", height=34
        )
        btn_new.pack(side="right")
        
        # Tabela Treeview
        tree_frame = ctk.CTkFrame(self.content_frame)
        tree_frame.pack(fill="both", expand=True)
        
        columns = ("code", "name", "phone", "pdo", "onu", "fee", "status")
        self.tree = ttk.Treeview(tree_frame, columns=columns, show="headings", height=15)
        
        self.tree.heading("code", text="Código")
        self.tree.heading("name", text="Nome do Assinante")
        self.tree.heading("phone", text="Telefone")
        self.tree.heading("pdo", text="Caixa PDO")
        self.tree.heading("onu", text="Serial ONU / ONT")
        self.tree.heading("fee", text="Plano Mensal")
        self.tree.heading("status", text="Status Conexão")
        
        self.tree.column("code", width=85, anchor="center")
        self.tree.column("name", width=220)
        self.tree.column("phone", width=120)
        self.tree.column("pdo", width=100, anchor="center")
        self.tree.column("onu", width=130, anchor="center")
        self.tree.column("fee", width=110, anchor="e")
        self.tree.column("status", width=95, anchor="center")
        
        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        scrollbar.pack(side="right", fill="y", padx=(0, 10), pady=10)
        
        actions_bar = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        actions_bar.pack(fill="x", pady=(10, 0))
        
        btn_edit = ctk.CTkButton(actions_bar, text="✏️ Editar Assinante", command=self.edit_selected_client, width=130)
        btn_edit.pack(side="left", padx=(0, 10))
        
        btn_del = ctk.CTkButton(actions_bar, text="🗑️ Excluir", command=self.delete_selected_client, fg_color="#ef4444", hover_color="#dc2626", width=100)
        btn_del.pack(side="left")
        
        self.refresh_fibra_clients()

    def refresh_fibra_clients(self):
        query = self.search_entry.get().strip() if hasattr(self, 'search_entry') else ""
        items, is_online = self.api.get_clients(search=query, service_type="fibra")
        self.fibra_clients = items or []
        
        for row in self.tree.get_children():
            self.tree.delete(row)
            
        for c in self.fibra_clients:
            status_txt = "Ativo" if c.get('status') == 'active' else ("Bloqueado" if c.get('status') == 'late' else c.get('status'))
            self.tree.insert("", "end", values=(
                c.get('code'),
                c.get('full_name'),
                c.get('phone'),
                c.get('pdo_number') or '-',
                c.get('onu_number') or '-',
                kz_format(c.get('monthly_fee', 8500)),
                status_txt
            ))

    def open_new_fibra_client(self):
        modal = ctk.CTkToplevel(self)
        modal.title("Cadastrar Assinante de Fibra Óptica")
        modal.geometry("480x540")
        modal.grab_set()
        
        ctk.CTkLabel(modal, text="Novo Assinante · Internet Fibra", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=(16, 12))
        
        e_name = ctk.CTkEntry(modal, placeholder_text="Nome Completo do Cliente *", width=380)
        e_name.pack(pady=6)
        
        e_phone = ctk.CTkEntry(modal, placeholder_text="Telefone Principal *", width=380)
        e_phone.pack(pady=6)
        
        e_pdo = ctk.CTkEntry(modal, placeholder_text="Caixa PDO / Porta (Ex: PDO-04 Porta 3)", width=380)
        e_pdo.pack(pady=6)
        
        e_onu = ctk.CTkEntry(modal, placeholder_text="Serial da ONU / Modelo (Ex: HW-8245-A1)", width=380)
        e_onu.pack(pady=6)
        
        e_neigh = ctk.CTkEntry(modal, placeholder_text="Bairro (Ex: Talatona, Palanca)", width=380)
        e_neigh.pack(pady=6)
        
        e_fee = ctk.CTkEntry(modal, placeholder_text="Mensalidade do Plano (Kz)", width=380)
        e_fee.insert(0, "12500")
        e_fee.pack(pady=6)
        
        def save():
            name = e_name.get().strip()
            phone = e_phone.get().strip()
            if not name or not phone:
                messagebox.showerror("Erro", "Nome e telefone são obrigatórios.")
                return
            payload = {
                'full_name': name,
                'phone': phone,
                'service_type': 'fibra',
                'pdo_number': e_pdo.get().strip(),
                'onu_number': e_onu.get().strip(),
                'neighborhood': e_neigh.get().strip(),
                'monthly_fee': float(e_fee.get() or 12500),
                'status': 'active'
            }
            ok, msg, created = self.api.create_client(payload)
            if ok:
                messagebox.showinfo("Sucesso", "Assinante de Fibra cadastrado!")
                modal.destroy()
                self.refresh_fibra_clients()
            else:
                messagebox.showerror("Erro", msg)
                
        ctk.CTkButton(modal, text="Salvar Assinante Fibra", command=save, fg_color="#059669", width=380, height=38).pack(pady=18)

    def edit_selected_client(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showwarning("Aviso", "Selecione um assinante na tabela.")
            return
        idx = self.tree.index(sel[0])
        client = self.fibra_clients[idx]
        
        modal = ctk.CTkToplevel(self)
        modal.title(f"Editar Assinante Fibra · {client.get('code')}")
        modal.geometry("480x520")
        modal.grab_set()
        
        ctk.CTkLabel(modal, text=f"Editar Assinante ({client.get('code')})", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=(16, 12))
        
        e_name = ctk.CTkEntry(modal, width=380)
        e_name.insert(0, client.get('full_name', ''))
        e_name.pack(pady=6)
        
        e_phone = ctk.CTkEntry(modal, width=380)
        e_phone.insert(0, client.get('phone', ''))
        e_phone.pack(pady=6)
        
        e_pdo = ctk.CTkEntry(modal, width=380)
        e_pdo.insert(0, client.get('pdo_number') or '')
        e_pdo.pack(pady=6)
        
        e_onu = ctk.CTkEntry(modal, width=380)
        e_onu.insert(0, client.get('onu_number') or '')
        e_onu.pack(pady=6)
        
        e_fee = ctk.CTkEntry(modal, width=380)
        e_fee.insert(0, str(client.get('monthly_fee', 12500)))
        e_fee.pack(pady=6)
        
        opt_status = ctk.CTkOptionMenu(modal, values=["active", "late", "suspended"], width=380)
        opt_status.set(client.get('status', 'active'))
        opt_status.pack(pady=6)
        
        def save():
            payload = {
                'full_name': e_name.get().strip(),
                'phone': e_phone.get().strip(),
                'service_type': 'fibra',
                'pdo_number': e_pdo.get().strip(),
                'onu_number': e_onu.get().strip(),
                'monthly_fee': float(e_fee.get() or 12500),
                'status': opt_status.get()
            }
            ok, msg, updated = self.api.update_client(client['id'], payload)
            if ok:
                messagebox.showinfo("Sucesso", "Dados atualizados!")
                modal.destroy()
                self.refresh_fibra_clients()
            else:
                messagebox.showerror("Erro", msg)
                
        ctk.CTkButton(modal, text="Salvar Alterações", command=save, fg_color="#059669", width=380, height=38).pack(pady=18)

    def delete_selected_client(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showwarning("Aviso", "Selecione um assinante na tabela.")
            return
        idx = self.tree.index(sel[0])
        client = self.fibra_clients[idx]
        if messagebox.askyesno("Confirmar Exclusão", f"Excluir assinante '{client.get('full_name')}'?"):
            ok, msg = self.api.delete_client(client['id'])
            if ok:
                messagebox.showinfo("Sucesso", msg)
                self.refresh_fibra_clients()
            else:
                messagebox.showerror("Erro", msg)

    # =========================================================================
    # FATURAS E COBRANÇA DE FIBRA
    # =========================================================================
    def nav_to_invoices(self):
        self.topbar_title.configure(text="Mensalidades de Internet & Bloqueio Lógico")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        invoices = self.api.get_invoices()
        
        fibra_ids = {c['id'] for c in self.fibra_clients} if self.fibra_clients else set()
        fibra_invoices = [inv for inv in invoices if not fibra_ids or inv.get('client_id') in fibra_ids]
        
        tree_frame = ctk.CTkFrame(self.content_frame)
        tree_frame.pack(fill="both", expand=True)
        
        columns = ("num", "client", "amount", "due", "status")
        tree = ttk.Treeview(tree_frame, columns=columns, show="headings", height=15)
        tree.heading("num", text="Fatura #")
        tree.heading("client", text="Assinante Fibra")
        tree.heading("amount", text="Valor Plano")
        tree.heading("due", text="Vencimento")
        tree.heading("status", text="Status do Pagamento")
        
        self.invoice_tree = tree
        for inv in fibra_invoices:
            self.invoice_tree.insert("", "end", values=(
                inv.get('number'),
                inv.get('client_name'),
                kz_format(inv.get('total')),
                inv.get('due_date') or '-',
                inv.get('status')
            ))
            
        self.invoice_tree.pack(fill="both", expand=True, padx=10, pady=10)

        # Barra de ações para impressão de Facturas Fibra
        actions_bar = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        actions_bar.pack(fill="x", pady=(10, 0))
        
        btn_print_pos = ctk.CTkButton(
            actions_bar, text="🧾 Imprimir Talão Térmico (POS 80mm)",
            command=lambda: self.print_invoice(fibra_invoices, format_type="pos"),
            fg_color="#059669", hover_color="#047857", width=250, height=34, font=ctk.CTkFont(size=12, weight="bold")
        )
        btn_print_pos.pack(side="left", padx=(0, 10))
        
        btn_print_a4 = ctk.CTkButton(
            actions_bar, text="📄 Imprimir Factura A4",
            command=lambda: self.print_invoice(fibra_invoices, format_type="a4"),
            fg_color="#334155", hover_color="#475569", width=180, height=34
        )
        btn_print_a4.pack(side="left")

    def print_invoice(self, invoices, format_type="pos"):
        import os, tempfile, webbrowser
        sel = self.invoice_tree.selection()
        if not sel:
            messagebox.showwarning("Aviso", "Selecione uma fatura na tabela para imprimir.")
            return
        idx = self.invoice_tree.index(sel[0])
        inv = invoices[idx]
        
        num = inv.get('number', 'FT-00000')
        client_name = inv.get('client_name', 'Consumidor Final')
        amount_kz = kz_format(inv.get('amount', 12500))
        total_kz = kz_format(inv.get('total', 12500))
        penalty_kz = kz_format(inv.get('penalty', 0))
        due = inv.get('due_date') or '--'
        status = inv.get('status', 'paga').upper()
        ref = inv.get('reference_code') or 'MCX-OSDEL-FIBRA'
        
        if format_type == "pos":
            # Formato Talão Térmico POS 80mm / 58mm (Alto Contraste)
            html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Talão Térmico - {num}</title>
<style>
@page {{ size: 80mm auto; margin: 2mm 3mm; }}
body {{ font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 4px; color: #000; width: 72mm; }}
.center {{ text-align: center; }}
.bold {{ font-weight: bold; }}
.line {{ border-bottom: 1px dashed #000; margin: 6px 0; }}
.row {{ display: flex; justify-content: space-between; }}
.total {{ font-size: 18px; font-weight: 900; text-align: right; margin: 4px 0; }}
</style>
</head>
<body onload="window.print()">
<div class="center">
  <div style="margin-bottom: 6px;">
    <svg width="46" height="46" viewBox="0 0 100 100" style="display:block; margin:0 auto;">
      <circle cx="50" cy="50" r="46" stroke="#000" stroke-width="6" fill="none" />
      <path d="M25 55 C25 40 40 25 50 25 C60 25 75 40 75 55" stroke="#000" stroke-width="6" fill="none"/>
      <path d="M35 62 C35 52 42 42 50 42 C58 42 65 52 65 62" stroke="#000" stroke-width="6" fill="none"/>
      <circle cx="50" cy="72" r="6" fill="#000"/>
    </svg>
  </div>
  <div class="bold" style="font-size: 14px;">OSDEL TECNOLOGIA</div>
  <div>PROVEDOR INTERNET FIBRA ÓPTICA</div>
  <div>NIF: 5417089214 · Tel: 923 000 000</div>
  <div>Luanda, Angola</div>
</div>
<div class="line"></div>
<div class="center">
  <div class="bold">FACTURA / RECIBO FIBRA</div>
  <div class="bold" style="font-size: 13px;">{num}</div>
  <div style="font-size: 9px;">Vencimento: {due}</div>
</div>
<div class="line"></div>
<div><b>ASSINANTE:</b> {client_name}</div>
<div><b>CÓDIGO:</b> CLI-{inv.get('client_id', 0):05d}</div>
<div><b>SERVIÇO:</b> Banda Larga FTTH Fibra</div>
<div><b>DOC:</b> Consumidor Final</div>
<div class="line"></div>
<div class="row bold"><span>PLANO / SERVIÇO</span><span>VALOR</span></div>
<div class="row"><span>Mensalidade Internet Fibra</span><span>{amount_kz}</span></div>
"""
            if inv.get('penalty', 0) > 0:
                html += f"""<div class="row"><span>Multa por Atraso</span><span>{penalty_kz}</span></div>"""
            html += f"""
<div class="line"></div>
<div style="text-align: right; font-size: 10px;">TOTAL LIQUIDADO:</div>
<div class="total">{total_kz}</div>
<div style="text-align: right; font-size: 9px;">ESTADO: {status}</div>
<div style="text-align: right; font-size: 9px;">REF: {ref}</div>
<div class="line"></div>
<div class="center" style="font-size: 9px;">
  <div><b>Obrigado pela preferência!</b></div>
  <div>Guarde este talão como garantia do sinal de Internet.</div>
  <div style="font-size: 8px; margin-top: 4px;">Gestão X · Provedor Fibra Standalone</div>
</div>
</body>
</html>"""
        else:
            # Formato A4 Oficial
            html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Factura A4 Fibra - {num}</title>
<style>
@page {{ size: A4; margin: 15mm; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; margin: 0; padding: 20px; color: #1e293b; }}
.header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }}
.title {{ font-size: 20px; font-weight: 900; color: #059669; }}
.box {{ background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 16px; }}
table {{ width: 100%; border-collapse: collapse; margin-bottom: 16px; }}
th {{ background: #f1f5f9; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; font-size: 11px; }}
td {{ padding: 8px; border-bottom: 1px solid #e2e8f0; }}
.total-box {{ background: #059669; color: white; padding: 12px 20px; border-radius: 6px; text-align: right; float: right; min-width: 220px; }}
</style>
</head>
<body onload="window.print()">
<div class="header">
  <div>
    <div class="title">OSDEL TECNOLOGIA</div>
    <div style="font-weight: bold; color: #047857;">PROVEDOR DE INTERNET FIBRA ÓPTICA (ISP)</div>
    <div style="color: #64748b; font-size: 11px;">NIF: 5417089214 · Tel: +244 923 000 000 · Luanda, Angola</div>
  </div>
  <div style="text-align: right;">
    <div style="background: #059669; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block;">FACTURA / RECIBO FIBRA</div>
    <div style="font-size: 18px; font-weight: bold; margin-top: 6px;">{num}</div>
    <div style="color: #64748b; font-size: 11px;">Vencimento: {due}</div>
  </div>
</div>

<div class="box">
  <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">Assinante Fibra: {client_name}</div>
  <div style="color: #475569;">Código: CLI-{inv.get('client_id', 0):05d} · Documento: Consumidor Final</div>
  <div style="color: #475569;">Estado: <b style="color: #059669;">{status}</b> · Referência: {ref}</div>
</div>

<table>
  <thead>
    <tr>
      <th>Descrição do Serviço / Artigo</th>
      <th style="text-align: center;">Qtd</th>
      <th style="text-align: right;">Preço Unit.</th>
      <th style="text-align: right;">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mensalidade de Acesso à Internet Banda Larga Fibra Óptica (FTTH)</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">{amount_kz}</td>
      <td style="text-align: right; font-weight: bold;">{amount_kz}</td>
    </tr>
  </tbody>
</table>

<div class="total-box">
  <div style="font-size: 11px; text-transform: uppercase;">Valor Total Liquidado</div>
  <div style="font-size: 24px; font-weight: 900; margin-top: 4px;">{total_kz}</div>
</div>
<div style="clear: both;"></div>

<div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center;">
  Documento processado por computador com validade de quitação fiscal interna · OSDEL TECNOLOGIA FIBRA
</div>
</body>
</html>"""

        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"fatura_fibra_{num}_{format_type}.html")
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(html)
        webbrowser.open(f"file://{temp_path}")

if __name__ == "__main__":
    app = GestaoXFibraApp()
    app.mainloop()
