'use strict';

const { Meta } = require('../models');
const ApiError = require('../utils/ApiError');

async function listar(req, res, next) {
  try {
    const metas = await Meta.findAll({
      where: { id_usuario: req.params.usuarioId },
      order: [['data_criacao', 'DESC']],
    });
    return res.json(metas);
  } catch (err) {
    return next(err);
  }
}

async function criar(req, res, next) {
  try {
    const meta = await Meta.create(req.body);
    return res.status(201).json(meta);
  } catch (err) {
    return next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const meta = await Meta.findByPk(req.params.id);
    if (!meta) throw ApiError.notFound('Meta não encontrada');
    await meta.update(req.body);

    const atingiu =
      parseFloat(meta.valor_atual) >= parseFloat(meta.valor_meta) && meta.status === 'ativa';
    if (atingiu) {
      await meta.update({ status: 'concluida' });
    }
    return res.json(meta);
  } catch (err) {
    return next(err);
  }
}

async function remover(req, res, next) {
  try {
    const meta = await Meta.findByPk(req.params.id);
    if (!meta) throw ApiError.notFound('Meta não encontrada');
    await meta.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, criar, atualizar, remover };
