"""Gera PoupaKids.postman_collection.json (Postman v2.1) com todas as rotas da API."""
import json, os

H = [{"key": "Content-Type", "value": "application/json"}]


def req(nome, metodo, caminho, corpo=None, token="tokenResponsavel", testes=None, pre=None, desc="", query=None):
    partes = caminho.strip("/").split("/")
    url = {"raw": "{{baseUrl}}/" + caminho.strip("/"), "host": ["{{baseUrl}}"], "path": partes}
    if query:
        url["raw"] += "?" + "&".join(f"{k}={v}" for k, v in query)
        url["query"] = [{"key": k, "value": v} for k, v in query]
    r = {"method": metodo, "header": list(H) if corpo is not None else [], "url": url, "description": desc}
    if corpo is not None:
        r["body"] = {"mode": "raw", "raw": json.dumps(corpo, ensure_ascii=False, indent=2),
                     "options": {"raw": {"language": "json"}}}
    r["auth"] = {"type": "bearer", "bearer": [{"key": "token", "value": "{{" + token + "}}", "type": "string"}]} if token else {"type": "noauth"}
    ev = []
    if pre:
        ev.append({"listen": "prerequest", "script": {"type": "text/javascript", "exec": pre}})
    if testes:
        ev.append({"listen": "test", "script": {"type": "text/javascript", "exec": testes}})
    item = {"name": nome, "request": r}
    if ev:
        item["event"] = ev
    return item


def status(*codigos, extra=()):
    lista = ", ".join(map(str, codigos))
    return [f"pm.test('Status {lista}', () => pm.expect(pm.response.code).to.be.oneOf([{lista}]));", *extra]


def erro(codigo_http, codigo=None):
    linhas = [f"pm.test('Status {codigo_http}', () => pm.response.to.have.status({codigo_http}));"]
    if codigo:
        linhas.append(f"pm.test('Código {codigo}', () => pm.expect(pm.response.json().codigo).to.eql('{codigo}'));")
    return linhas


cpf_script = [
    "// Gera um CPF válido e um e-mail únicos para cada execução",
    "const n = Array.from({length: 9}, () => Math.floor(Math.random() * 10));",
    "const dv = (b) => { const s = b.reduce((a, d, i) => a + d * (b.length + 1 - i), 0); const r = (s * 10) % 11; return r === 10 ? 0 : r; };",
    "n.push(dv(n)); n.push(dv(n));",
    "pm.collectionVariables.set('cpfNovo', n.join(''));",
    "pm.collectionVariables.set('emailNovo', 'teste' + Date.now() + '@poupakids.com');",
]

