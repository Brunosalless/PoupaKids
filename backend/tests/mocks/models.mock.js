'use strict';

jest.mock('../../src/models', () => {
  const runTx = async (cb) => cb({});
  return {
    sequelize: { transaction: jest.fn(runTx) },
    Responsavel: {
      scope: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Usuario: {
      scope: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    },
    Conta: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Transacao: {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
    },
    Meta: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Gamificacao: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Conquista: { findAll: jest.fn() },
    Conteudo: { findAll: jest.fn() },
  };
});
