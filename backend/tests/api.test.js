process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const seed = require('../src/database/seed');

let tokenPai; let tokenJoao; let tokenMaria;

const login = async (email) => (await request(app).post('/api/auth/login').send({ email, senha: 'poupa123' })).body.token;
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

beforeAll(async () => {
  await seed({ silencioso: true });
  tokenPai = await login('carlos@poupakids.com');
  tokenMaria = await login('maria@poupakids.com');
  tokenJoao = (await request(app).post('/api/auth/login-crianca').send({ apelido: 'joaozinho', pin: '1234' })).body.token;
});
afterAll(() => sequelize.close());

describe('Autenticação (RF01, RF10)', () => {
  test('registra responsável e devolve token', async () => {
    const r = await request(app).post('/api/auth/registrar').send({ nome: 'Ana Teste', cpf: '390.533.447-05', email: 'ana@teste.com', senha: 'segredo1' });
    expect(r.status).toBe(201);
    expect(r.body.token).toBeDefined();
    expect(r.body.usuario.senha_hash).toBeUndefined();
  });
  test('rejeita e-mail duplicado', async () => {
    const r = await request(app).post('/api/auth/registrar').send({ nome: 'Outro', cpf: '123.456.789-09', email: 'carlos@poupakids.com', senha: 'segredo1' });
    expect(r.status).toBe(409);
  });
  test('login com senha errada → 401', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'carlos@poupakids.com', senha: 'errada' });
    expect(r.status).toBe(401);
  });
  test('rotas protegidas exigem token', async () => {
    expect((await request(app).get('/api/usuarios')).status).toBe(401);
    expect((await request(app).get('/api/usuarios').set(bearer('token-invalido'))).status).toBe(401);
  });
});

describe('Usuários (RN01, RN02, RN12)', () => {
  test('RN01: rejeita idade >= 18', async () => {
    const r = await request(app).post('/api/usuarios').set(bearer(tokenPai)).send({ nome: 'Adulto', idade: 18, apelido: 'adulto', pin: '1234' });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('IDADE_INVALIDA');
  });
  test('RN02: cria conta zerada e gamificação nível 1', async () => {
    const r = await request(app).post('/api/usuarios').set(bearer(tokenPai)).send({ nome: 'Lia Silva', idade: 7, apelido: 'lia', pin: '2222', limite_mesada: 50 });
    expect(r.status).toBe(201);
    expect(r.body.conta.saldo).toBe(0);
    expect(r.body.gamificacao.nivel).toBe(1);
    expect(r.body.gamificacao.pontos).toBe(0);
  });
  test('RN12: responsável não vê filho de outra família', async () => {
    const r = await request(app).get('/api/usuarios/1').set(bearer(tokenMaria));
    expect(r.status).toBe(404);
  });
  test('criança não lista usuários', async () => {
    expect((await request(app).get('/api/usuarios').set(bearer(tokenJoao))).status).toBe(403);
  });
});

