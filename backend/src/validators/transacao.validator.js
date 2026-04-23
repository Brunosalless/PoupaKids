'use strict';

const Joi = require('joi');

const criarSchema = Joi.object({
  id_conta: Joi.number().integer().required(),
  tipo_transacao: Joi.string().valid('Deposito', 'Saque', 'Transferencia').required(),
  valor: Joi.number().positive().precision(2).required(),
  categoria: Joi.string().max(50).optional(),
  descricao: Joi.string().max(200).optional(),
  id_conta_destino: Joi.number().integer().when('tipo_transacao', {
    is: 'Transferencia',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

module.exports = { criarSchema };
