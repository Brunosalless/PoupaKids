# 📡 PoupaKids — Documentação da API REST

**Base URL (dev):** `http://localhost:3000/api`
**Autenticação:** Bearer JWT em `Authorization: Bearer <token>`
**Formato:** JSON (UTF-8)

---

## Índice

- [Formato padrão de erro](#formato-padrão-de-erro)
- [Autenticação](#autenticação) — `/api/auth/*`
- [Usuários](#usuários) — `/api/usuarios/*`
- [Contas](#contas) — `/api/contas/*`
- [Transações](#transações) — `/api/transacoes/*`
- [Metas](#metas) — `/api/metas/*`
- [Gamificação](#gamificação) — `/api/gamificacao/*`
- [Conteúdos](#conteúdos) — `/api/conteudos`
- [Painel do Responsável](#painel-do-responsável) — `/api/responsavel/*`

---

## Formato padrão de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [{ "path": "email", "message": "\"email\" must be a valid email" }]
  }
}
```

### Códigos de erro

| Código                 | HTTP | Significado                                  |
| ---------------------- | ---- | -------------------------------------------- |
| `VALIDATION_ERROR`     | 400  | Payload inválido (Joi)                       |
| `UNAUTHORIZED`         | 401  | Token ausente, inválido ou expirado          |
| `FORBIDDEN`            | 403  | Sem permissão para o recurso                 |
| `NOT_FOUND`            | 404  | Recurso inexistente                          |
| `CONFLICT`             | 409  | Ex.: email já cadastrado                     |
| `INSUFFICIENT_BALANCE` | 422  | Saque/transferência sem saldo suficiente     |
| `RATE_LIMIT`           | 429  | Muitas tentativas em curto intervalo         |
| `INTERNAL_ERROR`       | 500  | Erro inesperado                              |

---

## Autenticação

### POST `/api/auth/register`

Cadastra um novo responsável ou criança. Rate-limit: 5 tentativas / 15 min.

**Body (responsável):**
```json
{
  "tipo": "responsavel",
  "nome": "Carlos Silva",
  "email": "carlos@ex.com",
  "senha": "Senha@123",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-0000"
}
```

**Body (criança):**
```json
{
  "tipo": "usuario",
  "nome": "Joãozinho",
  "email": "joao@ex.com",
  "senha": "Kids@123",
  "data_nascimento": "2015-04-10",
  "id_responsavel": 1
}
```

**201 Created:**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id_usuario": 10, "nome": "Joãozinho", "email": "joao@ex.com" }
}
```

**Erros possíveis:** `409 CONFLICT` (email em uso), `400 VALIDATION_ERROR` (idade ≥ 18).

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"tipo":"responsavel","nome":"Carlos","email":"c@ex.com","senha":"Senha@123","cpf":"111"}'
```

---

### POST `/api/auth/login`

**Body:**
```json
{ "email": "carlos@ex.com", "senha": "Senha@123", "tipo": "responsavel" }
```

**200 OK:**
```json
{ "token": "eyJhbGciOi...", "user": { "id_responsavel": 1, "nome": "Carlos" } }
```

**Erros:** `401 UNAUTHORIZED`, `429 RATE_LIMIT`.

---

## Usuários

Requer `Authorization`. Um usuário só pode acessar seus próprios dados (responsável acessa qualquer).

### GET `/api/usuarios/:id`
Retorna dados do perfil (sem `senha_hash`).

### PUT `/api/usuarios/:id`
**Body:** `{ "nome": "...", "email": "...", "telefone": "...", "endereco": "..." }` (pelo menos 1 campo).

### DELETE `/api/usuarios/:id`
Hard delete (LGPD). **204 No Content**.

---

## Contas

### GET `/api/contas/:id`
```json
{ "id_conta": 5, "id_usuario": 10, "saldo": "150.00", "limite_mesada": "100.00" }
```

### GET `/api/contas/usuario/:idUsuario`
Mesma resposta, busca pela FK do usuário.

---

## Transações

### POST `/api/transacoes`

**Body (depósito/saque):**
```json
{ "id_conta": 5, "tipo_transacao": "Deposito", "valor": 20.00, "descricao": "Mesada" }
```

**Body (transferência):**
```json
{
  "id_conta": 5,
  "tipo_transacao": "Transferencia",
  "valor": 10.00,
  "id_conta_destino": 6
}
```

**201 Created:**
```json
{
  "transacao": { "id_transacao": 99, "tipo_transacao": "Deposito", "valor": "20.00" },
  "saldo": "170.00"
}
```

**Erros:** `422 INSUFFICIENT_BALANCE` se tentar sacar/transferir acima do saldo; `404 NOT_FOUND` se conta inexistir.

### GET `/api/transacoes/:contaId?page=1&limit=20&tipo=Deposito`

```json
{
  "page": 1, "limit": 20, "total": 42, "totalPages": 3,
  "data": [ { "id_transacao": 99, "tipo_transacao": "Deposito", "valor": "20.00", "data_transacao": "2025-09-20T12:00:00Z" } ]
}
```

---

## Metas

### GET `/api/metas/:usuarioId`
Array de metas ordenadas por data de criação (desc).

### POST `/api/metas`
```json
{ "id_usuario": 10, "descricao": "Bike nova", "valor_meta": 500.00 }
```

### PUT `/api/metas/:id`
```json
{ "valor_atual": 200.00 }
```
Se `valor_atual >= valor_meta` e status for `ativa`, a API altera status para `concluida` automaticamente.

### DELETE `/api/metas/:id`
**204 No Content**.

---

## Gamificação

### GET `/api/gamificacao/:usuarioId`
```json
{
  "nivel": 2,
  "pontos": 120,
  "proximoNivel": 200,
  "conquistas": [
    { "id_conquista": 1, "nome": "Primeira meta!", "descricao": "Criou sua primeira meta" }
  ]
}
```

### POST `/api/gamificacao/:usuarioId/pontos`
**Body:** `{ "pontos": 10, "motivo": "Depósito realizado" }`

Resposta: `{ "nivel": 2, "pontos": 130 }`. O nível é recalculado como `floor(pontos / 100) + 1`.

---

## Conteúdos

### GET `/api/conteudos?nivel=Iniciante`
```json
[
  { "id_conteudo": 1, "titulo": "O que é dinheiro?", "nivel": "Iniciante" }
]
```

---

## Painel do Responsável

Requer `tipo=responsavel` no JWT. O responsável só acessa dados dos próprios filhos (verificação via `req.user.id === :id`).

### GET `/api/responsavel/:id/filhos`
Retorna array de filhos com `conta` e `gamificacao` embutidas.

### GET `/api/responsavel/:id/filho/:idFilho/resumo`
```json
{
  "usuario": { "id_usuario": 10, "nome": "Joãozinho" },
  "saldo": "150.00",
  "gamificacao": { "nivel": 1, "pontos": 0 },
  "metas": [ ... ],
  "ultimasTransacoes": [ ... ]
}
```

---

## Health check

### GET `/api/health`
```json
{ "status": "ok", "ts": "2025-09-20T12:00:00.000Z" }
```
