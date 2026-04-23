'use strict';

require('../setup');
require('../mocks/models.mock');

const { mockResponse } = require('../helpers/mockResponse');
const { Meta } = require('../../src/models');
const controller = require('../../src/controllers/metas.controller');

describe('metas.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lista metas de um usuário', async () => {
    Meta.findAll.mockResolvedValue([{ id_meta: 1 }]);
    const req = { params: { usuarioId: 10 } };
    const res = mockResponse();
    await controller.listar(req, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith([{ id_meta: 1 }]);
  });

  it('cria meta', async () => {
    Meta.create.mockResolvedValue({ id_meta: 99 });
    const req = { body: { id_usuario: 10, descricao: 'Bike', valor_meta: 500 } };
    const res = mockResponse();
    await controller.criar(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('atualiza progresso e marca como concluida ao atingir meta', async () => {
    const meta = {
      id_meta: 1,
      valor_atual: 0,
      valor_meta: 100,
      status: 'ativa',
      update: jest.fn().mockImplementation(async function (data) {
        Object.assign(this, data);
      }),
    };
    Meta.findByPk.mockResolvedValue(meta);
    const req = { params: { id: 1 }, body: { valor_atual: 100 } };
    const res = mockResponse();
    await controller.atualizar(req, res, jest.fn());
    expect(meta.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'concluida' }));
  });

  it('remove meta', async () => {
    const meta = { destroy: jest.fn() };
    Meta.findByPk.mockResolvedValue(meta);
    const req = { params: { id: 1 } };
    const res = mockResponse();
    await controller.remover(req, res, jest.fn());
    expect(meta.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('retorna 404 ao atualizar meta inexistente', async () => {
    Meta.findByPk.mockResolvedValue(null);
    const req = { params: { id: 999 }, body: { valor_atual: 10 } };
    const res = mockResponse();
    const next = jest.fn();
    await controller.atualizar(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
