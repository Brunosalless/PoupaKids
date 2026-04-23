'use strict';

const { Gamificacao, Conquista } = require('../models');
const ApiError = require('../utils/ApiError');

const PONTOS_POR_NIVEL = 100;

async function obter(req, res, next) {
  try {
    const { usuarioId } = req.params;
    const gami = await Gamificacao.findOne({ where: { id_usuario: usuarioId } });
    if (!gami) throw ApiError.notFound('Gamificação não encontrada');

    const conquistas = await Conquista.findAll({
      where: { id_usuario: usuarioId },
      order: [['desbloqueada_em', 'DESC']],
    });

    return res.json({
      nivel: gami.nivel,
      pontos: gami.pontos,
      proximoNivel: gami.nivel * PONTOS_POR_NIVEL,
      conquistas,
    });
  } catch (err) {
    return next(err);
  }
}

async function adicionarPontos(req, res, next) {
  try {
    const { usuarioId } = req.params;
    const { pontos } = req.body;
    const gami = await Gamificacao.findOne({ where: { id_usuario: usuarioId } });
    if (!gami) throw ApiError.notFound('Gamificação não encontrada');

    const novosPontos = gami.pontos + pontos;
    const novoNivel = Math.max(1, Math.floor(novosPontos / PONTOS_POR_NIVEL) + 1);
    await gami.update({ pontos: novosPontos, nivel: novoNivel });

    return res.json({ nivel: gami.nivel, pontos: gami.pontos });
  } catch (err) {
    return next(err);
  }
}

module.exports = { obter, adicionarPontos };
