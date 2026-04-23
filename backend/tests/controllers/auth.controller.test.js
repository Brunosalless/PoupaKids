'use strict';

require('../setup');
require('../mocks/models.mock');

const { mockResponse } = require('../helpers/mockResponse');
const { Responsavel, Usuario, Conta, Gamificacao } = require('../../src/models');
const controller = require('../../src/controllers/auth.controller');

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register (responsavel)', () => {
    it('cria responsável e retorna token', async () => {
      Responsavel.findOne.mockResolvedValue(null);
      Responsavel.create.mockResolvedValue({
        id_responsavel: 1,
        nome: 'Ana',
        email: 'ana@ex.com',
        get: () => ({ id_responsavel: 1, nome: 'Ana', email: 'ana@ex.com', senha_hash: 'x' }),
      });

      const req = {
        body: {
          tipo: 'responsavel',
          nome: 'Ana',
          email: 'ana@ex.com',
          senha: '123456',
          cpf: '111.222.333-44',
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) }),
      );
    });

    it('retorna 409 quando email já existe', async () => {
      Responsavel.findOne.mockResolvedValue({ id_responsavel: 1 });
      const req = {
        body: { tipo: 'responsavel', nome: 'Ana', email: 'a@a.com', senha: '123456', cpf: 'x' },
      };
      const res = mockResponse();
      const next = jest.fn();

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 409, code: 'CONFLICT' }),
      );
    });
  });

  describe('register (usuario)', () => {
    it('rejeita idade >= 18', async () => {
      const req = {
        body: {
          tipo: 'usuario',
          nome: 'X',
          email: 'x@x.com',
          senha: '123456',
          data_nascimento: '2000-01-01',
          id_responsavel: 1,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }),
      );
    });

    it('cria criança com conta e gamificação', async () => {
      Usuario.findOne.mockResolvedValue(null);
      Responsavel.findByPk.mockResolvedValue({ id_responsavel: 1 });
      Usuario.create.mockResolvedValue({
        id_usuario: 10,
        email: 'k@k.com',
        get: () => ({ id_usuario: 10, email: 'k@k.com', senha_hash: 'x' }),
      });
      Conta.create.mockResolvedValue({});
      Gamificacao.create.mockResolvedValue({});

      const anoNasc = new Date().getFullYear() - 10;
      const req = {
        body: {
          tipo: 'usuario',
          nome: 'Kid',
          email: 'k@k.com',
          senha: '123456',
          data_nascimento: `${anoNasc}-01-01`,
          id_responsavel: 1,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(Conta.create).toHaveBeenCalled();
      expect(Gamificacao.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('retorna token com credenciais válidas', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('123456', 10);
      Responsavel.findOne.mockResolvedValue({
        id_responsavel: 1,
        email: 'a@a.com',
        senha_hash: hash,
        get: () => ({ id_responsavel: 1, email: 'a@a.com', senha_hash: hash }),
      });

      const req = { body: { email: 'a@a.com', senha: '123456', tipo: 'responsavel' } };
      const res = mockResponse();
      const next = jest.fn();

      await controller.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) }),
      );
    });

    it('rejeita senha incorreta', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('outra', 10);
      Responsavel.findOne.mockResolvedValue({
        id_responsavel: 1,
        email: 'a@a.com',
        senha_hash: hash,
        get: () => ({ id_responsavel: 1, email: 'a@a.com', senha_hash: hash }),
      });

      const req = { body: { email: 'a@a.com', senha: 'errada', tipo: 'responsavel' } };
      const res = mockResponse();
      const next = jest.fn();

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' }),
      );
    });
  });
});
