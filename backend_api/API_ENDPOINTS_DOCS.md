# DOCUMENTAÇÃO DA API REST GESTÃO X (PYTHONANYWHERE)
===================================================

URL Base de Exemplo: `https://SEU_USUARIO.pythonanywhere.com` ou `http://localhost:5000`

Autenticação: Todos os endpoints protegidos exigem o cabeçalho HTTP:
`Authorization: Bearer <seu_access_token>`

---

## 1. AUTENTICAÇÃO

### 1.1 Login
- **Método / Rota:** `POST /api/v1/auth/login`
- **Cabeçalho:** `Content-Type: application/json`
- **Exemplo de Requisição (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@osdel.ao",
    "full_name": "Albert (Administrador Geral)",
    "role": "admin",
    "is_active": true
  }
}
```

### 1.2 Renovar Token (Refresh)
- **Método / Rota:** `POST /api/v1/auth/refresh`
- **Cabeçalho:** `Authorization: Bearer <refresh_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer"
}
```

### 1.3 Obter Usuário Atual
- **Método / Rota:** `GET /api/v1/auth/me`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Albert (Administrador Geral)",
    "role": "admin"
  }
}
```

---

## 2. CLIENTES (TV A CABO E INTERNET FIBRA)

### 2.1 Listar Clientes
- **Método / Rota:** `GET /api/v1/clients?search=antonio&status=active&page=1&per_page=20`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "total": 1,
  "page": 1,
  "pages": 1,
  "items": [
    {
      "id": 1,
      "code": "CLI-00001",
      "full_name": "António Domingos Pedro",
      "phone": "+244 923 456 789",
      "neighborhood": "Golf I",
      "city": "Luanda",
      "service_type": "tv",
      "status": "active",
      "monthly_fee": 4000.0
    }
  ]
}
```

### 2.2 Cadastrar Cliente
- **Método / Rota:** `POST /api/v1/clients`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Requisição (JSON):**
```json
{
  "full_name": "Joaquim Bernardo Afonso",
  "phone": "+244 931 774 219",
  "alternate_phone": "+244 991 223 344",
  "email": "joaquim.afonso@gmail.com",
  "address": "Rua Direita, Casa 8, Golf II",
  "neighborhood": "Golf II",
  "city": "Luanda",
  "document_number": "002948172LA028",
  "service_type": "fibra",
  "status": "active",
  "monthly_fee": 8500.0,
  "notes": "Instalação prioritária de fibra óptica FTTH"
}
```
- **Exemplo de Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Cliente cadastrado com sucesso!",
  "client": {
    "id": 4,
    "code": "CLI-00004",
    "full_name": "Joaquim Bernardo Afonso",
    "status": "active"
  }
}
```

### 2.3 Atualizar Cliente
- **Método / Rota:** `PUT /api/v1/clients/4`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Requisição (JSON):**
```json
{
  "status": "late",
  "monthly_fee": 9000.0,
  "notes": "Cliente solicitou adiamento de pagamento para dia 10."
}
```

### 2.4 Excluir Cliente
- **Método / Rota:** `DELETE /api/v1/clients/4`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Cliente \"Joaquim Bernardo Afonso\" excluído com sucesso."
}
```

---

## 3. FATURAS E MENSALIDADES

### 3.1 Listar Faturas
- **Método / Rota:** `GET /api/v1/invoices?status=pendente`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "items": [
    {
      "id": 2,
      "number": "FT-00002",
      "client_id": 2,
      "client_name": "Maria Teresa Sebastião",
      "amount": 8500.0,
      "penalty": 1000.0,
      "total": 9500.0,
      "status": "pendente",
      "due_date": "2026-10-15",
      "reference_code": "REF-0002"
    }
  ]
}
```

### 3.2 Liquidar Fatura (Pagamento)
- **Método / Rota:** `POST /api/v1/invoices/2/pay`
- **Exemplo de Requisição (JSON):**
```json
{
  "payment_method": "multicaixa",
  "reference_code": "MCX-884920"
}
```
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Fatura FT-00002 liquidada com sucesso!",
  "invoice": {
    "id": 2,
    "status": "paga",
    "payment_method": "multicaixa"
  }
}
```

---

## 4. DASHBOARD E MÉTRICAS

### 4.1 Resumo Consolidado
- **Método / Rota:** `GET /api/v1/dashboard/summary`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-08T14:30:00.000000",
  "metrics": {
    "clients": {
      "total": 420,
      "active": 395,
      "late": 18,
      "suspended": 7,
      "tv": 210,
      "fibra": 140,
      "combo": 70
    },
    "financial": {
      "revenue_total_kz": 2450000.0,
      "pending_total_kz": 185000.0,
      "invoices_paid_count": 390,
      "invoices_pending_count": 22
    },
    "budgets": {
      "total": 15,
      "pending": 4,
      "approved": 11
    }
  }
}
```

---

## 5. ORÇAMENTOS E PROPOSTAS

### 5.1 Listar Orçamentos
- **Método / Rota:** `GET /api/v1/budgets?status=pendente`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "items": [
    {
      "id": 1,
      "number": "ORC-00001",
      "client_name": "Mateus Manuel da Silva",
      "service_type": "fibra",
      "description": "Instalação de cabo drop óptico 80m + ONU Huawei GPON",
      "total_amount": 25000.0,
      "discount": 2500.0,
      "final_amount": 22500.0,
      "status": "aprovado",
      "validity_days": 15
    }
  ]
}
```

### 5.2 Criar Orçamento
- **Método / Rota:** `POST /api/v1/budgets`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Requisição (JSON):**
```json
{
  "client_name": "António Bernardo",
  "service_type": "fibra",
  "total_amount": 35000.0,
  "discount": 5000.0,
  "validity_days": 15,
  "description": "Instalação de rede interna de fibra óptica e roteador Wi-Fi 6"
}
```

### 5.3 Atualizar Status do Orçamento
- **Método / Rota:** `PATCH /api/v1/budgets/1/status`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Requisição (JSON):**
```json
{
  "status": "aprovado"
}
```

---

## 6. GESTÃO DE USUÁRIOS E OPERADORES

### 6.1 Listar Usuários
- **Método / Rota:** `GET /api/v1/users`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "items": [
    {
      "id": 1,
      "username": "admin",
      "full_name": "Albert (Administrador Geral)",
      "email": "admin@osdel.ao",
      "role": "admin",
      "is_active": true
    },
    {
      "id": 2,
      "username": "operador1",
      "full_name": "Maria Teresa dos Santos",
      "role": "operador",
      "is_active": true
    }
  ]
}
```

### 6.2 Criar Usuário (Operador)
- **Método / Rota:** `POST /api/v1/users` ou `POST /api/v1/auth/register`
- **Cabeçalho:** `Authorization: Bearer <access_token>`
- **Exemplo de Requisição (JSON):**
```json
{
  "username": "tecnico_joao",
  "password": "senhaForte123",
  "full_name": "João Baptista",
  "role": "tecnico"
}
```

