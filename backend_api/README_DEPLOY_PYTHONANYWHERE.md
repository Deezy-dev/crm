# GUIA DEFINITIVO: DEPLOY NO PYTHONANYWHERE (PLANO GRATUITO)
================================================================================
Gestão X · API REST Flask + SQLite + JWT
================================================================================

Este guia foi elaborado para garantir que você publique sua API no **PythonAnywhere Free Tier** sem nenhum erro, compreendendo exatamente o que o plano gratuito suporta, suas restrições e como contorná-las.

---

## 1. O QUE O PLANO GRATUITO SUPORTA E O QUE NÃO SUPORTA

Antes de iniciar, conheça as regras do plano gratuito do PythonAnywhere para evitar surpresas:

### ✅ O QUE É 100% SUPORTADO NO PLANO GRATUITO:
1. **1 Aplicação Web WSGI ativa**: Seu domínio oficial será `https://SEU_USUARIO.pythonanywhere.com`.
2. **HTTPS / SSL Grátis**: O PythonAnywhere gera e renova automaticamente o certificado HTTPS.
3. **Python 3.10 e 3.11**: Compatibilidade total com as versões modernas do Python.
4. **Banco de Dados SQLite**: Salvo no disco da sua conta (`gestaox.db`), sem necessidade de configurar servidores SQL externos.
5. **Ambientes Virtuais (virtualenv)**: Instalação isolada de pacotes via `pip`.
6. **Acesso Inbound Ilimitado**: Qualquer aplicativo (Electron Desktop, App Web, celulares) pode enviar requisições HTTP/HTTPS para sua API.
7. **Tráfego CORS**: Totalmente habilitado para receber conexões do app desktop e navegadores.

### ⚠️ RESTRIÇÕES DO PLANO GRATUITO E COMO O GESTÃO X ESTÁ PROTEGIDO:
| Restrição do PythonAnywhere Free | Impacto no Projeto | Como o Gestão X resolveu |
| :--- | :--- | :--- |
| **Bloqueio de conexões de saída (Outbound HTTP)** | O servidor não pode fazer requisições para APIs externas não listadas. | **Nenhum impacto**: Nossa API não consome APIs externas; ela apenas **recebe** requisições dos clientes (Inbound). |
| **Sem Docker** | Não é possível rodar contêineres Docker. | **Resolvido**: Usamos `virtualenv` nativo do PythonAnywhere. |
| **Sem Redis / Celery** | Não há suporte a filas de tarefas em segundo plano assíncronas. | **Resolvido**: Todas as operações de banco e autenticação são executadas sincronicamente via Flask. |
| **Sem WebSockets** | O PythonAnywhere usa servidores WSGI síncronos. | **Resolvido**: Usamos polling e requisições REST padrão com `fetch` e `requests`. |
| **Expiração a cada 3 meses** | Apps gratuitos expiram se não forem renovados. | **Ação necessária**: A cada 3 meses, acesse a aba **Web** e clique no botão verde *"Run until 3 months from today"*. (O PythonAnywhere envia um email de aviso com 7 dias de antecedência). |
| **Limite de Disco (512 MB)** | O espaço total da conta é de 512 MB. | **Otimizado**: Nossa aplicação inteira com o banco SQLite e dependências consome menos de 45 MB. |
| **Bloqueio de Concorrência no SQLite** | Em servidores WSGI com múltiplos workers, escritas simultâneas no SQLite podem gerar erro de *database locked*. | **Blindado**: Configuramos `timeout: 30` e `check_same_thread: False` no SQLAlchemy em `config.py`. |

---

## 2. PASSO A PASSO COMPLETO DO DEPLOY

