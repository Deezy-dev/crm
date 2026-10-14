"""
ARQUIVO DE CONFIGURAÇÃO WSGI PARA PYTHONANYWHERE (PLANO GRATUITO)
==================================================================
No painel do PythonAnywhere:
1. Vá até a aba 'Web'
2. Clique no link do seu arquivo WSGI: /var/www/<seu-usuario>_pythonanywhere_com_wsgi.py
3. Apague o conteúdo existente e cole o código abaixo
4. Substitua 'SEU_USUARIO' pelo seu nome de usuário do PythonAnywhere
"""

import sys
import os

# Caminho do projeto no PythonAnywhere
# Exemplo: /home/albertombuyizola/gestaox-api
project_home = '/home/SEU_USUARIO/gestaox-api'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Configuração de variáveis de ambiente seguras
os.environ['SECRET_KEY'] = 'gestaox-producao-super-segura-2026'
os.environ['JWT_SECRET_KEY'] = 'gestaox-jwt-producao-super-segura-2026'
os.environ['DATABASE_URL'] = f'sqlite:///{project_home}/gestaox.db'

# Importa a aplicação Flask
from app import app as application
