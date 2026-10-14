# GUIA COMPLETO DE DEPLOY NO PYTHONANYWHERE (PLANO GRATUITO)
============================================================

Este guia passo a passo ensina como hospedar a API REST do **Gestão X** no **PythonAnywhere** utilizando o plano 100% gratuito (Free Tier), sem custos e sem necessidade de cartão de crédito.

---

## 1. Criar a Conta Gratuita no PythonAnywhere
1. Acesse: https://www.pythonanywhere.com/
2. Clique em **"Pricing & signup"** e escolha o plano **"Create a Beginner account"** (gratuito).
3. Escolha seu nome de usuário (exemplo: `albertombuyizola`).
   - Sua URL será: `https://albertombuyizola.pythonanywhere.com`

---

## 2. Enviar os Arquivos da API
Existem duas formas fáceis de subir os arquivos:

### Opção A: Via Terminal Bash (Mais rápida e recomendada)
1. No painel do PythonAnywhere, vá na aba **Consoles** e clique em **Bash**.
2. No terminal aberto, crie uma pasta para o projeto:
   ```bash
   mkdir -p ~/gestaox-api
   cd ~/gestaox-api
   ```
3. Você pode clonar seu repositório Git ou subir os arquivos da pasta `backend_api/`.

### Opção B: Via Aba "Files" (Interface Web)
1. Vá até a aba **Files**.
2. Crie o diretório `/home/SEU_USUARIO/gestaox-api`.
3. Faça o upload dos arquivos:
   - `app.py`
   - `config.py`
   - `models.py`
   - `auth.py`
   - `routes_clients.py`
   - `routes_budgets.py`
   - `routes_invoices.py`
   - `routes_dashboard.py`
   - `routes_users.py`
   - `seed_db.py`
   - `requirements.txt`

---

## 3. Criar Ambiente Virtual (Virtualenv) e Instalar Dependências
No terminal **Bash** do PythonAnywhere, execute:

```bash
# 1. Cria virtualenv com Python 3.10
mkvirtualenv --python=/usr/bin/python3.10 gestaox-venv

# 2. Navega até a pasta do projeto
cd ~/gestaox-api

# 3. Instala as dependências obrigatórias
pip install -r requirements.txt

# 4. Inicializa o banco de dados SQLite com dados padrão de Angola
python seed_db.py
```
*Saída esperada:* `>> Inicialização do banco concluída com sucesso!` (O arquivo `gestaox.db` será criado).

---

## 4. Configurar a Aplicação Web no Painel do PythonAnywhere
1. Vá até a aba **Web** no menu superior do PythonAnywhere.
2. Clique no botão azul **"Add a new web app"**.
3. No assistente:
   - Clique em **Next**.
   - Escolha **Manual configuration** (NÃO escolha Flask direto, escolha Manual).
   - Escolha **Python 3.10**.
   - Clique em **Next**.

### 4.1 Configurar o Virtualenv na Aba Web:
Na seção **Virtualenv**, informe o caminho:
`/home/SEU_USUARIO/.virtualenvs/gestaox-venv`

### 4.2 Configurar o Arquivo WSGI:
Na seção **Code**, clique no link do arquivo **WSGI configuration file**:
(Exemplo: `/var/www/SEU_USUARIO_pythonanywhere_com_wsgi.py`)

Apague todo o código de exemplo e cole o seguinte:

```python
import sys
import os

# ATENÇÃO: Substitua 'SEU_USUARIO' pelo seu usuário real do PythonAnywhere
username = 'SEU_USUARIO'
project_home = f'/home/{username}/gestaox-api'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Variáveis de ambiente
os.environ['SECRET_KEY'] = 'gestaox-super-segredo-producao-2026'
os.environ['JWT_SECRET_KEY'] = 'gestaox-jwt-producao-2026'
os.environ['DATABASE_URL'] = f'sqlite:///{project_home}/gestaox.db'

# Importa a aplicação Flask
from app import app as application
```
Clique em **Save** (botão verde no topo).

---

## 5. Recarregar e Testar a API
1. Volte para a aba **Web**.
2. Clique no grande botão verde **"Reload SEU_USUARIO.pythonanywhere.com"**.
3. Acesse no navegador:
   `https://SEU_USUARIO.pythonanywhere.com/api/v1/health`

*Resposta esperada:*
```json
{
  "engine": "Flask + SQLAlchemy + SQLite",
  "status": "healthy",
  "success": true
}
```

---

## 6. Usuário e Senha Padrão Criados
- **Usuário:** `admin`
- **Palavra-passe:** `admin123`
- **Perfil:** Administrador Geral

Você pode alterar essa palavra-passe ou criar novos operadores tanto pelo cliente Desktop quanto pelos endpoints da API.

---

## 7. Manutenção no Plano Gratuito (Dica de Ouro)
- No plano gratuito do PythonAnywhere, as aplicações web ficam ativas por **3 meses seguidos**.
- A cada 3 meses, o PythonAnywhere envia um e-mail com um botão para estender gratuitamente por mais 3 meses com 1 clique (ou você pode entrar na aba **Web** e clicar no botão *"Run until 3 months from today"*).
