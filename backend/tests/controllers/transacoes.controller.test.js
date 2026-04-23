'use strict';

require('../setup');
require('../mocks/models.mock');

const { mockResponse } = require('../helpers/mockResponse');
const { Conta, Transacao } = require('../../src/models');
const controller = require('../../src/controllers/transacoes.controller');

describe('transacoes.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  function novaConta(saldo, id = 1) {
    return { id_conta: id, saldo, reload: jest.fn().mockResolvedValue() };
  }

  it('cria depósito com sucesso', async () => {
    const conta = novaConta(100);
    conta.reload.mockImplementation(async () => {
      conta.saldo = 150;
    });
    Conta.findByPk.mockResolvedValue(conta);
    Transacao.create.mockResolvedValue({ id_transacao: 1, valor: 50 });

    const req = { body: { id_conta: 1, tipo_transacao: 'Deposito', valor: 50 } };
    const res = mockResponse();
    const next = jest.fn();

    await controller.criar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Transacao.create).toHaveBeenCalled();
  });

  it('permite saque dentro do saldo', async () => {
    const conta = novaConta(100);
    Conta.findByPk.mockResolvedValue(conta);
    Transacao.create.mockResolvedValue({ id_transacao: 2 });

    const req = { body: { id_conta: 1, tipo_transacao: 'Saque', valor: 40 } };
    const res = mockResponse();
    const next = jest.fn();

    await controller.criar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('bloqueia saque maior que saldo', async () => {
    Conta.findByPk.mockResolvedValue(novaConta(10));
    const req = { body: { id_conta: 1, tipo_transacao: 'Saque', valor: 500 } };
    const res = mockResponse();
    const next = jest.fn();

    await controller.criar(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 422, code: 'INSUFFICIENT_BALANCE' }),
    );
  });

  it('executa transferência', async () => {
    const origem = novaConta(200, 1);
    const destino = novaConta(0, 2);
    Conta.findByPk.mockImplementation((id) => (id === 1 ? origem : destino));
    Transacao.create.mockResolvedValue({ id_transacao: 3 });

    const req = {
      body: { id_conta: 1, tipo_transacao: 'Transferencia', valor: 50, id_conta_destino: 2 },
    };
    const res = mockResponse();
    const next = jest.fn();

    await controller.criar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('lista transações paginadas', async () => {
    Transacao.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id_transacao: 1 }] });

    const req = { params: { contaId: 1 }, query: {} };
    const res = mockResponse();
    const next = jest.fn();

    await controller.listar(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, total: 1, data: expect.any(Array) }),
    );
  });
});
