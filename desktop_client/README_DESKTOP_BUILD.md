# GUIA DE COMPILAÇÃO: EXECUTÁVEIS SEPARADOS (TV E INTERNET FIBRA)
================================================================================
Gestão X · Aplicativos Desktop Nativos Windows (.exe)
================================================================================

Para garantir que o aplicativo seja **super leve, ágil e focado na operação**, o sistema agora disponibiliza **dois executáveis separados**:

1. **`GestaoX_TV.exe`**: Módulo dedicado exclusivamente para **TV por Cabo Comunitária**.
2. **`GestaoX_Fibra.exe`**: Módulo dedicado exclusivamente para **Internet Fibra Óptica (ISP)**.

Ambos conectam-se à mesma API REST Flask no PythonAnywhere, mas cada um carrega apenas as telas, dados e campos necessários para a sua atividade.

---

## 1. COMPILAÇÃO RÁPIDA EM 1 CLIQUE NO WINDOWS (ARQUIVOS .BAT)

Na pasta `desktop_client/`, você encontrará 3 scripts automáticos:

* 👉 **`build_tv_exe.bat`**: Compila e gera o **`dist\GestaoX_TV.exe`**.
* 👉 **`build_fibra_exe.bat`**: Compila e gera o **`dist\GestaoX_Fibra.exe`**.
* 👉 **`build_both_exe.bat`**: Compila **ambos** os executáveis em sequência.

Basta dar um duplo clique no script desejado!

---

## 2. COMPILAÇÃO MANUAL VIA TERMINAL (PYINSTALLER)

Abra o prompt de comando (CMD ou PowerShell) na pasta `desktop_client`:

### Passo 1: Instalar as Dependências
```bash
pip install -r requirements.txt
```

### Passo 2: Compilar o Executável de TV
```bash
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_TV" --collect-all customtkinter main_tv.py
```

### Passo 3: Compilar o Executável de Internet Fibra
```bash
pyinstaller --noconfirm --onefile --windowed --name "GestaoX_Fibra" --collect-all customtkinter main_fibra.py
```

---

## 3. DIFERENÇAS ENTRE OS DOIS APLICATIVOS

| Recurso | `GestaoX_TV.exe` (TV a Cabo) | `GestaoX_Fibra.exe` (Internet Fibra) |
| :--- | :--- | :--- |
| **Identidade Visual** | Tema Azul/Ciano com badge `📺 TV` | Tema Verde Esmeralda com badge `🌐 FIBRA` |
| **Filtro de Clientes** | Lista apenas assinantes de TV por cabo | Lista clientes de Fibra Óptica e planos combo |
| **Campos Técnicos** | Bloco, Código de Casa, Tap / Divisor, Pontos de TV | Caixa PDO, Porta, Serial ONU / ONT, Plano de Megas |
| **Ações de Sinal** | Controle de Corte Físico e Religação de TV | Bloqueio Lógico de Internet por falta de pagamento |
| **Mensalidade Padrão** | Fixa para TV (Ex: 4.000 Kz) | Planos de velocidade (Ex: 8.500 Kz a 25.000 Kz) |
| **Tamanho do .exe** | Leve e otimizado (~25 MB standalone) | Leve e otimizado (~25 MB standalone) |

---

## 4. ONDE FICAM OS EXECUTÁVEIS APÓS A COMPILAÇÃO?

Após a execução do build, os arquivos `.exe` estarão prontos para uso na pasta `dist/`:
- `desktop_client\dist\GestaoX_TV.exe`
- `desktop_client\dist\GestaoX_Fibra.exe`

Você pode copiar esses arquivos `.exe` diretamente para um pendrive e rodar em qualquer computador com Windows 10 ou Windows 11. **Não é necessário ter Python instalado na máquina do cliente ou operador.**

---

## 5. SISTEMA DE IMPRESSÃO DE FACTURAS: DUAL FORMATO

Ambos os aplicativos (`GestaoX_TV.exe` e `GestaoX_Fibra.exe`), assim como o app Electron e a interface Web, contam com **dois formatos de impressão integrados**:

### 🧾 1. Formato Talão Térmico POS (80mm / 58mm)
* **Destinado a:** Impressoras térmicas não fiscais de recibos/talões (Epson TM-T20, Bematech, Elgin, Xprinter, POS-80, etc.).
* **Características:**
  - Layout compacto de 72mm a 80mm com tipografia monoespaçada de alto contraste (preto puro).
  - Linhas tracejadas de corte limpo sem desbotar.
  - Dados essenciais do assinante (Código, Nome, NIF/BI, Morada, Casa/Bloco, PDO/ONU).
  - Discriminação da Mensalidade e Multa por atraso.
  - Valor total em destaque grande, forma de liquidação e referência.
  - Mensagem de garantia de sinal e rodapé de agradecimento.

### 📄 2. Formato Factura Oficial A4
* **Destinado a:** Impressoras laser ou jato de tinta em folha A4 completa.
* **Características:**
  - Cabeçalho timbrado oficial com logótipo, NIF, dados legais e de contacto.
  - Tabela discriminativa detalhada com colunas de Artigo, Quantidade, Preço Unitário, Isenção IVA (Art. 12 CIVA) e Total.
  - Caixa de enquadramento fiscal e coordenadas bancárias oficiais (Banco BAI e BFA com IBAN).
  - Áreas reservadas para carimbo da empresa e assinatura do assinante.

