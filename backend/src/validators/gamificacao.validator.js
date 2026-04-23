'use strict';

const Joi = require('joi');

const pontosSchema = Joi.object({
  pontos: Joi.number().integer().positive().required(),
  motivo: Joi.string().max(100).optional(),
});

module.exports = { pontosSchema };