itens = [
    {"name": "0. Sistema", "item": [
        req("Health check", "GET", "/health", token=None, testes=status(200), desc="Verifica se a API está no ar."),
    ]},
    {"name": "1. Autenticação", "item": [
        req("Registrar responsável", "POST", "/auth/registrar",
            {"nome": "Responsável Teste", "cpf": "{{cpfNovo}}", "email": "{{emailNovo}}", "senha": "segredo1"},
            token=None, pre=cpf_script, testes=status(201), desc="RF01 — cria responsável e devolve token JWT. CPF/e-mail gerados automaticamente."),
        req("Login responsável (Carlos)", "POST", "/auth/login", {"email": "carlos@poupakids.com", "senha": "poupa123"},
            token=None, testes=status(200, extra=["pm.collectionVariables.set('tokenResponsavel', pm.response.json().token);"]),
            desc="Salva o token em {{tokenResponsavel}} automaticamente."),
        req("Login responsável (Maria - outra família)", "POST", "/auth/login", {"email": "maria@poupakids.com", "senha": "poupa123"},
            token=None, testes=status(200, extra=["pm.collectionVariables.set('tokenOutraFamilia', pm.response.json().token);"]),
            desc="Usado para demonstrar a RN12 (isolamento entre famílias)."),
        req("Login criança (joaozinho)", "POST", "/auth/login-crianca", {"apelido": "joaozinho", "pin": "1234"},
            token=None, testes=status(200, extra=["pm.collectionVariables.set('tokenCrianca', pm.response.json().token);"]),
            desc="RF10 — login por apelido + PIN. Salva o token em {{tokenCrianca}}."),
        req("Quem sou eu (me)", "GET", "/auth/me", testes=status(200)),
    ]},
    {"name": "2. Usuários (crianças)", "item": [
        req("Listar filhos", "GET", "/usuarios", testes=status(200)),
        req("Cadastrar criança", "POST", "/usuarios",
            {"nome": "Lia Teste", "idade": 8, "apelido": "lia{{$timestamp}}", "pin": "2222", "limite_mesada": 50},
            testes=status(201, extra=["pm.collectionVariables.set('idUsuarioNovo', pm.response.json().id_usuario);"]),
            desc="RN01/RN02 — cria criança com conta zerada e gamificação nível 1."),
        req("Buscar criança por id", "GET", "/usuarios/{{idUsuario}}", testes=status(200)),
        req("Definir mesada", "PATCH", "/usuarios/{{idUsuario}}/mesada", {"limite_mesada": 30}, testes=status(200)),
        req("Pagar mesada do mês", "POST", "/usuarios/{{idUsuario}}/mesada/pagar", testes=status(201, 409),
            desc="RN07 — 201 na primeira vez do mês; 409 MESADA_JA_PAGA se repetir."),
    ]},
    {"name": "3. Transações", "item": [
        req("Depósito (responsável)", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Depósito", "valor": 20, "categoria": "presente"}, testes=status(201),
            desc="RN04 — atualiza saldo e gera registro no extrato."),
        req("Saque / gasto (criança)", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Saque", "valor": 2, "categoria": "lanche"}, token="tokenCrianca", testes=status(201)),
        req("Transferência entre irmãos", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Transferência", "valor": 1, "id_conta_destino": "{{idContaIrmao}}"},
            token="tokenCrianca", testes=status(201), desc="Débito e crédito na mesma transação de banco (atômico)."),
        req("Extrato da conta", "GET", "/transacoes/conta/{{idConta}}", query=[("limite", "20")], testes=status(200)),
    ]},
    {"name": "4. Objetivos (cofrinhos)", "item": [
        req("Criar cofrinho", "POST", "/objetivos", {"descricao": "Bola nova", "valor_meta": 50}, token="tokenCrianca",
            testes=status(201, extra=["pm.collectionVariables.set('idObjetivo', pm.response.json().id_objetivo);"])),
        req("Listar cofrinhos da criança", "GET", "/objetivos/usuario/{{idUsuario}}", token="tokenCrianca", testes=status(200)),
        req("Guardar dinheiro no cofrinho", "PATCH", "/objetivos/{{idObjetivo}}/adicionar", {"valor": 1}, token="tokenCrianca",
            testes=status(200), desc="RN09 — debita o saldo; RN06 — +100 pontos ao concluir a meta."),
    ]},
    {"name": "5. Educação financeira", "item": [
        req("Listar conteúdos por nível", "GET", "/conteudos", query=[("nivel", "Iniciante")], token="tokenCrianca", testes=status(200)),
        req("Concluir conteúdo", "POST", "/conteudos/{{idConteudo}}/concluir", token="tokenCrianca", testes=status(200),
            desc="RN10 — pontos concedidos uma única vez (repetir devolve ja_concluido: true)."),
    ]},
    {"name": "6. Gamificação e painel", "item": [
        req("Gamificação da criança", "GET", "/gamificacao/{{idUsuario}}", token="tokenCrianca", testes=status(200)),
        req("Painel do responsável", "GET", "/painel/responsavel", testes=status(200)),
    ]},
    {"name": "7. Regras de negócio (erros esperados)", "description": "Cada requisição aqui DEVE falhar — mostra a regra sendo aplicada.", "item": [
        req("401 — sem token", "GET", "/usuarios", token=None, testes=erro(401)),
        req("RN01 — idade >= 18 (422)", "POST", "/usuarios", {"nome": "Adulto", "idade": 18, "apelido": "adulto", "pin": "1234"}, testes=erro(422, "IDADE_INVALIDA")),
        req("RN03 — saque maior que o saldo (422)", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Saque", "valor": 9999}, token="tokenCrianca", testes=erro(422, "SALDO_INSUFICIENTE")),
        req("RN05 — ultrapassar a meta (422)", "PATCH", "/objetivos/{{idObjetivo}}/adicionar", {"valor": 9999}, token="tokenCrianca", testes=erro(422, "META_EXCEDIDA")),
        req("RN08 — criança não deposita (403)", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Depósito", "valor": 10}, token="tokenCrianca", testes=erro(403)),
        req("RN08 — transferência para outra família (404)", "POST", "/transacoes",
            {"id_conta": "{{idConta}}", "tipo_transacao": "Transferência", "valor": 1, "id_conta_destino": "{{idContaOutraFamilia}}"},
            token="tokenCrianca", testes=erro(404)),
        req("RN12 — responsável vê filho de outra família (404)", "GET", "/usuarios/{{idUsuario}}", token="tokenOutraFamilia", testes=erro(404)),
        req("Valor negativo (422)", "POST", "/transacoes", {"id_conta": "{{idConta}}", "tipo_transacao": "Depósito", "valor": -3}, testes=erro(422)),
        req("Login com senha errada (401)", "POST", "/auth/login", {"email": "carlos@poupakids.com", "senha": "errada"}, token=None, testes=erro(401)),
    ]},
]

var = lambda k, v: {"key": k, "value": v, "type": "string"}
colecao = {
    "info": {
        "name": "PoupaKids API v2.1",
        "description": ("API REST do PoupaKids (6º período). Rode a API com `npm run demo` e execute as pastas na ordem — "
                        "os logins salvam os tokens automaticamente. IDs usam os dados do seed (joaozinho = usuário 1 / conta 1; "
                        "pedrinho = conta 2; conta 3 é de outra família)."),
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "item": itens,
    "variable": [
        var("baseUrl", "http://localhost:3333/api"),
        var("tokenResponsavel", ""), var("tokenCrianca", ""), var("tokenOutraFamilia", ""),
        var("idUsuario", "1"), var("idConta", "1"), var("idContaIrmao", "2"), var("idContaOutraFamilia", "3"),
        var("idObjetivo", ""), var("idConteudo", "1"), var("idUsuarioNovo", ""), var("cpfNovo", ""), var("emailNovo", ""),
    ],
}

saida = os.path.join(os.path.dirname(os.path.abspath(__file__)), "PoupaKids.postman_collection.json")
with open(saida, "w", encoding="utf-8") as f:
    json.dump(colecao, f, ensure_ascii=False, indent=2)
print(saida, sum(len(p["item"]) for p in itens), "requisições")
