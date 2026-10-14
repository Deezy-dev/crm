# GUIA DE COMPILAÇÃO DO CLIENTE DESKTOP WINDOWS (PYINSTALLER)
============================================================

Este guia explica como testar e compilar o aplicativo executável do **Gestão X Desktop** para Windows (`.exe`), que se conecta à API no PythonAnywhere.

---

## 1. Pré-Requisitos no Computador Windows
- Python 3.10 ou superior instalado (Marque a opção *"Add Python to PATH"* durante a instalação).
- Acesso à internet para instalar as bibliotecas via `pip`.

---

## 2. Instalação das Dependências
Abra o prompt de comando (CMD ou PowerShell) na pasta `desktop_client/` e execute:

```bash
pip install -r requirements.txt
```

---

## 3. Executar o Aplicativo em Modo de Desenvolvimento
Para testar a interface gráfica antes de compilar:

```bash
python main.py
```
- Você verá a janela de login com tema escuro moderno do **CustomTkinter**.
- Insira o usuário `admin`, senha `admin123` e a URL da sua API no PythonAnywhere (`https://seu_usuario.pythonanywhere.com`) ou `http://localhost:5000`.

---

## 4. Compilar o Executável Windows (.exe)

### Opção A: Usando o Script Batch Automático
Dê um duplo clique no arquivo:
`build_exe.bat`

### Opção B: Comando Direto do PyInstaller
No terminal, execute o comando oficial:

```bash
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_Desktop" --collect-all customtkinter main.py
```

### Explicação dos Parâmetros:
- `--onefile`: Empacota todo o aplicativo, bibliotecas e interpretador num **único arquivo executável `.exe`**.
- `--windowed`: Executa como aplicativo de interface gráfica nativo, sem abrir aquela janela preta de prompt do DOS.
- `--collect-all customtkinter`: Garante que todos os temas visuais, fontes e ícones do CustomTkinter sejam empacotados dentro do `.exe`.

---

## 5. Onde Fica o Arquivo Executável Gerado?
Após a compilação, o arquivo estará pronto em:
`dist\GestaoX_Desktop.exe`

Você pode copiar esse arquivo `GestaoX_Desktop.exe` para qualquer computador com Windows 10 ou 11. O executável é independente e não requer que o cliente tenha Python instalado!

---

## 6. Recursos Resilientes Incluídos
- **Cache Local SQLite:** Se a internet oscilar ou cair temporariamente, o aplicativo continua abrindo a lista de clientes e dados do dashboard salvos no arquivo `local_cache.db`.
- **Renovação Automática JWT:** Tokens de acesso expirados são renovados em segundo plano via Refresh Token sem interromper o trabalho do operador.
