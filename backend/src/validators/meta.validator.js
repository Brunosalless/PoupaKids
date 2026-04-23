'use strict';

const Joi = require('joi');

const criarSchema = Joi.object({
  id_usuario: Joi.number().integer().required(),
  descricao: Joi.string().min(2).max(150).required(),
  valor_meta: Joi.number().positive().precision(2).required(),
});

const atualizarSchema = Joi.object({
  valor_atual: Joi.number().min(0).precision(2).optional(),
  status: Joi.string().valid('ativa', 'concluida', 'cancelada').optional(),
  descricao: Joi.string().min(2).max(150).optional(),
  valor_meta: Joi.number().positive().precision(2).optional(),
}).min(1);

module.exports = { criarSchema, atualizarSchema };