describe('Transações (RN03, RN04, RN08)', () => {
  test('RN08: criança não pode depositar', async () => {
    const r = await request(app).post('/api/transacoes').set(bearer(tokenJoao)).send({ id_conta: 1, tipo_transacao: 'Depósito', valor: 10 });
    expect(r.status).toBe(403);
  });
  test('RN04: depósito do responsável atualiza saldo e gera registro', async () => {
    const antes = (await request(app).get('/api/usuarios/1').set(bearer(tokenPai))).body.conta.saldo;
    const r = await request(app).post('/api/transacoes').set(bearer(tokenPai)).send({ id_conta: 1, tipo_transacao: 'Depósito', valor: 20 });
    expect(r.status).toBe(201);
    expect(r.body.saldo).toBeCloseTo(antes + 20);
    const hist = await request(app).get('/api/transacoes/conta/1').set(bearer(tokenPai));
    expect(hist.body.transacoes[0].valor).toBe(20);
  });
  test('RN03: saque maior que o saldo é rejeitado e saldo não muda', async () => {
    const antes = (await request(app).get('/api/usuarios/1').set(bearer(tokenJoao))).body.conta.saldo;
    const r = await request(app).post('/api/transacoes').set(bearer(tokenJoao)).send({ id_conta: 1, tipo_transacao: 'Saque', valor: antes + 1 });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('SALDO_INSUFICIENTE');
    const depois = (await request(app).get('/api/usuarios/1').set(bearer(tokenJoao))).body.conta.saldo;
    expect(depois).toBe(antes);
  });
  test('transferência entre irmãos debita e credita atomicamente', async () => {
    const r = await request(app).post('/api/transacoes').set(bearer(tokenJoao)).send({ id_conta: 1, tipo_transacao: 'Transferência', valor: 5, id_conta_destino: 2 });
    expect(r.status).toBe(201);
    const hist = await request(app).get('/api/transacoes/conta/2').set(bearer(tokenPai));
    expect(hist.body.transacoes[0].direcao).toBe('entrada');
  });
  test('RN08: transferência para outra família é rejeitada', async () => {
    const r = await request(app).post('/api/transacoes').set(bearer(tokenJoao)).send({ id_conta: 1, tipo_transacao: 'Transferência', valor: 1, id_conta_destino: 3 });
    expect(r.status).toBe(404);
  });
  test('valor inválido → 422', async () => {
    const r = await request(app).post('/api/transacoes').set(bearer(tokenPai)).send({ id_conta: 1, tipo_transacao: 'Depósito', valor: -3 });
    expect(r.status).toBe(422);
  });
});

describe('Mesada (RN07)', () => {
  test('mesada paga uma única vez por mês', async () => {
    const primeira = await request(app).post('/api/usuarios/2/mesada/pagar').set(bearer(tokenPai));
    expect(primeira.status).toBe(201);
    expect(primeira.body.transacao.valor).toBe(100);
    const segunda = await request(app).post('/api/usuarios/2/mesada/pagar').set(bearer(tokenPai));
    expect(segunda.status).toBe(409);
    expect(segunda.body.codigo).toBe('MESADA_JA_PAGA');
  });
});

describe('Objetivos e gamificação (RN05, RN06, RN09)', () => {
  let idMeta;
  test('criança cria meta', async () => {
    const r = await request(app).post('/api/objetivos').set(bearer(tokenJoao)).send({ descricao: 'Bola', valor_meta: 10 });
    expect(r.status).toBe(201);
    idMeta = r.body.id_objetivo;
  });
  test('RN05: não permite ultrapassar a meta', async () => {
    const r = await request(app).patch(`/api/objetivos/${idMeta}/adicionar`).set(bearer(tokenJoao)).send({ valor: 11 });
    expect(r.status).toBe(422);
    expect(r.body.codigo).toBe('META_EXCEDIDA');
  });
  test('RN09 + RN06: guardar debita o saldo e concluir dá +100 pontos', async () => {
    const antes = (await request(app).get('/api/usuarios/1').set(bearer(tokenJoao))).body;
    const r = await request(app).patch(`/api/objetivos/${idMeta}/adicionar`).set(bearer(tokenJoao)).send({ valor: 10 });
    expect(r.status).toBe(200);
    expect(r.body.meta_concluida).toBe(true);
    expect(r.body.saldo).toBeCloseTo(antes.conta.saldo - 10);
    expect(r.body.gamificacao.pontos).toBe(antes.gamificacao.pontos + 105);
  });
});

describe('Conteúdos (RF09, RN10)', () => {
  test('lista por nível', async () => {
    const r = await request(app).get('/api/conteudos?nivel=Avançado').set(bearer(tokenJoao));
    expect(r.status).toBe(200);
    expect(r.body.every((c) => c.nivel === 'Avançado')).toBe(true);
  });
  test('RN10: pontos do conteúdo concedidos uma única vez', async () => {
    const r1 = await request(app).post('/api/conteudos/10/concluir').set(bearer(tokenJoao));
    const r2 = await request(app).post('/api/conteudos/10/concluir').set(bearer(tokenJoao));
    expect(r1.body.pontos_ganhos).toBeGreaterThan(0);
    expect(r2.body.ja_concluido).toBe(true);
    expect(r2.body.pontos_ganhos).toBe(0);
  });
});
