"""
GESTÃO X · CLIENTE DESKTOP WINDOWS (CUSTOMTKINTER)
Integração com API REST Flask hospedada no PythonAnywhere
"""
import tkinter as tk
from tkinter import messagebox, ttk
import customtkinter as ctk
from config import DesktopConfig
from api_client import APIClient

ctk.set_appearance_mode(DesktopConfig.THEME_APPEARANCE)
ctk.set_default_color_theme(DesktopConfig.THEME_COLOR)

def kz_format(value):
    try:
        val = float(value or 0)
        return f"{val:,.0f} Kz".replace(",", ".")
    except Exception:
        return "0 Kz"

class GestaoXDesktopApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title(f"{DesktopConfig.APP_NAME} v{DesktopConfig.APP_VERSION}")
        self.geometry(f"{DesktopConfig.WINDOW_WIDTH}x{DesktopConfig.WINDOW_HEIGHT}")
        self.minsize(980, 640)
        
        # Cliente de API e Sessão
        self.api = APIClient()
        self.current_screen = None
        
        # Inicia com a tela de login ou dashboard
        if self.api.auth.is_authenticated():
            self.show_main_layout()
        else:
            self.show_login_screen()

    def clear_root(self):
        for widget in self.winfo_children():
            widget.destroy()

    # =========================================================================
    # TELA DE LOGIN
    # =========================================================================
    def show_login_screen(self):
        self.clear_root()
        
        # Container centralizado de login
        login_frame = ctk.CTkFrame(self, corner_radius=18, width=440, height=540)
        login_frame.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
        # Logo / Título
        title_badge = ctk.CTkLabel(
            login_frame,
            text="GX",
            font=ctk.CTkFont(size=28, weight="bold"),
            width=64,
            height=64,
            corner_radius=14,
            fg_color="#1e293b",
            text_color="#38bdf8"
        )
        title_badge.pack(pady=(35, 10))
        
        app_title = ctk.CTkLabel(
            login_frame,
            text="Gestão X · Desktop",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        app_title.pack(pady=(0, 2))
        
        app_sub = ctk.CTkLabel(
            login_frame,
            text="Conexão com API PythonAnywhere",
            font=ctk.CTkFont(size=12),
            text_color="gray"
        )
        app_sub.pack(pady=(0, 25))
        
        # Campo Usuário
        self.username_entry = ctk.CTkEntry(
            login_frame,
            placeholder_text="Nome de usuário (ex: admin)",
            width=320,
            height=40
        )
        self.username_entry.insert(0, "admin")
        self.username_entry.pack(pady=8)
        
        # Campo Senha
        self.password_entry = ctk.CTkEntry(
            login_frame,
            placeholder_text="Palavra-passe",
            show="*",
            width=320,
            height=40
        )
        self.password_entry.insert(0, "admin123")
        self.password_entry.pack(pady=8)
        
        # Campo URL da API
        url_label = ctk.CTkLabel(login_frame, text="Endereço da API:", font=ctk.CTkFont(size=11), text_color="gray")
        url_label.pack(anchor="w", padx=62, pady=(8, 0))
        
        self.api_url_entry = ctk.CTkEntry(
            login_frame,
            placeholder_text="URL da API (ex: https://seu_usuario.pythonanywhere.com)",
            width=320,
            height=34,
            font=ctk.CTkFont(size=11)
        )
        self.api_url_entry.insert(0, self.api.base_url)
        self.api_url_entry.pack(pady=(2, 10))
        
        # Status / Erro
        self.login_status_lbl = ctk.CTkLabel(login_frame, text="", text_color="#ef4444", font=ctk.CTkFont(size=12))
        self.login_status_lbl.pack(pady=(0, 8))
        
        # Botão Entrar
        btn_login = ctk.CTkButton(
            login_frame,
            text="Entrar no Sistema",
            command=self.handle_login,
            width=320,
            height=42,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color="#0284c7",
            hover_color="#0369a1"
        )
        btn_login.pack(pady=(5, 10))
        
        # Botão Testar Conexão
        btn_test = ctk.CTkButton(
            login_frame,
            text="Testar Conexão com API",
            command=self.handle_test_connection,
            width=320,
            height=32,
            font=ctk.CTkFont(size=12),
            fg_color="transparent",
            border_width=1,
            text_color="#94a3b8"
        )
        btn_test.pack(pady=(0, 20))

    def handle_test_connection(self):
        new_url = self.api_url_entry.get().strip()
        self.api.set_base_url(new_url)
        is_ok = self.api.check_health()
        if is_ok:
            messagebox.showinfo("Conexão OK", f"API respondendo perfeitamente em:\n{self.api.base_url}")
        else:
            messagebox.showwarning("Aviso de Conexão", f"Não foi possível contactar a API em:\n{self.api.base_url}\n\nVerifique se o servidor está ativo no PythonAnywhere.")

    def handle_login(self):
        user = self.username_entry.get().strip()
        pwd = self.password_entry.get()
        new_url = self.api_url_entry.get().strip()
        
        if not user or not pwd:
            self.login_status_lbl.configure(text="Preencha o usuário e senha.")
            return
            
        self.api.set_base_url(new_url)
        self.login_status_lbl.configure(text="Autenticando via API...", text_color="#38bdf8")
        self.update_idletasks()
        
        success, msg = self.api.login(user, pwd)
        if success:
            self.show_main_layout()
        else:
            self.login_status_lbl.configure(text=msg, text_color="#ef4444")

    # =========================================================================
    # LAYOUT PRINCIPAL (SIDEBAR + TOPBAR + CONTENT)
    # =========================================================================
    def show_main_layout(self):
        self.clear_root()
        
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # 1. SIDEBAR
        self.sidebar_frame = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, rowspan=2, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(7, weight=1)
        
        # Logo Sidebar
        logo_label = ctk.CTkLabel(
            self.sidebar_frame,
            text="Gestão X",
            font=ctk.CTkFont(size=20, weight="bold")
        )
        logo_label.grid(row=0, column=0, padx=20, pady=(20, 4), sticky="w")
        
        brand_sub = ctk.CTkLabel(
            self.sidebar_frame,
            text="OSDEL TECNOLOGIA",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color="gray"
        )
        brand_sub.grid(row=1, column=0, padx=20, pady=(0, 20), sticky="w")
        
        # Botões de Navegação
        self.btn_nav_dash = ctk.CTkButton(
            self.sidebar_frame, text="📊 Dashboard", anchor="w",
            command=self.nav_to_dashboard, height=36
        )
        self.btn_nav_dash.grid(row=2, column=0, padx=14, pady=5, sticky="ew")
        
        self.btn_nav_clients = ctk.CTkButton(
            self.sidebar_frame, text="👥 Clientes", anchor="w",
            command=self.nav_to_clients, height=36
        )
        self.btn_nav_clients.grid(row=3, column=0, padx=14, pady=5, sticky="ew")

        self.btn_nav_budgets = ctk.CTkButton(
            self.sidebar_frame, text="📝 Orçamentos", anchor="w",
            command=self.nav_to_budgets, height=36
        )
        self.btn_nav_budgets.grid(row=4, column=0, padx=14, pady=5, sticky="ew")

        self.btn_nav_invoices = ctk.CTkButton(
            self.sidebar_frame, text="💳 Faturas & Pagamentos", anchor="w",
            command=self.nav_to_invoices, height=36
        )
        self.btn_nav_invoices.grid(row=5, column=0, padx=14, pady=5, sticky="ew")
        
        # Botão Sair no rodapé da sidebar
        btn_logout = ctk.CTkButton(
            self.sidebar_frame, text="🚪 Terminar Sessão", anchor="w",
            command=self.handle_logout, fg_color="transparent", text_color="#f87171",
            hover_color="#450a0a", height=34
        )
        btn_logout.grid(row=8, column=0, padx=14, pady=16, sticky="ew")
        
        # 2. TOPBAR
        self.topbar_frame = ctk.CTkFrame(self, height=55, corner_radius=0)
        self.topbar_frame.grid(row=0, column=1, sticky="ew")
        self.topbar_frame.grid_columnconfigure(1, weight=1)
        
        self.topbar_title = ctk.CTkLabel(
            self.topbar_frame,
            text="Visão Geral · Dashboard",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        self.topbar_title.grid(row=0, column=0, padx=20, pady=12, sticky="w")
        
        # Status Pill da Conexão
        self.conn_pill = ctk.CTkLabel(
            self.topbar_frame,
            text="● Online (API Conectada)",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#4ade80"
        )
        self.conn_pill.grid(row=0, column=2, padx=10, pady=12)
        
        user_info = ctk.CTkLabel(
            self.topbar_frame,
            text=f"👤 {self.api.auth.get_user_name()}",
            font=ctk.CTkFont(size=12, weight="bold")
        )
        user_info.grid(row=0, column=3, padx=(10, 20), pady=12)
        
        # 3. CONTAINER DE CONTEÚDO
        self.content_frame = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.content_frame.grid(row=1, column=1, sticky="nsew", padx=20, pady=20)
        
        # Inicia no dashboard
        self.nav_to_dashboard()

    def update_connection_pill(self, is_online):
        if is_online:
            self.conn_pill.configure(text="● Online (API Conectada)", text_color="#4ade80")
        else:
            self.conn_pill.configure(text="● Offline (Modo Cache Local)", text_color="#facc15")

    def handle_logout(self):
        if messagebox.askyesno("Confirmar", "Deseja realmente terminar a sessão?"):
            self.api.auth.clear_session()
            self.show_login_screen()

    # =========================================================================
    # TELAS DE NAVEGAÇÃO
    # =========================================================================
    def nav_to_dashboard(self):
        self.topbar_title.configure(text="Visão Geral · Dashboard")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        dash_data, is_online = self.api.get_dashboard()
        self.update_connection_pill(is_online)
        
        metrics = dash_data.get('metrics', {})
        clients_m = metrics.get('clients', {})
        fin_m = metrics.get('financial', {})
        
        # Grid de cartões de métricas
        cards_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        cards_frame.pack(fill="x", pady=(0, 20))
        cards_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)
        
        def make_card(parent, col, title, value, subtext, color="#38bdf8"):
            card = ctk.CTkFrame(parent, corner_radius=12, height=110)
            card.grid(row=0, column=col, padx=6, pady=4, sticky="ew")
            ctk.CTkLabel(card, text=title, font=ctk.CTkFont(size=11), text_color="gray").pack(anchor="w", padx=14, pady=(12, 2))
            ctk.CTkLabel(card, text=str(value), font=ctk.CTkFont(size=22, weight="bold"), text_color=color).pack(anchor="w", padx=14)
            ctk.CTkLabel(card, text=subtext, font=ctk.CTkFont(size=10), text_color="gray").pack(anchor="w", padx=14, pady=(2, 10))

        make_card(cards_frame, 0, "CLIENTES ACTIVOS", clients_m.get('active', 0), f"{clients_m.get('total', 0)} total cadastrados", "#4ade80")
        make_card(cards_frame, 1, "EM ATRASO / CORTE", clients_m.get('late', 0), "Sinal pendente", "#f87171")
        make_card(cards_frame, 2, "RECEITA LIQUIDADA", kz_format(fin_m.get('revenue_total_kz', 0)), f"{fin_m.get('invoices_paid_count', 0)} faturas pagas", "#38bdf8")
        make_card(cards_frame, 3, "PENDENTE COBRANÇA", kz_format(fin_m.get('pending_total_kz', 0)), "A receber este mês", "#fbbf24")

        # Seção inferior com ações rápidas e dados recentes
        bottom_frame = ctk.CTkFrame(self.content_frame)
        bottom_frame.pack(fill="both", expand=True)
        
        ctk.CTkLabel(
            bottom_frame,
            text="Sincronização com o PythonAnywhere",
            font=ctk.CTkFont(size=14, weight="bold")
        ).pack(anchor="w", padx=16, pady=(14, 4))
        
        info_text = f"Servidor API: {self.api.base_url}\nBanco de Dados: SQLite (gestaox.db)\nModo Operacional: {'100% Conectado' if is_online else 'Cache Local Ativo (Offline)'}"
        ctk.CTkLabel(bottom_frame, text=info_text, justify="left", font=ctk.CTkFont(size=12), text_color="gray").pack(anchor="w", padx=16, pady=4)
        
        btn_refresh = ctk.CTkButton(
            bottom_frame,
            text="🔄 Atualizar Dados Agora",
            command=self.nav_to_dashboard,
            width=160
        )
        btn_refresh.pack(anchor="w", padx=16, pady=14)

    # -------------------------------------------------------------------------
    # TELA DE CLIENTES (CRUD COMPLETO)
    # -------------------------------------------------------------------------
    def nav_to_clients(self):
        self.topbar_title.configure(text="Gestão de Clientes · TV e Fibra")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        # Barra superior de filtros e busca
        filter_bar = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        filter_bar.pack(fill="x", pady=(0, 10))
        
        self.client_search_entry = ctk.CTkEntry(filter_bar, placeholder_text="Pesquisar por nome, telefone ou código...", width=320, height=36)
        self.client_search_entry.pack(side="left", padx=(0, 8))
        
        btn_search = ctk.CTkButton(filter_bar, text="🔍 Buscar", command=self.load_clients_table, width=80, height=36)
        btn_search.pack(side="left", padx=(0, 8))
        
        btn_new_client = ctk.CTkButton(
            filter_bar,
            text="+ Novo Cliente",
            command=self.open_new_client_modal,
            fg_color="#059669",
            hover_color="#047857",
            height=36,
            font=ctk.CTkFont(weight="bold")
        )
        btn_new_client.pack(side="right")
        
        # Container da lista de clientes com scroll
        self.clients_table_frame = ctk.CTkScrollableFrame(self.content_frame)
        self.clients_table_frame.pack(fill="both", expand=True)
        
        self.load_clients_table()

    def load_clients_table(self):
        for w in self.clients_table_frame.winfo_children():
            w.destroy()
            
        search_query = self.client_search_entry.get().strip() if hasattr(self, 'client_search_entry') else ""
        clients, is_online = self.api.get_clients(search=search_query)
        self.update_connection_pill(is_online)
        
        if not clients:
            ctk.CTkLabel(self.clients_table_frame, text="Nenhum cliente encontrado.", font=ctk.CTkFont(size=14), text_color="gray").pack(pady=40)
            return

        # Cabeçalho da tabela
        header = ctk.CTkFrame(self.clients_table_frame, height=34, fg_color="#1e293b")
        header.pack(fill="x", pady=(0, 4))
        header.grid_columnconfigure((0, 1, 2, 3, 4, 5), weight=1)
        
        cols = ["Código", "Nome Completo", "Telefone", "Modalidade", "Status", "Ações"]
        for idx, col in enumerate(cols):
            ctk.CTkLabel(header, text=col, font=ctk.CTkFont(size=11, weight="bold"), text_color="#94a3b8").grid(row=0, column=idx, padx=8, pady=6, sticky="w")

        # Linhas de clientes
        for c in clients:
            row = ctk.CTkFrame(self.clients_table_frame, height=44)
            row.pack(fill="x", pady=2)
            row.grid_columnconfigure((0, 1, 2, 3, 4, 5), weight=1)
            
            ctk.CTkLabel(row, text=c.get('code', '—'), font=ctk.CTkFont(size=12, weight="bold")).grid(row=0, column=0, padx=8, pady=8, sticky="w")
            ctk.CTkLabel(row, text=c.get('full_name', '—'), font=ctk.CTkFont(size=12)).grid(row=0, column=1, padx=8, pady=8, sticky="w")
            ctk.CTkLabel(row, text=c.get('phone', '—'), font=ctk.CTkFont(size=11)).grid(row=0, column=2, padx=8, pady=8, sticky="w")
            
            srv = c.get('service_type', 'combo').upper()
            ctk.CTkLabel(row, text=srv, font=ctk.CTkFont(size=11)).grid(row=0, column=3, padx=8, pady=8, sticky="w")
            
            st = c.get('status', 'active')
            st_color = "#4ade80" if st == 'active' else "#f87171" if st == 'late' else "gray"
            ctk.CTkLabel(row, text=st.upper(), font=ctk.CTkFont(size=10, weight="bold"), text_color=st_color).grid(row=0, column=4, padx=8, pady=8, sticky="w")
            
            # Botões de Ação
            actions = ctk.CTkFrame(row, fg_color="transparent")
            actions.grid(row=0, column=5, padx=8, pady=4, sticky="e")
            
            client_id = c.get('id')
            btn_edit = ctk.CTkButton(actions, text="✏️ Editar", width=64, height=26, font=ctk.CTkFont(size=10), command=lambda cid=client_id, cdict=c: self.open_edit_client_modal(cid, cdict))
            btn_edit.pack(side="left", padx=2)
            
            btn_del = ctk.CTkButton(actions, text="🗑️", width=30, height=26, fg_color="#ef4444", hover_color="#dc2626", font=ctk.CTkFont(size=10), command=lambda cid=client_id, name=c.get('full_name'): self.handle_delete_client(cid, name))
            btn_del.pack(side="left", padx=2)

    def open_new_client_modal(self):
        modal = ctk.CTkToplevel(self)
        modal.title("Cadastrar Novo Cliente")
        modal.geometry("480x560")
        modal.grab_set()
        
        ctk.CTkLabel(modal, text="Novo Cliente", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(16, 12))
        
        name_entry = ctk.CTkEntry(modal, placeholder_text="Nome Completo *", width=380, height=36)
        name_entry.pack(pady=6)
        
        phone_entry = ctk.CTkEntry(modal, placeholder_text="Telefone (+244...) *", width=380, height=36)
        phone_entry.pack(pady=6)
        
        addr_entry = ctk.CTkEntry(modal, placeholder_text="Endereço / Bairro", width=380, height=36)
        addr_entry.pack(pady=6)
        
        fee_entry = ctk.CTkEntry(modal, placeholder_text="Mensalidade em Kwanzas (ex: 4000)", width=380, height=36)
        fee_entry.insert(0, "4000")
        fee_entry.pack(pady=6)
        
        srv_var = ctk.StringVar(value="combo")
        srv_menu = ctk.CTkOptionMenu(modal, values=["tv", "fibra", "combo"], variable=srv_var, width=380, height=36)
        srv_menu.pack(pady=6)
        
        def save():
            name = name_entry.get().strip()
            phone = phone_entry.get().strip()
            if not name or not phone:
                messagebox.showerror("Erro", "Nome e Telefone são obrigatórios.")
                return
            data = {
                'full_name': name,
                'phone': phone,
                'address': addr_entry.get().strip(),
                'monthly_fee': float(fee_entry.get() or 4000),
                'service_type': srv_var.get(),
                'status': 'active'
            }
            ok, msg, _ = self.api.create_client(data)
            if ok:
                modal.destroy()
                self.load_clients_table()
                messagebox.showinfo("Sucesso", "Cliente cadastrado com sucesso via API!")
            else:
                messagebox.showerror("Erro", msg)

        btn_save = ctk.CTkButton(modal, text="Salvar Cliente", command=save, width=380, height=40, fg_color="#059669")
        btn_save.pack(pady=20)

    def open_edit_client_modal(self, client_id, cdict):
        modal = ctk.CTkToplevel(self)
        modal.title("Editar Cliente")
        modal.geometry("480x560")
        modal.grab_set()
        
        ctk.CTkLabel(modal, text=f"Editar: {cdict.get('code')}", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(16, 12))
        
        name_entry = ctk.CTkEntry(modal, width=380, height=36)
        name_entry.insert(0, cdict.get('full_name', ''))
        name_entry.pack(pady=6)
        
        phone_entry = ctk.CTkEntry(modal, width=380, height=36)
        phone_entry.insert(0, cdict.get('phone', ''))
        phone_entry.pack(pady=6)
        
        addr_entry = ctk.CTkEntry(modal, width=380, height=36)
        addr_entry.insert(0, cdict.get('address', '') or '')
        addr_entry.pack(pady=6)
        
        fee_entry = ctk.CTkEntry(modal, width=380, height=36)
        fee_entry.insert(0, str(cdict.get('monthly_fee', 4000)))
        fee_entry.pack(pady=6)
        
        status_var = ctk.StringVar(value=cdict.get('status', 'active'))
        status_menu = ctk.CTkOptionMenu(modal, values=["active", "late", "suspended", "inactive"], variable=status_var, width=380, height=36)
        status_menu.pack(pady=6)
        
        def update():
            data = {
                'full_name': name_entry.get().strip(),
                'phone': phone_entry.get().strip(),
                'address': addr_entry.get().strip(),
                'monthly_fee': float(fee_entry.get() or 4000),
                'status': status_var.get()
            }
            ok, msg, _ = self.api.update_client(client_id, data)
            if ok:
                modal.destroy()
                self.load_clients_table()
                messagebox.showinfo("Sucesso", "Cliente atualizado com sucesso via API!")
            else:
                messagebox.showerror("Erro", msg)

        btn_update = ctk.CTkButton(modal, text="Atualizar Cliente", command=update, width=380, height=40)
        btn_update.pack(pady=20)

    def handle_delete_client(self, client_id, client_name):
        if messagebox.askyesno("Confirmar Exclusão", f"Tem certeza que deseja excluir o cliente '{client_name}'?"):
            ok, msg = self.api.delete_client(client_id)
            if ok:
                self.load_clients_table()
                messagebox.showinfo("Sucesso", msg)
            else:
                messagebox.showerror("Erro", msg)

    # -------------------------------------------------------------------------
    # TELAS ADICIONAIS: ORÇAMENTOS E FATURAS
    # -------------------------------------------------------------------------
    def nav_to_budgets(self):
        self.topbar_title.configure(text="Orçamentos · Instalações e Serviços")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        budgets = self.api.get_budgets()
        scroll = ctk.CTkScrollableFrame(self.content_frame)
        scroll.pack(fill="both", expand=True)
        
        if not budgets:
            ctk.CTkLabel(scroll, text="Nenhum orçamento cadastrado.", text_color="gray").pack(pady=30)
            return
            
        for b in budgets:
            card = ctk.CTkFrame(scroll)
            card.pack(fill="x", pady=4, padx=6)
            ctk.CTkLabel(card, text=f"{b.get('number')} · {b.get('client_name')}", font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", padx=12, pady=(8, 2))
            ctk.CTkLabel(card, text=f"{b.get('description')} | Total: {kz_format(b.get('final_amount'))} | Status: {b.get('status').upper()}", text_color="gray", font=ctk.CTkFont(size=11)).pack(anchor="w", padx=12, pady=(0, 8))

    def nav_to_invoices(self):
        self.topbar_title.configure(text="Faturas & Mensalidades")
        for widget in self.content_frame.winfo_children():
            widget.destroy()
            
        invoices = self.api.get_invoices()
        scroll = ctk.CTkScrollableFrame(self.content_frame)
        scroll.pack(fill="both", expand=True)
        
        if not invoices:
            ctk.CTkLabel(scroll, text="Nenhuma fatura registrada.", text_color="gray").pack(pady=30)
            return
            
        for inv in invoices:
            card = ctk.CTkFrame(scroll)
            card.pack(fill="x", pady=4, padx=6)
            color = "#4ade80" if inv.get('status') == 'paga' else "#f87171"
            ctk.CTkLabel(card, text=f"{inv.get('number')} · {inv.get('client_name')}", font=ctk.CTkFont(size=13, weight="bold")).pack(anchor="w", padx=12, pady=(8, 2))
            ctk.CTkLabel(card, text=f"Valor: {kz_format(inv.get('total'))} | Vencimento: {inv.get('due_date')} | Status: {inv.get('status').upper()}", text_color=color, font=ctk.CTkFont(size=11, weight="bold")).pack(anchor="w", padx=12, pady=(0, 8))

if __name__ == "__main__":
    app = GestaoXDesktopApp()
    app.mainloop()
