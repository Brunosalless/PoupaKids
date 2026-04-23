'use strict';

const Joi = require('joi');

const atualizarSchema = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  telefone: Joi.string().max(20).optional(),
  endereco: Joi.string().max(200).optional(),
}).min(1);

module.exports = { atualizarSchema };
