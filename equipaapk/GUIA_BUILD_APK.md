# GUIA DE COMPILAÇÃO DO APK: OSDEL EQUIPA & TÉCNICOS
> **Aplicativo Android Oficial para Técnicos de Piquete e Operadores da OSDEL TECNOLOGIA**

Este diretório (`/equipaapk`) contém o código-fonte independente e autónomo do aplicativo móvel para a equipa técnica de campo e operadores.

---

## 1. O que este aplicativo faz
- **Perfil & Salário do Colaborador**: Visualização do salário base, subsídio de alimentação e transporte, e conta bancária oficial (BAI, BFA, etc.) onde cai o pagamento.
- **Agenda Diária & Escala**: Lista de tarefas do técnico com marcação em tempo real de concluído/pendente.
- **Ordens de Serviço & Piquete de Campo**:
  - Ordens de reparação, nova instalação e cortes por falta de pagamento.
  - Informações de morada, caixa PDO, número de porta e telefone do cliente com ligação directa.
  - Botão para dar baixa ou iniciar o serviço no local.
- **Painel de Operador / Administrador**:
  - Visualização dos pedidos de acordo de clientes (promessas para não corte).
  - Botão de aprovação instantânea com emissão da mensagem de protecção contra corte.

---

## 2. Configurar a URL do Servidor (API)
Abra o ficheiro:
```
equipaapk/src/config/api.ts
```
E configure a variável `API_BASE_URL` para o endereço da sua API:
```typescript
export const API_BASE_URL: string = 'https://api.osdeltecnologia.ao';
```

---

## 3. Como Gerar o Arquivo APK para os Técnicos

### MÉTODO 1: Com Capacitor e Android Studio (Recomendado)

#### Passo 1: Entrar na pasta e instalar dependências
No terminal do seu computador (PowerShell, CMD ou Bash):
```bash
cd equipaapk
npm install
```

#### Passo 2: Instalar o Capacitor Android
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### Passo 3: Compilar o código Web
```bash
npm run build
```

#### Passo 4: Adicionar o projeto nativo Android
```bash
npx cap add android
```

#### Passo 5: Sincronizar
```bash
npx cap sync
```

#### Passo 6: Abrir no Android Studio
```bash
npx cap open android
```
No Android Studio:
1. Aguarde o Gradle finalizar a sincronização.
2. No menu superior, clique em **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Clique em **locate** na notificação de conclusão.
4. O seu ficheiro APK estará gerado em:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Distribua este `.apk` para os técnicos da OSDEL instalarem no telemóvel!

---

### MÉTODO 2: Gerar APK em 2 Minutos sem Android Studio (PWABuilder)
1. Publique esta versão num link acessível.
2. Aceda a **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
3. Cole o link da aplicação da equipa.
4. Clique em **Package for Android** > **Generate APK**.
5. Descarregue o `.apk` gerado instantaneamente e instale nos smartphones da equipa.

---

## 4. Instalar no Telemóvel do Técnico
1. Envie o ficheiro `app-debug.apk` por WhatsApp, Bluetooth ou cabo USB para o telemóvel do técnico.
2. Ao tocar no ficheiro, autorize a instalação de **"Fontes Desconhecidas"**.
3. O aplicativo **OSDEL Equipa** estará instalado e pronto a operar na rua!