### PASSO 1: Criar a Conta Gratuita
1. Acesse: **[https://www.pythonanywhere.com/](https://www.pythonanywhere.com/)**
2. Clique no canto superior em **"Pricing & signup"**.
3. Na coluna **"Beginner"**, clique em **"Create a Beginner account"**.
4. Escolha seu nome de usuário com atenção (exemplo: `albertombuyizola`).
   - Sua API ficará disponível em: `https://albertombuyizola.pythonanywhere.com`
5. Conclua o cadastro e confirme seu email.

---

### PASSO 2: Fazer Upload dos Arquivos da API
Existem duas opções práticas:

#### Opção Recomendada: Pelo Terminal Bash
1. No painel do PythonAnywhere, vá até a aba **Consoles** e clique em **Bash**.
2. No console que abrir, crie o diretório do projeto:
   ```bash
   mkdir -p ~/gestaox-api
   cd ~/gestaox-api
   ```
3. Se o seu projeto estiver num repositório Git (GitHub/GitLab):
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO> .
   cd backend_api
   cp -r * ~/gestaox-api/
   cd ~/gestaox-api
   ```
4. Se preferir subir os arquivos manualmente:
   - Vá na aba **Files** no menu superior.
   - Navegue até `/home/SEU_USUARIO/gestaox-api`.
   - Use o botão **"Upload a file"** para enviar os arquivos da pasta `backend_api/`:
     * `app.py`
     * `config.py`
     * `models.py`
     * `auth.py`
     * `routes_clients.py`
     * `routes_budgets.py`
     * `routes_invoices.py`
     * `routes_dashboard.py`
     * `routes_users.py`
     * `seed_db.py`
     * `wsgi_pythonanywhere.py`
     * `requirements.txt`

---

### PASSO 3: Criar o Ambiente Virtual (Virtualenv)
No terminal **Bash** do PythonAnywhere, execute os comandos:

```bash
# 1. Cria o virtualenv com Python 3.10
mkvirtualenv --python=/usr/bin/python3.10 gestaox-venv

# 2. Garante que você está na pasta do projeto
cd ~/gestaox-api

# 3. Instala todas as bibliotecas necessárias
pip install -r requirements.txt

# 4. Inicializa o banco de dados SQLite com dados padrão de Angola
python seed_db.py
```

*Saída esperada:*
```text
>> Criando tabelas no banco de dados...
>> Usuário 'admin' criado (senha: admin123)
>> Usuário 'operador1' criado (senha: 123456)
>> 3 Clientes criados.
>> Faturas e orçamentos iniciais inseridos com sucesso.
>> Inicialização do banco concluída com sucesso!
```

---

### PASSO 4: Configurar a Aplicação na Aba "Web"
1. No menu superior do PythonAnywhere, clique na aba **Web**.
2. Clique no botão azul **"Add a new web app"**.
3. No assistente que abrir:
   - Clique em **Next**.
   - Na seleção do framework, selecione **Manual configuration** *(NÃO escolha Flask direto aqui, pois vamos usar nosso virtualenv próprio)*.
   - Selecione **Python 3.10**.
   - Clique em **Next** para concluir o assistente.

---

### PASSO 5: Configurar o Virtualenv e o Diretório de Trabalho
Na página da aba **Web**, role até as seguintes seções:

1. **Virtualenv:**
   - Clique em *"Enter path to a virtualenv"*.
   - Digite exatamente:
     ```text
     /home/SEU_USUARIO/.virtualenvs/gestaox-venv
     ```
   - Clique no ícone de "check" (salvar). O PythonAnywhere reconhecerá o ambiente virtual.

2. **Code (Source code & Working directory):**
   - **Source code:** `/home/SEU_USUARIO/gestaox-api`
   - **Working directory:** `/home/SEU_USUARIO/gestaox-api`

---

### PASSO 6: Configurar o Arquivo WSGI
Ainda na aba **Web**, localize a seção **Code** e clique no link do seu arquivo WSGI:
`/var/www/SEU_USUARIO_pythonanywhere_com_wsgi.py`

1. Apague **todo** o conteúdo que estiver nesse arquivo.
2. Cole exatamente o código abaixo (substituindo `SEU_USUARIO` pelo seu username real do PythonAnywhere):

```python
import sys
import os

# Caminho do projeto no PythonAnywhere
project_home = '/home/SEU_USUARIO/gestaox-api'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Configurações de ambiente para produção
os.environ['SECRET_KEY'] = 'gestaox-prod-chave-secreta-2026'
os.environ['JWT_SECRET_KEY'] = 'gestaox-prod-jwt-chave-2026'
os.environ['DATABASE_URL'] = f'sqlite:///{os.path.abspath(os.path.join(project_home, "gestaox.db"))}'

# Importa a aplicação Flask com o nome 'application' obrigatório pelo WSGI
from app import app as application
```

3. Clique no botão verde **Save** no canto superior direito do editor.

---

### PASSO 7: Recarregar a Aplicação Web
1. Volte à aba **Web**.
2. Clique no botão verde grande: **"Reload SEU_USUARIO.pythonanywhere.com"**.
3. Pronto! Sua API estará rodando ao vivo na internet!

---

## 3. TESTAR SE A API ESTÁ FUNCIONANDO

Abra qualquer navegador e acerte as URLs da sua API:

1. **Página Inicial:**
   `https://SEU_USUARIO.pythonanywhere.com/`
   *Resposta esperada:* JSON com informações do Gestão X, status online e lista de rotas.

2. **Status de Saúde (Health Check):**
   `https://SEU_USUARIO.pythonanywhere.com/api/v1/health`
   *Resposta esperada:*
   ```json
   {
     "engine": "Flask + SQLAlchemy + SQLite",
     "status": "healthy",
     "success": true
   }
   ```

3. **Teste de Login via Terminal (cURL) ou Postman:**
   ```bash
   curl -X POST https://SEU_USUARIO.pythonanywhere.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin", "password":"admin123"}'
   ```
   *Resposta esperada:* Retorno com `access_token`, `refresh_token` e dados do administrador.

---

## 4. CONECTAR O APP DESKTOP (ELECTRON OU CUSTOMTKINTER)

Assim que sua API estiver no ar:

1. No aplicativo **Electron** (`electron_app`):
   - Na tela de login ou na aba **Configurações**, insira a URL:
     `https://SEU_USUARIO.pythonanywhere.com`
   - O indicador na barra lateral ficará verde (`API Online`) e exibirá a latência.
2. No aplicativo **Python CustomTkinter** (`desktop_client`):
   - Altere a variável `DEFAULT_API_URL` em `config.py` para `https://SEU_USUARIO.pythonanywhere.com` ou passe via variável de ambiente `API_URL`.

---

## 5. RESOLUÇÃO DE PROBLEMAS COMUNS (TROUBLESHOOTING)

### Erro 1: Erro 500 "Internal Server Error"
- **Causa:** Erro no código Python durante a inicialização.
- **Como ver o erro real:** Na aba **Web**, role até a seção **Log files** e clique no link **Error log** (`...error.log`). O erro exato em Python com o stack trace estará lá.

### Erro 2: "ModuleNotFoundError: No module named 'flask'"
- **Causa:** O caminho do Virtualenv não foi configurado ou foi digitado com erro de digitação.
- **Solução:** Na aba **Web**, verifique se o caminho do Virtualenv é exatamente:
  `/home/SEU_USUARIO/.virtualenvs/gestaox-venv`

### Erro 3: "sqlite3.OperationalError: database is locked"
- **Causa:** Tentativa de escrita simultânea no SQLite com tempo de espera baixo.
- **Solução:** O arquivo `config.py` do Gestão X já inclui a solução definitiva:
  ```python
  SQLALCHEMY_ENGINE_OPTIONS = {
      "connect_args": {
          "timeout": 30,
          "check_same_thread": False
      }
  }
  ```

### Erro 4: "Token de autorização não fornecido" (401)
- **Causa:** O cliente esqueceu de passar o cabeçalho `Authorization: Bearer <token>`.
- **Solução:** Os clientes Desktop (`api.js` e `api_client.py`) já enviam e renovam o token automaticamente.

### Erro 5: O site parou de responder depois de alguns meses
- **Causa:** No plano gratuito, o PythonAnywhere pausa a aplicação a cada 3 meses.
- **Solução:** Entre em [pythonanywhere.com](https://www.pythonanywhere.com), acerte a aba **Web** e clique em **"Run until 3 months from today"**. O site volta imediatamente.
