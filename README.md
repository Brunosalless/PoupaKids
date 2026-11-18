# PoupaKids — v2.1 (6º período, Fase 02)

Educação financeira infantil gamificada. Monorepo com **backend** (Node.js + Express + Sequelize, MySQL) e **frontend** (React + Vite) integrados por uma API REST autenticada com JWT.

```
poupakids/
├── backend/            API REST (routes → controllers → services → models)
│   ├── src/config/      conexão Sequelize (MySQL oficial; SQLite para demonstração/testes)
│   ├── src/models/      Responsavel, Usuario, Conta, Transacao, Objetivo, Gamificacao,
│   │                    ConteudoEducativo (tabela EducacaoFinanceira), ProgressoConteudo
│   ├── src/services/    regras de negócio RN01–RN13
│   ├── src/controllers/ tradução HTTP ⇄ services
│   ├── src/routes/      endpoints /api/*
│   ├── src/middlewares/ autenticar (JWT), exigirPerfil, errorHandler
│   ├── src/database/    schema (sync + CHECKs), seed com dados de teste
│   └── tests/           20 testes automatizados (Jest + Supertest)
├── frontend/           SPA React (Login, Cadastro, Painel do responsável, Painel da criança)
│   └── src/api/client.js  cliente axios único (JWT + tratamento de erros)
└── database/BancoKids.sql  DDL MySQL v2.1
```

## Rodar em 1 minuto (sem instalar MySQL)

Requisitos: Node.js 18+. Funciona no Windows (PowerShell/CMD), Linux e macOS. **Não precisa criar .env.**

```bash
npm run instalar     # 1ª vez: instala backend e frontend
npm run demo         # compila o frontend, cria o banco SQLite com dados de teste e sobe tudo
```

Abra **http://localhost:3333** no navegador. É o frontend React já integrado à API, servido pelo próprio backend.
Para zerar os dados de teste: `npm run demo:reset`.

| Perfil | Login | Senha / PIN |
|---|---|---|
| Responsável | carlos@poupakids.com | poupa123 |
| Responsável | maria@poupakids.com | poupa123 |
| Criança | joaozinho | 1234 |
| Criança | pedrinho | 1111 |
| Criança | aninha | 4321 |

## Rodar com MySQL (banco oficial)

```bash
copy backend\.env.example backend\.env   # Windows  (Linux/macOS: cp backend/.env.example backend/.env)
# edite backend/.env: DB_USER e DB_PASS = usuário e senha do SEU MySQL
#   (com Docker: docker compose up -d  →  DB_USER=root, DB_PASS=poupakids)
npm run seed     # cria a base BancoKids (se não existir), as tabelas e os dados de teste
npm start        # compila o frontend e sobe em http://localhost:3333
```

O erro `Access denied for user 'root'@'localhost' (using password: NO)` significa que o MySQL está ativo, mas o `DB_PASS` do .env está vazio ou errado.

Se a base BancoKids da Fase 0 já existir, use `DB_SYNC=alter` para adicionar as colunas novas. A API remove a trigger legada `atualiza_saldo` ao iniciar (ela duplicaria os créditos, pois o saldo agora é atualizado pelo `transacaoService`).

## Desenvolvimento (hot reload)

```bash
npm run dev:api    # terminal 1: API em http://localhost:3333/api (usa backend/.env)
npm run dev:web    # terminal 2: frontend em http://localhost:5173 (proxy /api → 3333)
npm test           # testes automatizados do backend
```

## Testar no Postman

1. Rode a API: `npm run demo`
2. No Postman: **Import** → arraste o arquivo `postman/PoupaKids.postman_collection.json`
3. Execute as pastas na ordem (ou **Run collection**). Os logins salvam os tokens sozinhos.

São 31 requisições cobrindo as 19 rotas. A pasta **7. Regras de negócio** mostra os erros esperados (401, 403, 404, 422).
Para recomeçar com os dados originais: `npm run demo:reset`.

## Endpoints

Todas as rotas, exceto `/health`, `/auth/registrar`, `/auth/login` e `/auth/login-crianca`, exigem `Authorization: Bearer <token>`.

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| GET | /api/health | — | status da API |
| POST | /api/auth/registrar | — | cadastra responsável (RF01) e devolve token |
| POST | /api/auth/login | — | login do responsável (e-mail/senha) |
| POST | /api/auth/login-crianca | — | login da criança (apelido/PIN) |
| GET | /api/auth/me | ambos | dados da sessão |
| GET | /api/usuarios | responsável | lista filhos com conta e gamificação |
| POST | /api/usuarios | responsável | cadastra criança + conta + gamificação |
| GET | /api/usuarios/:id | ambos* | detalhes e saldo |
| PATCH | /api/usuarios/:id/mesada | responsável | define valor da mesada |
| POST | /api/usuarios/:id/mesada/pagar | responsável | paga a mesada do mês |
| POST | /api/transacoes | ambos* | Depósito (só responsável), Saque, Transferência |
| GET | /api/transacoes/conta/:id_conta | ambos* | extrato da conta |
| POST | /api/objetivos | ambos* | cria meta (cofrinho) |
| GET | /api/objetivos/usuario/:id_usuario | ambos* | lista metas |
| PATCH | /api/objetivos/:id/adicionar | ambos* | guarda dinheiro na meta |
| GET | /api/conteudos?nivel= | ambos | conteúdos educativos (+ flag concluído) |
| POST | /api/conteudos/:id/concluir | criança | conclui conteúdo e ganha pontos |
| GET | /api/gamificacao/:id_usuario | ambos* | nível, pontos e conquistas |
| GET | /api/painel/responsavel | responsável | painel consolidado da família |

\* Responsável: apenas os próprios filhos. Criança: apenas os próprios dados (RN12).

Erros seguem o formato `{ "erro": "mensagem", "codigo": "SALDO_INSUFICIENTE" }` com status 400/401/403/404/409/422.
