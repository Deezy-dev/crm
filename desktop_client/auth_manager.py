import json
import os
from config import DesktopConfig

AUTH_CACHE_FILE = os.path.join(DesktopConfig.BASE_DIR, ".auth_session.json")

class AuthManager:
    def __init__(self):
        self.access_token = None
        self.refresh_token = None
        self.current_user = None
        self.load_session()
        
    def save_tokens(self, access_token, refresh_token, user_data):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.current_user = user_data
        
        try:
            with open(AUTH_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': user_data
                }, f)
        except Exception as e:
            print(f"[AuthManager] Aviso: Não foi possível salvar sessão: {e}")
            
    def update_access_token(self, new_access_token):
        self.access_token = new_access_token
        self.save_tokens(new_access_token, self.refresh_token, self.current_user)
        
    def load_session(self):
        if os.path.exists(AUTH_CACHE_FILE):
            try:
                with open(AUTH_CACHE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.access_token = data.get('access_token')
                    self.refresh_token = data.get('refresh_token')
                    self.current_user = data.get('user')
            except Exception:
                self.clear_session()
                
    def clear_session(self):
        self.access_token = None
        self.refresh_token = None
        self.current_user = None
        if os.path.exists(AUTH_CACHE_FILE):
            try:
                os.remove(AUTH_CACHE_FILE)
            except Exception:
                pass
                
    def is_authenticated(self):
        return bool(self.access_token and self.current_user)
        
    def get_user_name(self):
        if self.current_user:
            return self.current_user.get('full_name') or self.current_user.get('username')
        return "Convidado"
        
    def get_user_role(self):
        if self.current_user:
            return self.current_user.get('role', 'operador')
        return "operador"
