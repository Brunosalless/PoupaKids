'use strict';

const { Transacao, Conta, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

async function criar(req, res, next) {
  const { id_conta, tipo_transacao, valor, categoria, descricao, id_conta_destino } = req.body;
  try {
    const conta = await Conta.findByPk(id_conta);
    if (!conta) throw ApiError.notFound('Conta não encontrada');

    if (tipo_transacao === 'Saque' || tipo_transacao === 'Transferencia') {
      const saldoAtual = parseFloat(conta.saldo);
      if (saldoAtual < parseFloat(valor)) {
        throw ApiError.insufficientBalance();
      }
    }

    if (tipo_transacao === 'Transferencia') {
      const contaDestino = await Conta.findByPk(id_conta_destino);
      if (!contaDestino) throw ApiError.notFound('Conta destino não encontrada');
      if (contaDestino.id_conta === conta.id_conta) {
        throw ApiError.badRequest('Conta destino deve ser diferente da origem');
      }
    }

    const result = await sequelize.transaction(async (t) => {
      const tx = await Transacao.create(
        { id_conta, tipo_transacao, valor, categoria, descricao, id_conta_destino },
        { transaction: t },
      );
      await conta.reload({ transaction: t });
      return { transacao: tx, saldo: conta.saldo };
    });

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { contaId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;

    const where = { id_conta: contaId };
    if (req.query.tipo) where.tipo_transacao = req.query.tipo;

    const { count, rows } = await Transacao.findAndCountAll({
      where,
      order: [['data_transacao', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { criar, listar };
