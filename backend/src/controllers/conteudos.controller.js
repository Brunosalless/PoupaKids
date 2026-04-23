'use strict';

const { Conteudo } = require('../models');

async function listar(req, res, next) {
  try {
    const where = {};
    if (req.query.nivel) where.nivel = req.query.nivel;
    const conteudos = await Conteudo.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
    return res.json(conteudos);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar };
