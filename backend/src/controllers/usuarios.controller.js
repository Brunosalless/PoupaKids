'use strict';

const { Usuario, Responsavel } = require('../models');
const ApiError = require('../utils/ApiError');
const { sanitizeUser } = require('../utils/sanitize');

function assertOwnership(req, id) {
  if (req.user.tipo === 'responsavel') return;
  if (String(req.user.id) !== String(id)) {
    throw ApiError.forbidden('Você só pode acessar seus próprios dados');
  }
}

async function obter(req, res, next) {
  try {
    assertOwnership(req, req.params.id);
    const Model = req.user.tipo === 'responsavel' ? Responsavel : Usuario;
    const user = await Model.findByPk(req.params.id);
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    return res.json(sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    assertOwnership(req, req.params.id);
    const Model = req.user.tipo === 'responsavel' ? Responsavel : Usuario;
    const user = await Model.findByPk(req.params.id);
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    await user.update(req.body);
    return res.json(sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
}

async function remover(req, res, next) {
  try {
    assertOwnership(req, req.params.id);
    const Model = req.user.tipo === 'responsavel' ? Responsavel : Usuario;
    const user = await Model.findByPk(req.params.id);
    if (!user) throw ApiError.notFound('Usuário não encontrado');
    await user.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { obter, atualizar, remover };
