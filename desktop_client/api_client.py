import requests
from config import DesktopConfig
from auth_manager import AuthManager
from offline_cache import OfflineCache

class APIClient:
    def __init__(self, base_url=None):
        self.base_url = (base_url or DesktopConfig.DEFAULT_API_URL).rstrip('/')
        self.auth = AuthManager()
        self.cache = OfflineCache()
        self.session = requests.Session()
        self.timeout = DesktopConfig.REQUEST_TIMEOUT
        self.last_online_status = True
        
    def set_base_url(self, url):
        self.base_url = url.rstrip('/')
        
    def _get_headers(self, require_auth=True):
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        if require_auth and self.auth.access_token:
            headers['Authorization'] = f"Bearer {self.auth.access_token}"
        return headers

    def _handle_response(self, response):
        if response.status_code == 401 and self.auth.refresh_token:
            # Token expirado: tenta refresh automático
            if self.refresh_access_token():
                return None  # Sinaliza para retentar a requisição
        try:
            return response.json()
        except Exception:
            return {'success': False, 'message': response.text}

    def check_health(self):
        """Verifica se a API no PythonAnywhere está acessível"""
        try:
            res = self.session.get(f"{self.base_url}/api/v1/health", timeout=4)
            self.last_online_status = (res.status_code == 200)
            return self.last_online_status
        except Exception:
            self.last_online_status = False
            return False

    def login(self, username, password):
        """Autentica na API e armazena os tokens JWT"""
        try:
            res = self.session.post(
                f"{self.base_url}/api/v1/auth/login",
                json={'username': username, 'password': password},
                headers=self._get_headers(require_auth=False),
                timeout=self.timeout
            )
            data = res.json()
            if res.status_code == 200 and data.get('success'):
                self.auth.save_tokens(
                    access_token=data.get('access_token'),
                    refresh_token=data.get('refresh_token'),
                    user_data=data.get('user')
                )
                self.last_online_status = True
                return True, data.get('message', 'Login efetuado!')
            return False, data.get('message', 'Credenciais inválidas.')
        except requests.exceptions.ConnectionError:
            self.last_online_status = False
            return False, "Erro de conexão: Não foi possível conectar ao servidor da API."
        except requests.exceptions.Timeout:
            self.last_online_status = False
            return False, "Tempo de resposta esgotado (Timeout)."
        except Exception as e:
            return False, f"Erro inesperado: {str(e)}"

    def refresh_access_token(self):
        """Renova o access_token usando o refresh_token"""
        if not self.auth.refresh_token:
            return False
        try:
            headers = {
                'Authorization': f"Bearer {self.auth.refresh_token}",
                'Content-Type': 'application/json'
            }
            res = self.session.post(
                f"{self.base_url}/api/v1/auth/refresh",
                headers=headers,
                timeout=self.timeout
            )
            if res.status_code == 200:
                data = res.json()
                new_token = data.get('access_token')
                if new_token:
                    self.auth.update_access_token(new_token)
                    return True
        except Exception:
            pass
        return False

    def get_dashboard(self):
        """Obtém resumo do dashboard (com fallback offline)"""
        try:
            res = self.session.get(
                f"{self.base_url}/api/v1/dashboard/summary",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            if res.status_code == 200:
                data = res.json()
                self.cache.save_dashboard(data)
                self.last_online_status = True
                return data, True
        except Exception:
            self.last_online_status = False
            
        # Fallback offline
        cached = self.cache.get_dashboard()
        if cached:
            return cached, False
        return {'success': False, 'metrics': {'clients': {'total': 0, 'active': 0}, 'financial': {'revenue_total_kz': 0}}}, False

    def get_clients(self, search="", status="todos", service_type="todos"):
        """Lista clientes (com fallback offline)"""
        params = {}
        if search:
            params['search'] = search
        if status and status != 'todos':
            params['status'] = status
        if service_type and service_type != 'todos':
            params['service_type'] = service_type
            
        try:
            res = self.session.get(
                f"{self.base_url}/api/v1/clients",
                params=params,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            if res.status_code == 200:
                data = res.json()
                items = data.get('items', [])
                if not search:
                    self.cache.save_clients(items)
                self.last_online_status = True
                return items, True
        except Exception:
            self.last_online_status = False
            
        # Fallback offline
        cached_items = self.cache.get_clients(search=search)
        return cached_items, False

    def create_client(self, client_data):
        """Cadastra cliente na API"""
        try:
            res = self.session.post(
                f"{self.base_url}/api/v1/clients",
                json=client_data,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            data = res.json()
            if res.status_code == 201:
                created = data.get('client')
                if created:
                    self.cache.save_single_client(created)
                return True, data.get('message', 'Cliente criado!'), created
            return False, data.get('message', 'Erro ao cadastrar.'), None
        except Exception as e:
            return False, f"Erro de conexão com a API: {str(e)}", None

    def update_client(self, client_id, client_data):
        """Atualiza cliente na API"""
        try:
            res = self.session.put(
                f"{self.base_url}/api/v1/clients/{client_id}",
                json=client_data,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            data = res.json()
            if res.status_code == 200:
                updated = data.get('client')
                if updated:
                    self.cache.save_single_client(updated)
                return True, data.get('message', 'Cliente atualizado!'), updated
            return False, data.get('message', 'Erro ao atualizar.'), None
        except Exception as e:
            return False, f"Erro de conexão com a API: {str(e)}", None

    def delete_client(self, client_id):
        """Exclui cliente na API"""
        try:
            res = self.session.delete(
                f"{self.base_url}/api/v1/clients/{client_id}",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            data = res.json()
            if res.status_code == 200:
                self.cache.delete_client(client_id)
                return True, data.get('message', 'Cliente excluído!')
            return False, data.get('message', 'Erro ao excluir.')
        except Exception as e:
            return False, f"Erro de conexão com a API: {str(e)}"

    def get_budgets(self):
        try:
            res = self.session.get(
                f"{self.base_url}/api/v1/budgets",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            if res.status_code == 200:
                return res.json().get('items', [])
        except Exception:
            pass
        return []

    def get_invoices(self):
        try:
            res = self.session.get(
                f"{self.base_url}/api/v1/invoices",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            if res.status_code == 200:
                return res.json().get('items', [])
        except Exception:
            pass
        return []
