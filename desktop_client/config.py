import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class DesktopConfig:
    APP_NAME = "Gestão X · Desktop"
    APP_VERSION = "1.0.0"
    
    # URL Padrão da API (pode ser o PythonAnywhere ou servidor local)
    # Exemplo PythonAnywhere: "https://seu_usuario.pythonanywhere.com"
    DEFAULT_API_URL = os.getenv("API_URL", "http://127.0.0.1:5000")
    
    # Timeout para requisições em segundos
    REQUEST_TIMEOUT = 10
    
    # Caminho do banco SQLite de cache local (para suporte offline resiliente)
    CACHE_DB_PATH = os.path.join(BASE_DIR, "local_cache.db")
    
    # Configurações visuais CustomTkinter
    THEME_APPEARANCE = "Dark"  # "System", "Dark", "Light"
    THEME_COLOR = "blue"      # "blue", "green", "dark-blue"
    
    # Janela padrão
    WINDOW_WIDTH = 1180
    WINDOW_HEIGHT = 720
