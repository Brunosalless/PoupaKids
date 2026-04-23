'use strict';

const { Usuario, Conta, Meta, Gamificacao, Transacao } = require('../models');
const ApiError = require('../utils/ApiError');

async function listarFilhos(req, res, next) {
  try {
    if (String(req.user.id) !== String(req.params.id)) {
      throw ApiError.forbidden('Você só pode acessar seus próprios filhos');
    }
    const filhos = await Usuario.findAll({
      where: { id_responsavel: req.params.id },
      include: [
        { model: Conta, as: 'conta' },
        { model: Gamificacao, as: 'gamificacao' },
      ],
      order: [['nome', 'ASC']],
    });
    return res.json(filhos);
  } catch (err) {
    return next(err);
  }
}

async function resumoFilho(req, res, next) {
  try {
    if (String(req.user.id) !== String(req.params.id)) {
      throw ApiError.forbidden();
    }
    const filho = await Usuario.findOne({
      where: { id_usuario: req.params.idFilho, id_responsavel: req.params.id },
      include: [
        { model: Conta, as: 'conta' },
        { model: Gamificacao, as: 'gamificacao' },
        { model: Meta, as: 'metas' },
      ],
    });
    if (!filho) throw ApiError.notFound('Filho não encontrado');

    const transacoes = filho.conta
      ? await Transacao.findAll({
          where: { id_conta: filho.conta.id_conta },
          order: [['data_transacao', 'DESC']],
          limit: 5,
        })
      : [];

    return res.json({
      usuario: {
        id_usuario: filho.id_usuario,
        nome: filho.nome,
        email: filho.email,
        data_nascimento: filho.data_nascimento,
      },
      saldo: filho.conta ? filho.conta.saldo : 0,
      gamificacao: filho.gamificacao,
      metas: filho.metas,
      ultimasTransacoes: transacoes,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listarFilhos, resumoFilho };
