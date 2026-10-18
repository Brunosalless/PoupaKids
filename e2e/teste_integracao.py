# Teste ponta a ponta da integração frontend ↔ backend (Playwright/Python).
# Pré-requisitos: pip install playwright && playwright install chromium; API rodando com "npm run seed && npm start".
# Executa os fluxos reais do responsável e da criança, registra as chamadas /api e salva capturas em e2e/capturas/.
import json, re
from playwright.sync_api import sync_playwright, expect
B="http://localhost:3333"; import os; S=os.path.join(os.path.dirname(os.path.abspath(__file__)),"capturas")+"/"; os.makedirs(S,exist_ok=True)
log=[]
with sync_playwright() as p:
    br=p.chromium.launch()
    pg=br.new_page(viewport={"width":1280,"height":820}, device_scale_factor=1.5)
    errs=[]; pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
    def shot(path, **kw):
        if not any(k in path for k in ("05_","08_","09_")):
            pg.evaluate("()=>{const t=document.querySelector('.toasts'); if(t) t.style.visibility='hidden'}")
        pg.screenshot(path=path, **kw)
        pg.evaluate("()=>{const t=document.querySelector('.toasts'); if(t) t.style.visibility=''}")
    def track(r):
        if "/api/" in r.url: log.append(f"{r.request.method} {r.url.replace(B,'')} -> {r.status}")
    pg.on("response", track)
    pg.goto(B); pg.wait_for_selector("text=Sou responsável")
    shot(S+"01_login.png")
    pg.click("text=Sou responsável")
    pg.fill("input[type=email]","carlos@poupakids.com"); pg.fill("input[type=password]","poupa123")
    with pg.expect_response(lambda r: "/api/auth/login" in r.url) as resp: pg.click("button:has-text('Entrar')")
    login_body=resp.value.json()
    pg.wait_for_selector("text=Meus filhos"); pg.wait_for_timeout(400)
    shot(S+"02_painel_responsavel.png", full_page=True)
    # pagar mesada do Pedrinho
    card=pg.locator("[data-testid=filho-pedrinho]")
    card.locator("button:has-text('Pagar mesada')").click()
    pg.wait_for_selector("text=Mesada de"); pg.wait_for_timeout(500)
    expect(card.locator("button:has-text('Mesada paga')")).to_be_visible()
    # depósito para Joãozinho
    pg.locator("[data-testid=filho-joaozinho] button:has-text('Depositar')").click()
    pg.fill(".modal input[type=number]","15"); pg.fill(".modal input[placeholder^='ex.']","Ajudou a lavar o carro")
    shot(S+"03_modal_deposito.png")
    with pg.expect_response(lambda r: "/api/transacoes" in r.url and r.request.method=="POST") as resp: pg.click(".modal button:has-text('Confirmar')")
    dep_req=resp.value.request.post_data; dep_body=resp.value.json(); dep_status=resp.value.status
    pg.wait_for_timeout(600)
    shot(S+"04_painel_pos_deposito.png")
    # tentativa inválida: saque maior que saldo -> erro da API exibido
    pg.locator("[data-testid=filho-aninha]").count()
    pg.locator("[data-testid=filho-pedrinho] button:has-text('Depositar')").click()
    pg.wait_for_timeout(4300); pg.click(".modal button:has-text('Saque')"); pg.fill(".modal input[type=number]","9999")
    with pg.expect_response(lambda r: "/api/transacoes" in r.url and r.request.method=="POST") as resp: pg.click(".modal button:has-text('Confirmar')")
    err_body=resp.value.json(); err_status=resp.value.status
    pg.wait_for_selector(".toast-erro"); shot(S+"05_erro_regra_negocio.png")
    pg.click(".modal .btn-icone")
    pg.locator("[data-testid=filho-joaozinho] button:has-text('Ver detalhes')").click()
    pg.wait_for_selector("text=Extrato"); pg.wait_for_timeout(500)
    shot(S+"06_detalhe_filho.png")
    pg.click(".modal .btn-icone"); pg.click("button:has-text('Sair')")
    # criança
    pg.wait_for_selector("text=Sou criança")
    pg.fill("input[autocomplete=username]","joaozinho"); pg.fill("input[type=password]","1234")
    pg.click("button:has-text('Entrar')"); pg.wait_for_selector("[data-testid=saldo]"); pg.wait_for_timeout(500)
    shot(S+"07_painel_crianca.png", full_page=True)
    saldo_antes=pg.inner_text("[data-testid=saldo]")
    pg.fill("input[aria-label='Valor para Bicicleta nova']","10")
    with pg.expect_response(lambda r: "/adicionar" in r.url) as resp: pg.click("article:has-text('Bicicleta nova') button:has-text('Guardar')")
    guard_body=resp.value.json()
    pg.wait_for_timeout(700); saldo_depois=pg.inner_text("[data-testid=saldo]")
    shot(S+"08_guardou_cofrinho.png")
    pg.wait_for_timeout(4300); pg.click("button:has-text('Aprender')"); pg.wait_for_selector("text=Moedas e notas do Real")
    pg.click("text=Moedas e notas do Real"); pg.click("button:has-text('Li e aprendi')")
    pg.wait_for_selector(".toast-ok"); pg.wait_for_timeout(400)
    shot(S+"09_conteudos.png")
    pg.click("button:has-text('Extrato')"); pg.wait_for_timeout(500)
    shot(S+"10_extrato_crianca.png")
    # mobile
    m=br.new_page(viewport={"width":390,"height":844}, device_scale_factor=2)
    m.goto(B); m.evaluate("t=>localStorage.setItem('poupakids.token',t)", login_body["token"]); m.goto(B+"/responsavel")
    m.wait_for_selector("text=Meus filhos"); m.wait_for_timeout(400); m.screenshot(path=S+"11_mobile.png")
    # sessão expirada / token inválido
    m.evaluate("()=>localStorage.setItem('poupakids.token','invalido')"); m.goto(B+"/responsavel"); m.wait_for_selector("text=Sou criança")
    br.close()
out=dict(console_errors=errs, log=log, deposito_req=dep_req, deposito_status=dep_status, deposito_resp=dep_body,
         erro_status=err_status, erro_resp=err_body, saldo_antes=saldo_antes, saldo_depois=saldo_depois,
         guarda=dict(pontos=guard_body["pontos_ganhos"], saldo=guard_body["saldo"]), login_keys=list(login_body.keys()))
json.dump(out, open(S+"resultado.json","w"), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1)[:3500])
