'use strict';

const { Conta } = require('../models');
const ApiError = require('../utils/ApiError');

async function obter(req, res, next) {
  try {
    const conta = await Conta.findByPk(req.params.id);
    if (!conta) throw ApiError.notFound('Conta não encontrada');
    return res.json(conta);
  } catch (err) {
    return next(err);
  }
}

async function obterPorUsuario(req, res, next) {
  try {
    const conta = await Conta.findOne({ where: { id_usuario: req.params.idUsuario } });
    if (!conta) throw ApiError.notFound('Conta do usuário não encontrada');
    return res.json(conta);
  } catch (err) {
    return next(err);
  }
}

module.exports = { obter, obterPorUsuario };
