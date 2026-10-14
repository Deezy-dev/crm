# GESTÃO X · CLIENTE DESKTOP ELECTRON
==================================================

Aplicativo Desktop profissional em **Electron + HTML5 + CSS3 + JavaScript**, desenvolvido com interface moderna no estilo SaaS (Dark Mode), consumindo a API REST Flask hospedada no **PythonAnywhere** (ou em servidor local).

---

## 1. Estrutura do Projeto Electron

```text
electron_app/
├── package.json          # Metadados, scripts de execução e configuração do electron-builder
├── main.js               # Processo principal do Electron (janelas, ciclo de vida, IPC)
├── preload.js            # Bridge segura entre Main e Renderer (IPC isolado)
├── index.html            # Estrutura completa da interface gráfica (SPA multi-painel)
├── css/
│   └── styles.css        # Design moderno estilo SaaS, Dark Mode, animações e responsividade
├── js/
│   ├── api.js            # Serviço centralizado de API (fetch + JWT + auto-refresh + cache offline)
│   └── app.js            # Controlador da UI (navegação, modais, formulários, métricas)
└── README_ELECTRON.md    # Este guia de execução e compilação
```

---

## 2. Pré-Requisitos

- **Node.js** v18 ou superior instalado no computador (com `npm`).
- Acesso à internet para instalar os pacotes na primeira execução.

---

## 3. Instalação das Dependências

Abra o terminal (CMD, PowerShell ou Bash) dentro da pasta `electron_app`:

```bash
cd electron_app
npm install
```

Isso instalará:
- `electron`: Runtime para aplicações desktop nativas.
- `electron-builder`: Ferramenta para empacotar e gerar o instalador executável Windows (`.exe`).

---

## 4. Executar em Modo de Desenvolvimento

Para abrir e testar o aplicativo imediatamente:

```bash
npm start
```
*(ou `npm run dev`)*

Uma janela nativa será aberta com a tela de login moderna do **Gestão X**.

### Credenciais Padrão:
- **URL da API:** `http://127.0.0.1:5000` (se rodando o Flask localmente) ou `https://seu_usuario.pythonanywhere.com`
- **Usuário:** `admin`
- **Senha:** `admin123`

---

## 5. Gerar o Executável Windows (.exe)

O projeto está 100% configurado para compilar o executável para Windows através do `electron-builder`.

### Opção A: Gerar Instalador Completo (.exe com assistente de instalação)
```bash
npm run build
```
*(ou `npm run build:win`)*

### Opção B: Gerar Executável Portátil (Portable .exe - não precisa instalar)
```bash
npm run build:portable
```

### Onde fica o arquivo final?
Após o término da compilação, o arquivo executável estará localizado dentro da pasta:
```text
electron_app/dist/Gestão X Desktop Setup 1.0.0.exe
```
(ou `Gestão X Desktop 1.0.0.exe` no caso da versão portátil).

---

## 6. Recursos & Diferenciais Implementados

1. **Interface Moderna SaaS (Dark Mode):**
   - Paleta de cores escura de alta fidelidade baseada em Slate e tons de azul/ciano (`#0b0f19`, `#0284c7`, `#38bdf8`).
   - Cards com métricas consolidadas em Kwanzas (`Kz`), gráficos de serviços e faturamento.
   - Tabelas interativas de Clientes, Orçamentos e Faturas com filtros em tempo real.
   - Modais responsivos para cadastro, edição e registro de recebimentos.

2. **Serviço Centralizado de API (`js/api.js`):**
   - Utiliza a API nativa `fetch` com cabeçalhos padrão JSON.
   - **Gerenciamento de JWT:** Armazena `access_token` e `refresh_token` de forma segura.
   - **Auto-Refresh Transparente:** Quando o `access_token` expira (código HTTP 401), o serviço utiliza automaticamente o `refresh_token` para renovar a sessão e retentar a requisição sem interromper o trabalho do operador.
   - **Cache Offline Resiliente:** Salva as respostas das consultas no `localStorage`. Caso a rede oscile ou fique offline, o sistema exibe os últimos dados conhecidos acompanhados de um aviso discreto.

3. **Monitor de Latência em Tempo Real:**
   - Na barra lateral existe um indicador de status (`API Online` / `API Desconectada`) que realiza pings automáticos e exibe a latência em milissegundos.
